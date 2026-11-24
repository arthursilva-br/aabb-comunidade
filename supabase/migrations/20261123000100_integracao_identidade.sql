begin;

create table aabb.pessoas_funcionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (btrim(nome) <> '')
);
alter table aabb.pessoas_funcionais enable row level security;
revoke all on aabb.pessoas_funcionais from public,anon,authenticated,service_role;
create trigger trilha after insert or update or delete on aabb.pessoas_funcionais
for each row execute function aabb.auditar();

-- Os registros da implementação anterior podem continuar sem pessoa associada.
alter table aabb.contas
  add column pessoa_id uuid unique references aabb.pessoas_funcionais(id),
  add column versao_credencial integer not null default 0,
  add unique (id,pessoa_id);
alter table aabb.professores
  add column pessoa_id uuid references aabb.pessoas_funcionais(id),
  add unique (unidade_id,pessoa_id),
  add foreign key (conta_id,pessoa_id) references aabb.contas(id,pessoa_id);

create function aabb.sessao_operacional(p_conta uuid,p_sessao uuid) returns boolean
language sql stable set search_path='' as $$
  select exists (
    select from aabb.contas c join aabb.sessoes s on s.conta_id=c.id
    join auth.sessions original on original.id=s.id and original.user_id=c.id
    where c.id=p_conta and s.id=p_sessao and c.ativa and not c.troca_pendente
      and original.created_at > c.login_posterior_a
      and original.created_at <= statement_timestamp()
      and s.ultima_atividade <= statement_timestamp()
      and statement_timestamp() < original.created_at + interval '8 hours'
      and statement_timestamp() < s.ultima_atividade + interval '30 minutes'
  )
$$;
create or replace function aabb.sessao_valida() returns boolean
language sql stable security definer set search_path='' as $$
  select aabb.sessao_operacional(auth.uid(),nullif(auth.jwt()->>'session_id','')::uuid)
$$;

-- Remove a superfície legada depois da instalação com a Data API fechada.
drop function aabb_api.registrar_atividade();

-- Uma alteração feita diretamente no Auth também invalida o acesso operacional.
-- O banco nunca copia o hash para o schema da aplicação nem para a auditoria.
create function aabb.invalidar_por_credencial() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  update aabb.contas set versao_credencial=versao_credencial+1,
    login_posterior_a=clock_timestamp() where id=new.id;
  return null;
end $$;
create trigger aabb_invalidar_por_credencial after update of encrypted_password on auth.users
for each row when (old.encrypted_password is distinct from new.encrypted_password)
execute function aabb.invalidar_por_credencial();

create or replace function aabb.invalidar_sessoes() returns trigger
language plpgsql set search_path='' as $$
begin
  if (new.ativa,new.troca_pendente) is distinct from (old.ativa,old.troca_pendente) then
    new.login_posterior_a := clock_timestamp();
  end if;
  if not new.ativa or new.troca_pendente or new.versao_credencial<>old.versao_credencial then
    delete from aabb.sessoes where conta_id=new.id;
  end if;
  return new;
end $$;

create function aabb.identidade_por_email(p_email text)
returns table(id uuid, versao integer, troca_pendente boolean)
language sql stable set search_path='' as $$
  select c.id,c.versao_credencial,c.troca_pendente
  from aabb.contas c join auth.users u on u.id=c.id
  where u.email=p_email and c.ativa
$$;

create function aabb.admitir_login(p_conta uuid,p_sessao uuid,p_versao integer) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas where id=p_conta and versao_credencial=p_versao for update;
  if not found then raise insufficient_privilege; end if;
  if not exists(select from aabb.sessoes where id=p_sessao and conta_id=p_conta) then
    perform aabb.abrir_sessao_verificada(p_conta,p_sessao);
  elsif not aabb.sessao_operacional(p_conta,p_sessao) then
    raise insufficient_privilege;
  end if;
end $$;

create function aabb.concluir_primeira_troca(p_conta uuid,p_sessao uuid,p_versao integer) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas where id=p_conta and ativa and troca_pendente
    and versao_credencial=p_versao+1 for update;
  if not found or exists(select from auth.sessions where id=p_sessao) then
    raise insufficient_privilege;
  end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',p_conta)::text,true);
  update aabb.contas set troca_pendente=false where id=p_conta;
