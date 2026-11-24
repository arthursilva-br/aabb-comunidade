begin;
create function teste.verificar(ok boolean, descricao text) returns void language plpgsql as $$
begin
 if ok is not true then raise exception 'Falhou: %',descricao; end if;
 raise notice 'OK: %',descricao;
end $$;
select teste.verificar(not exists(select from pg_class t join pg_namespace n on n.oid=t.relnamespace
 where n.nspname='aabb' and t.relkind='r' and (not t.relrowsecurity
 or has_table_privilege('authenticated',t.oid,'INSERT,UPDATE,DELETE,TRUNCATE')
 or has_table_privilege('anon',t.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'))),'RLS e ACL de todas as tabelas');
select teste.verificar(not has_schema_privilege('anon','aabb_api','usage')
 and not has_schema_privilege('service_role','aabb_api','usage'),'API fechada por padrão');
select teste.verificar(not exists(select from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('aabb','aabb_api') and has_function_privilege('anon',p.oid,'EXECUTE')),
 'funções privadas e públicas sem EXECUTE anônimo');
select teste.verificar(not exists(select from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('aabb','aabb_api') and p.prosecdef
 and not coalesce(p.proconfig @> array['search_path=""'],false)),'search_path das funções elevadas');
select teste.verificar(not has_function_privilege('authenticated','aabb.abrir_sessao_verificada(uuid,uuid)','execute'),
 'somente serviço confiável abre sessão');
insert into aabb.unidades(id,nome,fuso) values(teste.id(91),'Outra unidade de teste','UTC');
insert into aabb.alunos(id,unidade_id,nome) values(teste.id(92),teste.id(91),'Outro aluno fictício');
do $$begin
 begin
   insert into aabb.aluno_responsavel(unidade_id,aluno_id,responsavel_id) values(teste.id(1),teste.id(92),teste.id(6));
   raise exception 'FK deveria impedir vínculo entre unidades';
 exception when foreign_key_violation then null; end;
end $$;

select teste.login('professor');
set local role authenticated;
select teste.verificar((select count(*)=0 from aabb.alunos),'docente sem dados administrativos');
select teste.verificar((select count(*)=0 from aabb_api.eventos_auditoria),'docente sem auditoria');
do $$begin
 begin
   update aabb.funcoes set papel='diretora';
   raise exception 'Alteração direta deveria ser negada';
 exception when insufficient_privilege then null; end;
 begin
   delete from aabb_api.eventos_auditoria;
   raise exception 'Exclusão de auditoria deveria ser negada';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into aabb.funcoes(unidade_id,conta_id,papel) values(teste.id(1),teste.id(3),'administrador');
set local role authenticated;
select teste.verificar((select count(*)=1 from aabb.alunos where id in(teste.id(5),teste.id(92))),'administrador com dupla função isolado por unidade');
select teste.verificar((select count(*)=0 from aabb_api.eventos_auditoria),'auditoria exige permissão específica');
reset role;
update aabb.funcoes set consulta_auditoria=true where conta_id=teste.id(3) and papel='administrador';
set local role authenticated;
select teste.verificar(exists(select from aabb_api.eventos_auditoria where entidade='funcoes' and posterior->>'consulta_auditoria'='true')
 and not exists(select from aabb_api.eventos_auditoria where unidade_id<>teste.id(1)),'trilha de concessão visível na própria unidade');
reset role;
update aabb.funcoes set ativa=false where conta_id=teste.id(3) and papel='administrador';
set local role authenticated;
select teste.verificar((select count(*)=0 from aabb.alunos),'revogação com o mesmo token');
reset role;
select teste.login('diretora');
set local role authenticated;
select teste.verificar(to_regprocedure('aabb_api.registrar_atividade()') is null,
  'JWT operacional sozinho não pode prolongar sessões');
select teste.verificar(exists(select from aabb.alunos where id=teste.id(5)),'sessão ativa');
reset role;
update aabb.sessoes set ultima_atividade=statement_timestamp()-interval '30 minutes' where conta_id=teste.id(2);
set local role authenticated;
select teste.verificar((select count(*)=0 from aabb.alunos),'inatividade de 30 minutos');
do $$begin
 begin perform aabb_api.registrar_atividade(); raise exception 'Reativação indevida';
 exception when undefined_function then null; end;
end $$;
reset role;
update aabb.sessoes set ultima_atividade=clock_timestamp() where conta_id=teste.id(2);
update auth.sessions set created_at=clock_timestamp()-interval '8 hours' where user_id=teste.id(2);
set local role authenticated;
select teste.verificar((select count(*)=0 from aabb.alunos),'duração máxima de 8 horas');
reset role;
update auth.sessions set created_at=clock_timestamp() where user_id=teste.id(2);
update aabb.contas set troca_pendente=true where id=teste.id(2);
select teste.verificar(not aabb.sessao_valida(),'troca obrigatória e invalidação');
update aabb.contas set ativa=false,troca_pendente=false where id=teste.id(2);
update aabb.contas set ativa=true where id=teste.id(2);
do $$begin
 begin
   perform aabb.abrir_sessao_verificada(teste.id(2),'a0000000-0000-4000-8000-000000000002');
 exception when raise_exception then
   if sqlerrm='Exige login recente' then return; end if;
   raise;
 end;
 raise exception 'Reabertura indevida após reativação';
end $$;
select teste.verificar(exists(select from aabb.auditoria where entidade='contas' and unidade_id=teste.id(1)
  and posterior->>'ativa'='false'),'desativação auditada');
select teste.verificar(not exists(select from aabb.auditoria where entidade='alunos'
 and ((posterior ?| array['nome','cpf','rg','nascimento','observacoes']) or (anterior ? 'nome'))),'dados pessoais fora dos valores da trilha');
rollback;
