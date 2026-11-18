begin;
-- Os vínculos funcionais podem ser históricos. Somente a concessão explícita dá acesso.
create table aabb.vinculos_docentes (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  turma_id uuid not null,
  professor_id uuid not null,
  tipo text not null check (tipo in ('titular','substituto','adicional')),
  inicio date, fim date, fonte text,
  check (fim >= inicio),
  unique (id,unidade_id),
  foreign key (turma_id,unidade_id) references aabb.turmas(id,unidade_id),
  foreign key (professor_id,unidade_id) references aabb.professores(id,unidade_id)
);

create table aabb.autorizacoes_docentes (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  vinculo_id uuid not null,
  inicio date not null, fim date, revogada_em timestamptz,
  check (fim >= inicio),
  foreign key (vinculo_id,unidade_id) references aabb.vinculos_docentes(id,unidade_id)
);
create index on aabb.vinculos_docentes(turma_id,professor_id);
create index on aabb.autorizacoes_docentes(vinculo_id) where revogada_em is null;

create table aabb.chamadas (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null, turma_id uuid not null, data date not null,
  versao integer not null default 0 check (versao >= 0),
  aberta_por uuid not null references auth.users(id),
  concluida_em timestamptz, concluida_por uuid references auth.users(id),
  check ((concluida_em is null) = (concluida_por is null)),
  unique (id,unidade_id), unique (turma_id,data),
  foreign key (turma_id,unidade_id) references aabb.turmas(id,unidade_id)
);

create table aabb.presencas (
  id uuid primary key default gen_random_uuid(), unidade_id uuid not null,
  chamada_id uuid not null, matricula_id uuid not null,
  marca text check (marca in ('presente','ausente')), justificativa text,
  check (justificativa is null or (marca is not distinct from 'ausente' and btrim(justificativa) <> '')),
  unique(chamada_id,matricula_id), unique(id,unidade_id),
  foreign key(chamada_id,unidade_id) references aabb.chamadas(id,unidade_id),
  foreign key(matricula_id,unidade_id) references aabb.matriculas(id,unidade_id)
);

create table aabb.correcoes_frequencia (
  id uuid primary key default gen_random_uuid(), unidade_id uuid not null,
  presenca_id uuid not null, autor uuid not null references auth.users(id),
  instante timestamptz not null default clock_timestamp(), motivo text not null check (btrim(motivo) <> ''),
  marca_anterior text not null, marca_nova text not null,
  justificativa_anterior text, justificativa_nova text,
  foreign key(presenca_id,unidade_id) references aabb.presencas(id,unidade_id)
);
create table aabb.permissoes_correcao (
  id uuid primary key default gen_random_uuid(), unidade_id uuid not null,
  chamada_id uuid not null, professor_id uuid not null,
  ate date not null, utilizada_em timestamptz,
  foreign key(chamada_id,unidade_id) references aabb.chamadas(id,unidade_id),
  foreign key(professor_id,unidade_id) references aabb.professores(id,unidade_id)
);

create table aabb.requisicoes_frequencia (
  id uuid primary key default gen_random_uuid(), unidade_id uuid not null references aabb.unidades(id),
  autor uuid not null references auth.users(id), chave uuid not null, assinatura bytea not null,
  versao integer not null, unique(autor,chave)
);