end $$;

-- Somente a ponte confiável chama estas funções com o usuário e o session_id
-- devolvidos/verificados pelo Auth. A autorização é conferida novamente no SQL.
create function aabb.exigir_gestor(p_ator uuid,p_sessao uuid,p_unidade uuid) returns void
language plpgsql set search_path='' as $$
begin
  if not aabb.sessao_operacional(p_ator,p_sessao) then raise insufficient_privilege; end if;
  perform from aabb.funcoes where conta_id=p_ator and unidade_id=p_unidade and ativa
    and papel in ('diretora','supervisora','administrador') for share;
  if not found then raise insufficient_privilege; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',p_ator)::text,true);
end $$;

create function aabb.autorizar_provisionamento(p_pessoa uuid,p_unidade uuid,p_papeis text[],
  p_auditoria boolean,p_ator uuid,p_sessao uuid,p_aprovacao text) returns void
language plpgsql set search_path='' as $$
begin
  if coalesce(cardinality(p_papeis),0)=0 or array_position(p_papeis,null) is not null
    or not p_papeis <@ array['diretora','supervisora','administrador','professor']
    or cardinality(p_papeis)<>(select count(distinct papel) from unnest(p_papeis) papel)
    or (p_auditoria and not 'administrador'=any(p_papeis)) then
    raise check_violation;
  end if;
  perform from aabb.unidades where id=p_unidade for update;
  if not found then raise insufficient_privilege; end if;
  if p_ator is null then
    if p_sessao is not null or p_papeis<>array['diretora'] or p_auditoria
      or coalesce(p_aprovacao,'') !~ '^[A-Z0-9-]{6,64}$'
      or exists(select from aabb.funcoes where unidade_id=p_unidade
          and papel in ('diretora','supervisora','administrador')) then
      raise insufficient_privilege;
    end if;
  else
    perform aabb.exigir_gestor(p_ator,p_sessao,p_unidade);
  end if;
  perform from aabb.pessoas_funcionais where id=p_pessoa for update;
  if not found or exists(select from aabb.contas where pessoa_id=p_pessoa) then
    raise insufficient_privilege;
  end if;
end $$;

create function aabb.vincular_identidade(p_conta uuid,p_pessoa uuid,p_unidade uuid,p_papeis text[],
  p_auditoria boolean,p_ator uuid,p_sessao uuid,p_aprovacao text) returns void
language plpgsql set search_path='' as $$
declare nome_pessoa text;
begin
  perform aabb.autorizar_provisionamento(p_pessoa,p_unidade,p_papeis,p_auditoria,p_ator,p_sessao,p_aprovacao);
  select nome into strict nome_pessoa from aabb.pessoas_funcionais where id=p_pessoa;
  insert into aabb.contas(id,ativa,pessoa_id) values(p_conta,true,p_pessoa);
  insert into aabb.funcoes(unidade_id,conta_id,papel,consulta_auditoria)
    select p_unidade,p_conta,papel,p_auditoria and papel='administrador' from unnest(p_papeis) papel;
  if 'professor'=any(p_papeis) then
    insert into aabb.professores(unidade_id,conta_id,pessoa_id,nome)
      values(p_unidade,p_conta,p_pessoa,nome_pessoa)
      on conflict (unidade_id,pessoa_id) do update set conta_id=excluded.conta_id;
  end if;
  if p_ator is null then
    insert into aabb.auditoria(unidade_id,ator_sql,origem,operacao,entidade,registro_id,campos,motivo)
      values(p_unidade,session_user,'servico','bootstrap','contas',p_conta,array['ativa','troca_pendente'],p_aprovacao);
  end if;
end $$;

create function aabb.revogar_funcao(p_ator uuid,p_sessao uuid,p_funcao uuid) returns void
language plpgsql set search_path='' as $$
declare v_unidade uuid;
begin
  select unidade_id into strict v_unidade from aabb.funcoes where id=p_funcao;
  perform from aabb.unidades where id=v_unidade for update;
  perform aabb.exigir_gestor(p_ator,p_sessao,v_unidade);
  update aabb.funcoes set ativa=false where id=p_funcao;
