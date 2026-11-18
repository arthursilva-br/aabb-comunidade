begin;
create function aabb_api.registrar_atividade() returns void
language plpgsql security definer set search_path='' as $$
begin
  update aabb.sessoes set ultima_atividade=clock_timestamp()
  where id=nullif(auth.jwt()->>'session_id','')::uuid and conta_id=auth.uid()
    and ultima_atividade > clock_timestamp()-interval '30 minutes' and aabb.sessao_valida();
  if not found then raise insufficient_privilege using message='Sessão expirada ou indisponível'; end if;
end $$;

-- Abertura apenas por serviço confiável após o fluxo Auth. Não expor via REST.
create function aabb.abrir_sessao_verificada(conta uuid, sessao uuid) returns void
language plpgsql set search_path='' as $$
begin
  perform from aabb.contas c where c.id=conta and c.ativa and not c.troca_pendente for update;
  if not found then raise exception 'Conta indisponível'; end if;
  perform from auth.sessions s join aabb.contas c on c.id=s.user_id
    where s.id=sessao and s.user_id=conta and s.created_at>c.login_posterior_a
    and s.created_at between clock_timestamp()-interval '30 minutes' and clock_timestamp();
  if not found then raise exception 'Exige login recente'; end if;
  insert into aabb.sessoes(id,conta_id) values(sessao,conta);
end $$;

-- Auditoria guarda valores operacionais selecionados. Para dados pessoais,
-- registra quais campos mudaram sem duplicar seu conteúdo.
create function aabb.resumo_evento(linha jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_object_agg(c,v) from jsonb_each(linha) x(c,v)
 where c=any(array['unidade_id','conta_id','professor_id','aluno_id','responsavel_id','papel',
 'consulta_auditoria','ativa','troca_pendente','validado','arquivado','estado','tipo','status',
 'capacidade','ano','turno','turma_id','matricula_id','chamada_id','oficina_id','origem_id',
 'destino_id','inicio','fim','inicio_operacional','marco_digital','revogada_em',
 'concluida_em','concluida_por','utilizada_em','vinculo_id','operacao','ate',
 'marca_anterior','marca_nova','presenca_id','atividade','dia_iso','espera_id',
 'presente','marca','versao','data','data_atividade','revisor_id','aberto'])
$$;
create function aabb.auditar() returns trigger language plpgsql security definer set search_path='' as $$
declare
 antes jsonb := to_jsonb(old);
 depois jsonb := to_jsonb(new);
 linha jsonb := coalesce(depois,antes);
 unidade uuid := (linha->>'unidade_id')::uuid;
 registro uuid := (linha->>'id')::uuid;
 alterados text[];
begin
 if tg_table_name='unidades' then unidade:=registro; end if;
 if tg_table_name='sessoes' then
   registro:=(linha->>'conta_id')::uuid;
   if tg_op='UPDATE' then return null; end if;
 end if;
 select array_agg(c order by c) into alterados from jsonb_object_keys(linha) c
 where (antes->c) is distinct from (depois->c);
 if alterados is null then return null; end if;
 insert into aabb.auditoria(unidade_id,autor_id,ator_sql,origem,operacao,entidade,registro_id,
    campos,anterior,posterior,motivo)
 select u,auth.uid(),session_user,case when auth.uid() is null then 'servico' else 'aplicacao' end,
    tg_op,tg_table_name,registro,alterados,aabb.resumo_evento(antes),aabb.resumo_evento(depois),
    coalesce(linha->>'motivo',linha->>'motivo_correcao')
 from (select distinct f.unidade_id as u from aabb.funcoes f
       where unidade is null and tg_table_name in ('contas','sessoes') and f.conta_id=registro
       union all select unidade where unidade is not null or not exists
         (select from aabb.funcoes f where f.conta_id=registro)) escopos;
 return null;
end $$;

-- Todas as tabelas privadas ficam sem escrita direta. Somente leituras
-- administrativas explicitamente selecionadas são concedidas ao papel da API.
revoke all on all tables in schema aabb from public,anon,authenticated,service_role;
revoke all on all functions in schema aabb,aabb_api from public,anon,authenticated,service_role;
grant usage on schema aabb,aabb_api to authenticated;
grant execute on function aabb.admin(uuid), aabb.pode_auditar(uuid) to authenticated;
do $controle$
declare tab record;
begin
 for tab in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='aabb' and c.relkind='r' loop
   execute format('alter table aabb.%I enable row level security',tab.relname);
   if tab.relname='auditoria' then
     create policy auditores on aabb.auditoria for select to authenticated using(aabb.pode_auditar(unidade_id));
     grant select on aabb.auditoria to authenticated;
   elsif tab.relname in ('alunos','responsaveis','aluno_responsavel','oficinas','turmas',
       'matriculas','professores','funcoes','lotes_importacao','linhas_importacao') then
     execute format('create policy administracao on aabb.%I for select to authenticated using(aabb.admin(unidade_id))',tab.relname);
     execute format('grant select on aabb.%I to authenticated',tab.relname);
   end if;
   if tab.relname <> 'auditoria' and exists (
     select from information_schema.columns where table_schema='aabb' and table_name=tab.relname and column_name='id'
   ) then
     execute format('create trigger trilha after insert or update or delete on aabb.%I for each row execute function aabb.auditar()',tab.relname);
   end if;
 end loop;
end $controle$;
create view aabb_api.eventos_auditoria with (security_invoker=true) as select * from aabb.auditoria;
revoke all on all tables in schema aabb_api from public,anon,authenticated,service_role;
grant select on aabb_api.eventos_auditoria to authenticated;
grant execute on function
  aabb_api.movimentar_matricula(uuid,text,uuid,uuid,uuid,uuid,text,uuid),
  aabb_api.disponibilidade(uuid),
  aabb_api.solicitar_espera(uuid,uuid), aabb_api.encerrar_espera(uuid,text,text),
  aabb_api.alterar_capacidade(uuid,integer,boolean),
  aabb_api.autorizar_docente(uuid,date,date), aabb_api.revogar_docente(uuid),
  aabb_api.minhas_turmas(), aabb_api.alunos_docentes(uuid,date),
  aabb_api.historico_chamadas(uuid), aabb_api.gravar_chamada(uuid,date,integer,jsonb,boolean,uuid),
  aabb_api.permitir_correcao(uuid,uuid,date),
  aabb_api.corrigir_frequencia(uuid,uuid,integer,text,text,text,uuid),
  aabb_api.registrar_atividade() to authenticated;
commit;