create function aabb.professor_autorizado(p_turma uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from aabb.vinculos_docentes v
  join aabb.autorizacoes_docentes a on a.vinculo_id=v.id
  join aabb.professores p on p.id=v.professor_id
  where v.turma_id=p_turma and p.conta_id=auth.uid()
    and aabb.tem_funcao(v.unidade_id,array['professor'])
    and a.revogada_em is null
    and aabb.hoje(v.unidade_id) between a.inicio and coalesce(a.fim,'infinity'::date)
    and (v.inicio is null or v.inicio<=aabb.hoje(v.unidade_id))
    and (v.fim is null or v.fim>=aabb.hoje(v.unidade_id))
  limit 1
$$;

create function aabb_api.autorizar_docente(p_vinculo uuid,p_inicio date,p_fim date)
returns uuid language plpgsql security definer set search_path='' as $$
declare v aabb.vinculos_docentes; resultado uuid;
begin
  select * into v from aabb.vinculos_docentes where id=p_vinculo;
  if not coalesce(aabb.admin(v.unidade_id),false) then raise insufficient_privilege; end if;
  if current_setting('transaction_isolation') <> 'read committed' then raise exception 'O comando requer READ COMMITTED'; end if;
  perform 1 from aabb.turmas where id=v.turma_id for update;
  if v.tipo='titular' and exists(
    select 1 from aabb.autorizacoes_docentes a join aabb.vinculos_docentes outro on outro.id=a.vinculo_id
    where outro.turma_id=v.turma_id and outro.tipo='titular' and a.revogada_em is null
      and daterange(a.inicio,a.fim,'[]') && daterange(p_inicio,p_fim,'[]')
  ) then raise exception 'Já existe titular autorizado no período'; end if;
  insert into aabb.autorizacoes_docentes(unidade_id,vinculo_id,inicio,fim)
    values(v.unidade_id,v.id,p_inicio,p_fim) returning id into resultado;
  return resultado;
end $$;

create function aabb_api.revogar_docente(p_autorizacao uuid) returns void
language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
  select unidade_id into u from aabb.autorizacoes_docentes where id=p_autorizacao;
  if not coalesce(aabb.admin(u),false) then raise insufficient_privilege; end if;
  update aabb.autorizacoes_docentes set revogada_em=clock_timestamp()
    where id=p_autorizacao and revogada_em is null;
end $$;

create function aabb_api.minhas_turmas() returns table(turma_id uuid,oficina_id uuid,ano integer,turno text)
language sql stable security definer set search_path='' as $$
  select t.id,t.oficina_id,t.ano,t.turno::text from aabb.turmas t
    where aabb.professor_autorizado(t.id) is not null
$$;

create function aabb_api.alunos_docentes(p_turma uuid,p_data date)
returns table(matricula_id uuid, aluno_id uuid, nome text,nascimento date,escola text,ano_escolar text,
  endereco text,bairro text,responsaveis jsonb)
language plpgsql stable security definer set search_path='' as $$
begin
  if aabb.professor_autorizado(p_turma) is null then raise insufficient_privilege; end if;
  return query
  select e.matricula_id,s.id,s.nome,s.nascimento,s.escola,s.ano_escolar::text,s.endereco,s.bairro,
    coalesce((select jsonb_agg(jsonb_build_object('nome',r.nome,'telefone',r.telefone) order by r.id)
      from aabb.aluno_responsavel ar join aabb.responsaveis r on r.id=ar.responsavel_id
      where ar.aluno_id=s.id),'[]'::jsonb)
  from aabb.elegiveis(p_turma,p_data) e join aabb.alunos s on s.id=e.aluno_id;
end $$;

create function aabb_api.historico_chamadas(p_turma uuid)
returns table(chamada_id uuid,data date,versao integer,concluida boolean,matricula_id uuid,nome text,marca text,justificativa text)
language plpgsql stable security definer set search_path='' as $$
begin
  if aabb.professor_autorizado(p_turma) is null then raise insufficient_privilege; end if;
  return query select c.id,c.data,c.versao,c.concluida_em is not null,p.matricula_id,s.nome,p.marca,p.justificativa
    from aabb.chamadas c left join aabb.presencas p on p.chamada_id=c.id
    left join aabb.matriculas m on m.id=p.matricula_id left join aabb.alunos s on s.id=m.aluno_id
    where c.turma_id=p_turma order by c.data,s.nome,m.id;
end $$;

create or replace function aabb.validar_movimento_chamada(p_turma uuid,p_data date)
returns void language plpgsql set search_path='' as $$
begin
  if exists(select 1 from aabb.chamadas where turma_id=p_turma and data>=p_data and concluida_em is not null)
    then raise exception 'Movimento atingiria chamada concluída. Revisão administrativa necessária'; end if;
end $$;

-- O lock da turma é compartilhado com os comandos de matrícula e calendário.
-- Versão zero cria a chamada. O cliente envia o conjunto nominal completo a cada gravação.
create function aabb_api.gravar_chamada(p_turma uuid,p_data date,p_versao integer,p_itens jsonb,
  p_concluir boolean,p_chave uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare t aabb.turmas; c aabb.chamadas; r aabb.requisicoes_frequencia; assinatura bytea;
begin
  if aabb.professor_autorizado(p_turma) is null then raise insufficient_privilege; end if;
  if current_setting('transaction_isolation') <> 'read committed' then raise exception 'O comando requer READ COMMITTED'; end if;
  select * into strict t from aabb.turmas where id=p_turma for update;
  if aabb.professor_autorizado(p_turma) is null then raise insufficient_privilege; end if;
  assinatura := sha256(convert_to(jsonb_build_array('gravar',p_turma,p_data,p_versao,p_itens,p_concluir)::text,'UTF8'));
  select * into r from aabb.requisicoes_frequencia where autor=auth.uid() and chave=p_chave;
  if found then
    if r.assinatura<>assinatura then raise exception 'Requisição divergente'; end if;
    return r.versao;
  end if;
  if t.estado<>'ativa' or p_data is null or p_data>aabb.hoje(t.unidade_id)
    or not coalesce(aabb.dia_atividade(p_turma,p_data),false) then raise exception 'Data sem atividade operacional'; end if;
  if p_concluir is null or jsonb_typeof(p_itens) is distinct from 'array' then raise exception 'Conferência nominal obrigatória'; end if;
  select * into c from aabb.chamadas where turma_id=p_turma and data=p_data;
  if not found then
    insert into aabb.chamadas(turma_id,unidade_id,data,aberta_por)
    values(t.id,t.unidade_id,p_data,auth.uid()) returning * into c;
  end if;
  if c.concluida_em is not null or c.versao is distinct from p_versao then raise exception 'Versão desatualizada ou chamada concluída'; end if;
  if exists (
    with lista as (select x.matricula_id from jsonb_to_recordset(p_itens) as x(matricula_id uuid)),
      esperados as (select e.matricula_id from aabb.elegiveis(p_turma,p_data) e)
    select 1 from lista full join esperados using(matricula_id)
      where lista.matricula_id is null or esperados.matricula_id is null
  ) or exists (select 1 from jsonb_to_recordset(p_itens) as x(matricula_id uuid)
    group by x.matricula_id having count(*) > 1)
    or exists (select 1 from jsonb_to_recordset(p_itens) as x(matricula_id uuid,marca text)
    where p_concluir and x.marca is null) then raise exception 'Reconferir alunos e marcações'; end if;
  -- Inclusões/saídas em rascunhos exigem que o cliente tenha reconferido a nova lista.
  delete from aabb.presencas p where p.chamada_id=c.id and not exists (
    select 1 from jsonb_to_recordset(p_itens) as x(matricula_id uuid) where x.matricula_id=p.matricula_id);
  insert into aabb.presencas(unidade_id,chamada_id,matricula_id,marca,justificativa)
  select t.unidade_id,c.id,x.matricula_id,x.marca,x.justificativa
    from jsonb_to_recordset(p_itens) as x(matricula_id uuid,marca text,justificativa text)
  on conflict(chamada_id,matricula_id) do update set marca=excluded.marca,justificativa=excluded.justificativa
    where (presencas.marca,presencas.justificativa) is distinct from (excluded.marca,excluded.justificativa);
  update aabb.chamadas set versao=versao+1,
    concluida_em=case when p_concluir then clock_timestamp() end,
    concluida_por=case when p_concluir then auth.uid() end where id=c.id returning versao into c.versao;
  insert into aabb.requisicoes_frequencia(unidade_id,autor,chave,assinatura,versao)
  values(t.unidade_id,auth.uid(),p_chave,assinatura,c.versao);
  return c.versao;
end $$;

create function aabb_api.permitir_correcao(p_chamada uuid,p_professor uuid,p_ate date) returns uuid
language plpgsql security definer set search_path='' as $$
declare c aabb.chamadas; resultado uuid;
begin
  select * into c from aabb.chamadas where id=p_chamada;
  if not coalesce(aabb.admin(c.unidade_id),false) then raise insufficient_privilege; end if;
  if c.concluida_em is null or p_ate<aabb.hoje(c.unidade_id) then raise exception 'Permissão inválida'; end if;
  insert into aabb.permissoes_correcao(unidade_id,chamada_id,professor_id,ate)
  values(c.unidade_id,c.id,p_professor,p_ate) returning id into resultado;
  return resultado;
end $$;

create function aabb_api.corrigir_frequencia(p_chamada uuid,p_matricula uuid,p_versao integer,
  p_marca text,p_justificativa text,p_motivo text,p_chave uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare c aabb.chamadas; t aabb.turmas; p aabb.presencas; professor uuid; permissao uuid;
  r aabb.requisicoes_frequencia; assinatura bytea;
begin
  select * into c from aabb.chamadas where id=p_chamada;
  professor:=aabb.professor_autorizado(c.turma_id);
  if professor is null then raise insufficient_privilege; end if;
  if current_setting('transaction_isolation') <> 'read committed' then raise exception 'O comando requer READ COMMITTED'; end if;
  select * into strict t from aabb.turmas where id=c.turma_id for update;
  if aabb.professor_autorizado(c.turma_id) is distinct from professor then raise insufficient_privilege; end if;
  select * into strict c from aabb.chamadas where id=p_chamada for update;
  assinatura:=sha256(convert_to(jsonb_build_array('corrigir',p_chamada,p_matricula,p_versao,p_marca,p_justificativa,p_motivo)::text,'UTF8'));
  select * into r from aabb.requisicoes_frequencia where autor=auth.uid() and chave=p_chave;
  if found then
    if r.assinatura<>assinatura then raise exception 'Requisição divergente'; end if;
    return r.versao;
  end if;
  if c.concluida_em is null or c.versao is distinct from p_versao then raise exception 'Chamada aberta ou versão desatualizada'; end if;
  if t.estado='encerrada' then
    select id into permissao from aabb.permissoes_correcao
      where chamada_id=c.id and professor_id=professor and utilizada_em is null and ate>=aabb.hoje(c.unidade_id)
      order by ate,id limit 1 for update;
    if permissao is null then raise insufficient_privilege; end if;
    update aabb.permissoes_correcao set utilizada_em=clock_timestamp() where id=permissao;
  elsif t.estado<>'ativa' then raise insufficient_privilege;
  end if;
  select * into strict p from aabb.presencas where chamada_id=c.id and matricula_id=p_matricula;
  if (p.marca,p.justificativa) is not distinct from (p_marca,p_justificativa) then raise exception 'Nenhuma alteração'; end if;
  insert into aabb.correcoes_frequencia(unidade_id,presenca_id,autor,motivo,marca_anterior,marca_nova,justificativa_anterior,justificativa_nova)
  values(c.unidade_id,p.id,auth.uid(),p_motivo,p.marca,p_marca,p.justificativa,p_justificativa);
  update aabb.presencas set marca=p_marca,justificativa=p_justificativa where id=p.id;
  update aabb.chamadas set versao=versao+1 where id=c.id returning versao into c.versao;
  insert into aabb.requisicoes_frequencia(unidade_id,autor,chave,assinatura,versao)
  values(c.unidade_id,auth.uid(),p_chave,assinatura,c.versao);
  return c.versao;
end $$;

commit;