end $$;

create function aabb.bloquear_identidade(p_ator uuid,p_sessao uuid,p_conta uuid) returns void
language plpgsql set search_path='' as $$
declare v_unidade uuid;
begin
  perform from aabb.contas where id=p_conta for update;
  if not found then raise insufficient_privilege; end if;
  -- Respeitar também os vínculos com unidades diferentes.
  for v_unidade in select distinct unidade_id from aabb.funcoes
    where conta_id=p_conta order by unidade_id loop
    perform aabb.exigir_gestor(p_ator,p_sessao,v_unidade);
  end loop;
  if v_unidade is null then raise insufficient_privilege; end if;
  update aabb.contas set ativa=false where id=p_conta and ativa;
end $$;

-- Compatibilidade com o ensaio descartável. A ponte hospedada recebe somente
-- o comando de bloqueio aplicativo e usa a API administrativa do Auth.
create function aabb.desativar_identidade(p_ator uuid,p_sessao uuid,p_conta uuid) returns void
language plpgsql set search_path='' as $$
begin
  perform aabb.bloquear_identidade(p_ator,p_sessao,p_conta);
  -- Revogar a sessão e os refresh tokens associados sem excluir a identidade.
  delete from auth.sessions where user_id=p_conta;
end $$;

create table aabb.provisoes_identidade (
  id uuid primary key,
  pessoa_id uuid not null unique references aabb.pessoas_funcionais,
  unidade_id uuid not null references aabb.unidades,
  email text not null unique,
  papeis text[] not null,
  auditoria boolean not null,
  solicitante uuid not null references aabb.contas,
  conta_id uuid references aabb.contas,
  criada_em timestamptz not null default clock_timestamp()
);

create function aabb.reservar_provisao(p_id uuid,p_pessoa uuid,p_unidade uuid,p_email text,
  p_papeis text[],p_auditoria boolean,p_ator uuid,p_sessao uuid) returns boolean
language plpgsql set search_path='' as $$
declare anterior aabb.provisoes_identidade;
begin
  perform from aabb.unidades where id=p_unidade for update;
  perform aabb.exigir_gestor(p_ator,p_sessao,p_unidade);
  select * into anterior from aabb.provisoes_identidade where id=p_id;
  if found then
    if (anterior.pessoa_id,anterior.unidade_id,anterior.email,anterior.papeis,anterior.auditoria,anterior.solicitante)
       is distinct from (p_pessoa,p_unidade,p_email,p_papeis,p_auditoria,p_ator) then
      raise check_violation;
    end if;
    return false;
  end if;
  if p_email is null or length(p_email)>200 or p_email !~ '^aabb-dev-[a-z0-9]+-[a-z0-9]+@example\.invalid$'
    or exists(select from auth.users where email=p_email) then raise check_violation; end if;
  perform aabb.autorizar_provisionamento(p_pessoa,p_unidade,p_papeis,p_auditoria,p_ator,p_sessao,null);
  insert into aabb.provisoes_identidade(id,pessoa_id,unidade_id,email,papeis,auditoria,solicitante)
    values(p_id,p_pessoa,p_unidade,p_email,p_papeis,p_auditoria,p_ator);
  insert into aabb.auditoria(unidade_id,autor_id,ator_sql,origem,operacao,entidade,registro_id,campos)
    values(p_unidade,p_ator,session_user,'aplicacao','reservar_provisao','contas',p_id,'{}');
  return true;
end $$;

create function aabb.finalizar_provisao(p_id uuid,p_ator uuid,p_sessao uuid) returns uuid
language plpgsql set search_path='' as $$
declare pedido aabb.provisoes_identidade; conta uuid;
begin
  select * into strict pedido from aabb.provisoes_identidade where id=p_id and solicitante=p_ator;
  -- A mesma ordem de travas da reserva permite retentar sem duplicar vínculos.
  perform from aabb.unidades where id=pedido.unidade_id for update;
  perform aabb.exigir_gestor(p_ator,p_sessao,pedido.unidade_id);
  select * into strict pedido from aabb.provisoes_identidade where id=p_id for update;
  if pedido.conta_id is not null then return pedido.conta_id; end if;
  select id into strict conta from auth.users where email=pedido.email
    and raw_app_meta_data->>'aabb_provisao'=p_id::text;
  perform aabb.vincular_identidade(conta,pedido.pessoa_id,pedido.unidade_id,pedido.papeis,
    pedido.auditoria,p_ator,p_sessao,null);
  update aabb.provisoes_identidade set conta_id=conta where id=p_id;
  return conta;
