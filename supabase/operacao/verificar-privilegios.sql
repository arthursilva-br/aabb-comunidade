-- Executar com o mesmo proprietário que aplicou as cinco migrations.
begin read only;
do $verificacao$
declare
  papel name;
  objeto record;
  api oid[]:=array[
    'aabb_api.movimentar_matricula(uuid,text,uuid,uuid,uuid,uuid,text,uuid)'::regprocedure,
    'aabb_api.disponibilidade(uuid)'::regprocedure,'aabb_api.solicitar_espera(uuid,uuid)'::regprocedure,
    'aabb_api.encerrar_espera(uuid,text,text)'::regprocedure,'aabb_api.alterar_capacidade(uuid,integer,boolean)'::regprocedure,
    'aabb_api.autorizar_docente(uuid,date,date)'::regprocedure,'aabb_api.revogar_docente(uuid)'::regprocedure,
    'aabb_api.minhas_turmas()'::regprocedure,'aabb_api.alunos_docentes(uuid,date)'::regprocedure,
    'aabb_api.historico_chamadas(uuid)'::regprocedure,
    'aabb_api.gravar_chamada(uuid,date,integer,jsonb,boolean,uuid)'::regprocedure,
    'aabb_api.permitir_correcao(uuid,uuid,date)'::regprocedure,
    'aabb_api.corrigir_frequencia(uuid,uuid,integer,text,text,text,uuid)'::regprocedure];
  politicas oid[]:=array['aabb.admin(uuid)'::regprocedure,'aabb.pode_auditar(uuid)'::regprocedure];
  ponte oid:='aabb.operar_identidade(text,jsonb)'::regprocedure;
  leitura text[]:=array['auditoria','alunos','responsaveis','aluno_responsavel','oficinas','turmas',
    'matriculas','professores','funcoes','lotes_importacao','linhas_importacao','eventos_auditoria'];
begin
  if to_regprocedure('aabb_api.registrar_atividade()') is not null then
    raise exception 'RPC antiga de atividade ainda existe';
  end if;
  if not exists(select from pg_trigger where tgrelid='auth.users'::regclass
      and tgname='aabb_invalidar_por_credencial' and tgenabled='O'
      and tgfoid='aabb.invalidar_por_credencial()'::regprocedure) then
    raise exception 'Trigger de credencial ausente ou inativo';
  end if;
  if (select count(*) from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relnamespace='aabb'::regnamespace)<>cardinality(leitura)-1
    or exists(select from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relnamespace='aabb'::regnamespace and (p.polcmd<>'r' or not p.polpermissive
      or p.polroles<>array['authenticated'::regrole::oid] or p.polwithcheck is not null
      or c.relname<>all(leitura) or pg_get_expr(p.polqual,p.polrelid) is distinct from
        case when c.relname='auditoria' then 'aabb.pode_auditar(unidade_id)' else 'aabb.admin(unidade_id)' end)) then
    raise exception 'Políticas RLS fora da lista esperada';
  end if;
  if not exists(select from pg_roles where rolname='aabb_identidade_runtime'
      and not (rolcanlogin or rolsuper or rolbypassrls or rolcreatedb or rolcreaterole or rolreplication or rolinherit))
    or exists(select from pg_auth_members where member='aabb_identidade_runtime'::regrole) then
    raise exception 'Papel de identidade com atributos ou associação indevidos';
  end if;
  if to_regrole('aabb_identidade_dev') is not null and (not exists(select from pg_roles
      where rolname='aabb_identidade_dev' and rolcanlogin and rolinherit
      and not (rolsuper or rolbypassrls or rolcreatedb or rolcreaterole or rolreplication))
    or not pg_has_role(to_regrole('aabb_identidade_dev')::oid,'aabb_identidade_runtime'::regrole::oid,'USAGE')
    or exists(select from pg_auth_members where member=to_regrole('aabb_identidade_dev')::oid
      and (roleid<>'aabb_identidade_runtime'::regrole or admin_option))) then
    raise exception 'Login da ponte fora do papel restrito';
  end if;
  foreach papel in array array['anon','authenticated','service_role','supabase_auth_admin','aabb_identidade_runtime','authenticator']::name[] loop
    if to_regrole(papel::text) is null then
      if papel='authenticator' then continue; end if;
      raise exception 'Papel esperado ausente: %',papel;
    end if;
    if (papel<>'aabb_identidade_runtime' and pg_has_role(papel,'aabb_identidade_runtime','MEMBER'))
      or has_schema_privilege(papel,'aabb','CREATE') or has_schema_privilege(papel,'aabb_api','CREATE')
      or has_schema_privilege(papel,'aabb','USAGE')<>(papel in ('authenticated','aabb_identidade_runtime'))
      or has_schema_privilege(papel,'aabb_api','USAGE')<>(papel='authenticated') then
      raise exception 'Privilégio de schema inesperado: %',papel;
    end if;
    for objeto in select p.oid,p.proname,p.proowner,p.prosecdef,p.proconfig,n.nspname,p.proacl
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('aabb','aabb_api') loop
      if objeto.proowner<>current_user::regrole
        or (objeto.prosecdef and not coalesce('search_path=""'=any(objeto.proconfig),false))
        or ((objeto.oid=ponte or objeto.oid=any(api) or objeto.oid=any(politicas)) and not objeto.prosecdef)
        or exists(select from aclexplode(coalesce(objeto.proacl,acldefault('f',objeto.proowner))) where grantee=0)
        or has_function_privilege(papel,objeto.oid,'EXECUTE')<>(
          (papel='authenticated' and (objeto.oid=any(api) or objeto.oid=any(politicas)))
          or (papel='aabb_identidade_runtime' and objeto.oid=ponte))
        or has_function_privilege(papel,objeto.oid,'EXECUTE WITH GRANT OPTION') then
        raise exception 'Owner, search_path ou EXECUTE inesperado: % no papel %',objeto.oid::regprocedure,papel;
      end if;
    end loop;
    for objeto in select c.oid,c.relname,c.relowner,c.relkind,c.relrowsecurity,c.reloptions,n.nspname
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname in ('aabb','aabb_api') and c.relkind in ('r','p','v','m','f') loop
      if objeto.relowner<>current_user::regrole
        or (objeto.nspname='aabb' and (objeto.relkind<>'r' or not objeto.relrowsecurity))
        or (objeto.nspname='aabb_api' and (objeto.relname<>'eventos_auditoria' or objeto.relkind<>'v'
          or not coalesce('security_invoker=true'=any(objeto.reloptions),false)))
        or has_table_privilege(papel,objeto.oid,'SELECT')<>(papel='authenticated' and objeto.relname=any(leitura))
        or has_any_column_privilege(papel,objeto.oid,'SELECT')<>(papel='authenticated' and objeto.relname=any(leitura))
        or has_table_privilege(papel,objeto.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN,SELECT WITH GRANT OPTION')
        or has_any_column_privilege(papel,objeto.oid,'INSERT,UPDATE,REFERENCES,SELECT WITH GRANT OPTION') then
        raise exception 'Owner, RLS ou ACL inesperados: % no papel %',objeto.oid::regclass,papel;
      end if;
    end loop;
  end loop;
  if to_regclass('aabb_api.eventos_auditoria') is null then raise exception 'View de auditoria ausente'; end if;
end $verificacao$;
commit;
