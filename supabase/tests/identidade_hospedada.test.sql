begin;
insert into aabb.unidades(id,nome,fuso) values(teste.id(80),'Unidade fictícia DEV','UTC');
insert into aabb.pessoas_funcionais(id,nome) values(teste.id(81),'Pessoa fictícia A'),(teste.id(82),'Pessoa fictícia B');
insert into auth.users(id,email) values(teste.id(83),'aabb-dev-ensaio000-gestora@example.invalid');
select aabb.vincular_identidade(teste.id(83),teste.id(81),teste.id(80),array['diretora'],false,null,null,'FICTICIO-80');
update aabb.contas set troca_pendente=false where id=teste.id(83);
insert into auth.sessions(id,user_id,created_at) values(teste.id(84),teste.id(83),clock_timestamp());
select aabb.admitir_login(teste.id(83),teste.id(84),0);

do $$
declare
  pedido jsonb:=jsonb_build_object('id',teste.id(85),'pessoa',teste.id(82),'unidade',teste.id(80),
    'email','aabb-dev-ensaio000-nova@example.invalid','papeis',array['administrador','professor'],
    'auditoria',true,'ator',teste.id(83),'sessao',teste.id(84));
  desafio uuid;
  antes timestamptz;
begin
  set local role aabb_identidade_runtime;
  assert aabb.operar_identidade('reservar',pedido)='true'::jsonb;
  assert aabb.operar_identidade('reservar',pedido)='false'::jsonb;
  begin
    perform aabb.operar_identidade('reservar',pedido||'{"papeis":["diretora"]}'::jsonb);
    raise exception 'Reuso divergente de reserva';
  exception when check_violation then null; end;
  begin
    perform aabb.operar_identidade('finalizar',pedido);
    raise exception 'Vínculo sem identidade reservada';
  exception when no_data_found then null; end;
  begin
    perform from aabb.contas;
    raise exception 'Ponte com leitura direta';
  exception when insufficient_privilege then null; end;
  reset role;

  insert into auth.users(id,email,raw_app_meta_data) values(teste.id(86),pedido->>'email','{}');
  begin
    perform aabb.finalizar_provisao(teste.id(85),teste.id(83),teste.id(84));
    raise exception 'Vínculo sem marcador administrativo';
  exception when no_data_found then null; end;
  update auth.users set raw_app_meta_data=jsonb_build_object('aabb_provisao',teste.id(85)) where id=teste.id(86);
  assert aabb.finalizar_provisao(teste.id(85),teste.id(83),teste.id(84))=teste.id(86);
  assert aabb.finalizar_provisao(teste.id(85),teste.id(83),teste.id(84))=teste.id(86);
  assert (select count(*)=2 from aabb.funcoes where conta_id=teste.id(86));
  assert exists(select from aabb.auditoria where registro_id=teste.id(85) and autor_id=teste.id(83));

  insert into auth.sessions(id,user_id,created_at) values(teste.id(87),teste.id(86),clock_timestamp());
  perform aabb.iniciar_troca_hospedada(teste.id(86),teste.id(87),0);
  update auth.users set encrypted_password='marcador-hash-ficticio' where id=teste.id(86);
  begin
    perform aabb.concluir_troca_hospedada(teste.id(86),1,teste.id(88));
    raise exception 'Primeira troca sem novo login';
  exception when insufficient_privilege then null; end;
  insert into auth.sessions(id,user_id,created_at) values(teste.id(88),teste.id(86),clock_timestamp());
  perform aabb.provar_troca_hospedada(teste.id(86),1,teste.id(88));
  begin
    perform aabb.concluir_troca_hospedada(teste.id(86),1,teste.id(88));
    raise exception 'Primeira troca com sessões abertas';
  exception when insufficient_privilege then null; end;
  delete from auth.sessions where id in (teste.id(87),teste.id(88));
  perform aabb.concluir_troca_hospedada(teste.id(86),1,teste.id(88));
  assert not (select troca_pendente from aabb.contas where id=teste.id(86));

  select ultima_atividade into antes from aabb.sessoes where id=teste.id(84);
  desafio:=aabb.iniciar_atividade(teste.id(83),teste.id(84));
  assert desafio=aabb.iniciar_atividade(teste.id(83),teste.id(84));
  assert antes=(select ultima_atividade from aabb.sessoes where id=teste.id(84));
  insert into auth.sessions(id,user_id,created_at) values(teste.id(89),teste.id(83),clock_timestamp());
  perform aabb.confirmar_atividade(teste.id(83),teste.id(84),teste.id(89),desafio);
  assert antes<(select ultima_atividade from aabb.sessoes where id=teste.id(84));
  begin
    perform aabb.confirmar_atividade(teste.id(83),teste.id(84),teste.id(89),desafio);
    raise exception 'Repetição artificial prolongou sessão';
  exception when insufficient_privilege then null; end;

end $$;

do $$
declare prova bytea:=sha256(convert_to('prova fictícia','UTF8'));
begin
  perform aabb.registrar_recuperacao(teste.id(83),teste.id(84),teste.id(80),teste.id(86),
    'aabb-dev-ensaio000-nova@example.invalid',prova);
  begin
    perform aabb.consumir_recuperacao(teste.id(83),prova);
    raise exception 'Recuperação de outra pessoa';
  exception when insufficient_privilege then null; end;
  perform aabb.consumir_recuperacao(teste.id(86),prova);
  begin
    perform aabb.consumir_recuperacao(teste.id(86),prova);
    raise exception 'Reuso da prova de recuperação';
  exception when insufficient_privilege then null; end;
end $$;

-- O relógio só é manipulado neste PostgreSQL descartável.
update aabb.contas set login_posterior_a=clock_timestamp()-interval '9 hours' where id=teste.id(83);
update aabb.sessoes set ultima_atividade=clock_timestamp()-interval '29 minutes' where id=teste.id(84);
update auth.sessions set created_at=clock_timestamp()-interval '7 hours 59 minutes' where id=teste.id(84);

do $$
declare desafio uuid;
begin
  desafio:=aabb.iniciar_atividade(teste.id(83),teste.id(84));
  insert into auth.sessions(id,user_id,created_at) values(teste.id(90),teste.id(83),clock_timestamp());
  update auth.sessions set created_at=clock_timestamp()-interval '8 hours' where id=teste.id(84);
  begin
    perform aabb.confirmar_atividade(teste.id(83),teste.id(84),teste.id(90),desafio);
    raise exception 'Renovação além de 8 horas';
  exception when insufficient_privilege then null; end;
  update auth.sessions set created_at=clock_timestamp() where id=teste.id(84);
  update aabb.sessoes set ultima_atividade=clock_timestamp()-interval '30 minutes' where id=teste.id(84);
  begin
    perform aabb.confirmar_atividade(teste.id(83),teste.id(84),teste.id(90),desafio);
    raise exception 'Sessão inativa foi reativada';
  exception when insufficient_privilege then null; end;
end $$;

set local role aabb_identidade_runtime;
select aabb.operar_identidade(j->>'acao',j->'dados')->>'id'='00000000-0000-4000-8000-000000000083' as identidade_ok
from (select convert_from(decode($1,'base64'),'UTF8')::jsonb j) entrada
\bind eyJhY2FvIjoiaWRlbnRpZGFkZSIsImRhZG9zIjp7ImVtYWlsIjoiYWFiYi1kZXYtZW5zYWlvMDAwLWdlc3RvcmFAZXhhbXBsZS5pbnZhbGlkIn19
\gset
\if :identidade_ok
\else
select 1/0;
\endif
reset role;
rollback;