end $$;

create table aabb.trocas_iniciais (
  conta_id uuid primary key references aabb.contas,
  sessao_id uuid not null,
  versao integer not null,
  confirmacao_id uuid
);

create function aabb.iniciar_troca_hospedada(p_conta uuid,p_sessao uuid,p_versao integer) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas where id=p_conta and ativa and troca_pendente
    and versao_credencial=p_versao for update;
  if not found or not exists(select from auth.sessions where id=p_sessao and user_id=p_conta
    and created_at between clock_timestamp()-interval '2 minutes' and clock_timestamp()) then
    raise insufficient_privilege;
  end if;
  -- Uma tentativa sem alteração no Auth pode ser retomada. Se a versão mudou,
  -- a ponte deve provar a nova credencial e concluir a tentativa anterior.
  insert into aabb.trocas_iniciais(conta_id,sessao_id,versao) values(p_conta,p_sessao,p_versao)
    on conflict (conta_id) do update set sessao_id=excluded.sessao_id,confirmacao_id=null
    where trocas_iniciais.versao=excluded.versao;
  if not found then raise insufficient_privilege; end if;
end $$;

create function aabb.provar_troca_hospedada(p_conta uuid,p_versao integer,p_confirmacao uuid) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas where id=p_conta and ativa and troca_pendente and versao_credencial=p_versao for update;
  if not found then raise insufficient_privilege; end if;
  update aabb.trocas_iniciais t set confirmacao_id=p_confirmacao from auth.sessions s,aabb.contas c
    where t.conta_id=p_conta and p_versao=t.versao+1 and p_confirmacao<>t.sessao_id
      and s.id=p_confirmacao and s.user_id=p_conta and c.id=p_conta and s.created_at>c.login_posterior_a
      and s.created_at between clock_timestamp()-interval '2 minutes' and clock_timestamp();
  if not found then raise insufficient_privilege; end if;
end $$;

create function aabb.concluir_troca_hospedada(p_conta uuid,p_versao integer,p_confirmacao uuid) returns void
language plpgsql set search_path='' as $$
declare tentativa aabb.trocas_iniciais;
begin
  perform from aabb.contas where id=p_conta and ativa and versao_credencial=p_versao for update;
  if not found then raise insufficient_privilege; end if;
  select * into strict tentativa from aabb.trocas_iniciais where conta_id=p_conta;
  if p_versao<>tentativa.versao+1 or p_confirmacao is null or p_confirmacao is distinct from tentativa.confirmacao_id
    or exists(select from auth.sessions where id=p_confirmacao) then raise insufficient_privilege; end if;
  perform aabb.concluir_primeira_troca(p_conta,tentativa.sessao_id,tentativa.versao);
  delete from aabb.trocas_iniciais where conta_id=p_conta;
end $$;

create table aabb.provas_atividade (
  id uuid primary key references auth.sessions(id) on delete cascade
);

create table aabb.desafios_atividade (
  sessao_id uuid primary key references aabb.sessoes(id) on delete cascade,
  desafio uuid not null default gen_random_uuid(),
  criado_em timestamptz not null default clock_timestamp()
);

create function aabb.iniciar_atividade(p_conta uuid,p_sessao uuid) returns uuid
language plpgsql set search_path='' as $$
declare v_desafio uuid; v_agora timestamptz:=clock_timestamp();
begin
  if not aabb.sessao_operacional(p_conta,p_sessao) then raise insufficient_privilege; end if;
  insert into aabb.desafios_atividade(sessao_id) values(p_sessao)
    on conflict (sessao_id) do update set
      desafio=case when desafios_atividade.criado_em<=v_agora-interval '2 minutes'
        then excluded.desafio else desafios_atividade.desafio end,
      criado_em=case when desafios_atividade.criado_em<=v_agora-interval '2 minutes'
        then excluded.criado_em else desafios_atividade.criado_em end
    returning desafio into v_desafio;
  return v_desafio;
