begin;
create schema aabb;
create schema aabb_api;
revoke all on schema aabb, aabb_api from public, anon, authenticated, service_role;
-- A API só recebe USAGE após a revisão dos privilégios na última migration.

create table aabb.unidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (btrim(nome) <> ''),
  fuso text not null
);
create function aabb.hoje(unidade uuid) returns date
language sql stable set search_path = '' as $$
  select (statement_timestamp() at time zone u.fuso)::date from aabb.unidades u where u.id = unidade
$$;

create table aabb.contas (
  id uuid primary key references auth.users(id),
  ativa boolean not null default false,
  troca_pendente boolean not null default true,
  login_posterior_a timestamptz not null default '-infinity'
);
-- Registro exclusivo do serviço confiável após comprovação do login e da troca.
-- A chave é o identificador da sessão Auth, nunca o JWT.
create table aabb.sessoes (
  id uuid primary key references auth.sessions(id) on delete cascade,
  conta_id uuid not null references aabb.contas(id),
  ultima_atividade timestamptz not null default clock_timestamp()
);
create table aabb.funcoes (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  conta_id uuid not null references aabb.contas,
  papel text not null check (papel in ('diretora','supervisora','administrador','professor')),
  ativa boolean not null default true,
  consulta_auditoria boolean not null default false check (not consulta_auditoria or papel='administrador'),
  unique(unidade_id,conta_id,papel)
);
create function aabb.sessao_valida() returns boolean
language sql stable security definer set search_path='' as $$
  select exists (
    select from aabb.contas c join aabb.sessoes s on s.conta_id=c.id
    join auth.sessions original on original.id=s.id and original.user_id=c.id
    where c.id=auth.uid() and c.ativa and not c.troca_pendente
      and s.id=nullif(auth.jwt()->>'session_id','')::uuid
      and original.created_at > c.login_posterior_a
      and original.created_at <= statement_timestamp()
      and s.ultima_atividade <= statement_timestamp()
      and statement_timestamp() < original.created_at + interval '8 hours'
      and statement_timestamp() < s.ultima_atividade + interval '30 minutes'
  )
$$;
create function aabb.tem_funcao(unidade uuid, funcoes text[]) returns boolean
language sql stable security definer set search_path='' as $$
  select aabb.sessao_valida() and exists (
    select from aabb.funcoes f where f.conta_id=auth.uid() and f.unidade_id=unidade
    and f.ativa and f.papel=any(funcoes))
$$;
create function aabb.admin(unidade uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select aabb.tem_funcao(unidade,array['diretora','supervisora','administrador'])
$$;
create function aabb.direcao(unidade uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select aabb.tem_funcao(unidade,array['diretora'])
$$;
create function aabb.pode_auditar(unidade uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select aabb.tem_funcao(unidade,array['diretora','supervisora']) or
    (aabb.tem_funcao(unidade,array['administrador']) and exists (
      select from aabb.funcoes f where f.unidade_id=unidade and f.conta_id=auth.uid()
      and f.ativa and f.consulta_auditoria and f.papel='administrador'))
$$;
create function aabb.invalidar_sessoes() returns trigger
language plpgsql set search_path='' as $$
begin
  if (new.ativa,new.troca_pendente) is distinct from (old.ativa,old.troca_pendente) then
    new.login_posterior_a := clock_timestamp();
  end if;
  if not new.ativa or new.troca_pendente then
    delete from aabb.sessoes where conta_id=new.id;
  end if;
  return new;
end $$;
create trigger invalidar before update on aabb.contas
for each row execute function aabb.invalidar_sessoes();

create table aabb.professores (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  conta_id uuid references aabb.contas,
  nome text not null check (btrim(nome)<>''),
  telefone text,
  unique(id,unidade_id), unique(unidade_id,conta_id)
);
create table aabb.alunos (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  nome text, nascimento date, escola text, ano_escolar text, endereco text,
  bairro text, cpf text, rg text, observacoes text,
  validado boolean not null default false,
  arquivado boolean not null default false,
  unique(id,unidade_id)
);
create table aabb.responsaveis (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  nome text, telefone text, unique(id,unidade_id)
);
create table aabb.aluno_responsavel (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null, aluno_id uuid not null, responsavel_id uuid not null,
  parentesco text, unique(aluno_id,responsavel_id),
  foreign key(aluno_id,unidade_id) references aabb.alunos(id,unidade_id),
  foreign key(responsavel_id,unidade_id) references aabb.responsaveis(id,unidade_id)
);
create function aabb.cadastro_completo(aluno uuid) returns boolean
language sql stable set search_path='' as $$
  select exists (
    select from aabb.alunos a join aabb.aluno_responsavel v on v.aluno_id=a.id
    join aabb.responsaveis r on r.id=v.responsavel_id
    where a.id=aluno and a.validado and not a.arquivado
      and btrim(a.nome)<>'' and a.nascimento is not null and btrim(r.nome)<>'' and btrim(r.telefone)<>'')
$$;

create table aabb.lotes_importacao (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  ano integer not null, fonte text not null, digest_fonte text not null,
  responsavel_id uuid not null references aabb.contas,
  unique(id,unidade_id), unique(unidade_id,ano,digest_fonte)
);
create table aabb.linhas_importacao (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null, unidade_id uuid not null, linha integer not null check(linha>0),
  estado text not null default 'pendente' check(estado in ('pendente','aprovada','rejeitada')),
  revisor_id uuid references aabb.contas, motivo text, aluno_id uuid,
  check(estado='pendente' or revisor_id is not null),
  check(estado<>'rejeitada' or nullif(btrim(motivo),'') is not null),
  foreign key(lote_id,unidade_id) references aabb.lotes_importacao(id,unidade_id),
  foreign key(aluno_id,unidade_id) references aabb.alunos(id,unidade_id),
  unique(lote_id,linha)
);

create table aabb.auditoria (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid references aabb.unidades, autor_id uuid, ator_sql name not null,
  instante timestamptz not null default clock_timestamp(), origem text not null,
  operacao text not null, entidade text not null, registro_id uuid not null,
  campos text[] not null, anterior jsonb, posterior jsonb, motivo text
);
create index auditoria_consulta on aabb.auditoria(unidade_id,instante desc);
revoke all on all functions in schema aabb from public, anon, authenticated, service_role;
commit;