end $$;

create function aabb.confirmar_atividade(p_conta uuid,p_sessao uuid,p_prova uuid,p_desafio uuid) returns void
language plpgsql set search_path='' as $$
declare v_agora timestamptz; v_inicio timestamptz;
begin
  perform from aabb.contas where id=p_conta and ativa and not troca_pendente for update;
  if not found or p_prova=p_sessao then raise insufficient_privilege; end if;
  v_agora:=clock_timestamp();
  delete from aabb.desafios_atividade where sessao_id=p_sessao and desafio=p_desafio
    and criado_em between v_agora-interval '2 minutes' and v_agora returning criado_em into v_inicio;
  if not found then raise insufficient_privilege; end if;
  perform from auth.sessions original join aabb.contas c on c.id=original.user_id
    where original.id=p_prova and c.id=p_conta and original.created_at>c.login_posterior_a
      and original.created_at between v_inicio and v_agora
      and not exists(select from aabb.sessoes where id=p_prova)
    for key share of original;
  if not found then raise insufficient_privilege; end if;
  insert into aabb.provas_atividade(id) values(p_prova) on conflict do nothing;
  if not found then raise insufficient_privilege; end if;
  v_agora:=clock_timestamp();
  update aabb.sessoes s set ultima_atividade=v_agora from auth.sessions original,aabb.contas c
    where s.id=p_sessao and s.conta_id=p_conta and c.id=p_conta
      and original.id=s.id and original.user_id=c.id and original.created_at>c.login_posterior_a
      and original.created_at<=v_agora and v_agora<original.created_at+interval '8 hours'
      and s.ultima_atividade<=v_agora and v_agora<s.ultima_atividade+interval '30 minutes';
  if not found then raise insufficient_privilege; end if;
end $$;

create table aabb.provas_recuperacao (
  digest bytea primary key check (octet_length(digest)=32),
  conta_id uuid not null references aabb.contas,
  versao integer not null,
  vence_em timestamptz not null default clock_timestamp()+interval '15 minutes'
);

create function aabb.registrar_recuperacao(p_ator uuid,p_sessao uuid,p_unidade uuid,p_conta uuid,
  p_email text,p_digest bytea) returns void
language plpgsql set search_path='' as $$
begin
  perform aabb.exigir_gestor(p_ator,p_sessao,p_unidade);
  insert into aabb.provas_recuperacao(digest,conta_id,versao)
    select p_digest,c.id,c.versao_credencial from aabb.contas c join auth.users u on u.id=c.id
    where c.id=p_conta and c.ativa and u.email=p_email and exists(select from aabb.funcoes f
      where f.conta_id=c.id and f.unidade_id=p_unidade and f.ativa);
  if not found then raise insufficient_privilege; end if;
end $$;

create function aabb.consumir_recuperacao(p_conta uuid,p_digest bytea) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas where id=p_conta and ativa for update;
  if not found then raise insufficient_privilege; end if;
  delete from aabb.provas_recuperacao p using aabb.contas c
    where p.digest=p_digest and p.conta_id=p_conta and c.id=p_conta
      and p.versao=c.versao_credencial and p.vence_em>clock_timestamp();
  if not found then raise insufficient_privilege; end if;
end $$;

alter table aabb.provisoes_identidade enable row level security;
alter table aabb.trocas_iniciais enable row level security;
alter table aabb.provas_atividade enable row level security;
alter table aabb.desafios_atividade enable row level security;
alter table aabb.provas_recuperacao enable row level security;

-- Papel de servidor sem credencial, sem escrita direta e fora do PostgREST.
create role aabb_identidade_runtime nologin noinherit;

create function aabb.operar_identidade(p_acao text,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare ator uuid:=(d->>'ator')::uuid; sessao uuid:=(d->>'sessao')::uuid;
  conta uuid:=(d->>'conta')::uuid; unidade uuid:=(d->>'unidade')::uuid;
  versao integer:=(d->>'versao')::integer; resultado jsonb;
begin
  case p_acao
    when 'identidade' then select to_jsonb(i) into resultado from aabb.identidade_por_email(d->>'email') i;
    when 'reservar' then resultado:=to_jsonb(aabb.reservar_provisao((d->>'id')::uuid,(d->>'pessoa')::uuid,
      unidade,d->>'email',array(select jsonb_array_elements_text(d->'papeis')),
      coalesce((d->>'auditoria')::boolean,false),ator,sessao));
    when 'finalizar' then resultado:=to_jsonb(aabb.finalizar_provisao((d->>'id')::uuid,ator,sessao));
    when 'admitir' then
      perform set_config('request.jwt.claims',jsonb_build_object('sub',conta)::text,true);
      perform aabb.admitir_login(conta,sessao,versao);
    when 'iniciarTroca' then perform aabb.iniciar_troca_hospedada(conta,sessao,versao);
    when 'provarTroca' then perform aabb.provar_troca_hospedada(conta,versao,sessao);
    when 'concluirTroca' then perform aabb.concluir_troca_hospedada(conta,versao,sessao);
    when 'iniciarAtividade' then resultado:=to_jsonb(aabb.iniciar_atividade(conta,sessao));
    when 'atividade' then perform aabb.confirmar_atividade(conta,sessao,(d->>'prova')::uuid,(d->>'desafio')::uuid);
    when 'sair' then
      perform set_config('request.jwt.claims',jsonb_build_object('sub',conta)::text,true);
      delete from aabb.sessoes where id=sessao and conta_id=conta;
    when 'revogar' then perform aabb.revogar_funcao(ator,sessao,(d->>'funcao')::uuid);
    when 'bloquear' then perform aabb.bloquear_identidade(ator,sessao,conta);
    when 'autorizarRecuperacao' then
      resultado:=to_jsonb(aabb.autorizar_recuperacao_assistida(ator,sessao,conta,unidade,d->>'referencia'));
    when 'registrarRecuperacao' then
      perform aabb.registrar_recuperacao(ator,sessao,unidade,conta,d->>'email',decode(d->>'digest','hex'));
    when 'consumirRecuperacao' then perform aabb.consumir_recuperacao(conta,decode(d->>'digest','hex'));
    else raise insufficient_privilege;
  end case;
  return resultado;
end $$;

create function aabb.autorizar_recuperacao_assistida(p_ator uuid,p_sessao uuid,p_conta uuid,
  p_unidade uuid,p_verificacao text) returns text
language plpgsql set search_path='' as $$
declare v_email text;
begin
  perform aabb.exigir_gestor(p_ator,p_sessao,p_unidade);
  if coalesce(p_verificacao,'') !~ '^[A-Z0-9-]{6,64}$' then raise insufficient_privilege; end if;
  select email into strict v_email from auth.users u join aabb.contas c on c.id=u.id
  where c.id=p_conta and c.ativa and exists (select from aabb.funcoes f
    where f.conta_id=p_conta and f.unidade_id=p_unidade and f.ativa);
  insert into aabb.auditoria(unidade_id,autor_id,ator_sql,origem,operacao,entidade,registro_id,campos,motivo)
    values(p_unidade,p_ator,session_user,'aplicacao','autorizar_recuperacao','contas',p_conta,'{}',p_verificacao);
  return v_email;
end $$;

revoke all on all functions in schema aabb from public,anon,authenticated,service_role,supabase_auth_admin;
revoke all on all tables in schema aabb from public,anon,service_role,supabase_auth_admin,aabb_identidade_runtime;
revoke all on aabb.provisoes_identidade,aabb.trocas_iniciais,aabb.provas_atividade,aabb.desafios_atividade,
  aabb.provas_recuperacao from authenticated;
grant execute on function aabb.admin(uuid),aabb.pode_auditar(uuid) to authenticated;
grant usage on schema aabb to aabb_identidade_runtime;
grant execute on function aabb.operar_identidade(text,jsonb) to aabb_identidade_runtime;

commit;
