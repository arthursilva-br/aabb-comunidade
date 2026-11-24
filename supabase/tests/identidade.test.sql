begin;
insert into aabb.unidades(id,nome,fuso) values(teste.id(70),'Unidade fictícia de identidade','UTC');
insert into aabb.pessoas_funcionais(id,nome) values(teste.id(71),'Pessoa fictícia A'),(teste.id(72),'Pessoa fictícia B');
insert into auth.users(id,email) values(teste.id(73),'pessoa-a@example.invalid'),(teste.id(74),'pessoa-b@example.invalid');

do $$begin
  begin
    perform aabb.vincular_identidade(teste.id(73),teste.id(71),teste.id(70),array['diretora'],false,null,null,null);
    raise exception 'Bootstrap sem ato de autorização';
  exception when insufficient_privilege then null; end;
end $$;
select aabb.vincular_identidade(teste.id(73),teste.id(71),teste.id(70),array['diretora'],false,null,null,'FICTICIO-70');
insert into auth.sessions(id,user_id,created_at) values(teste.id(75),teste.id(73),clock_timestamp());
do $$begin
  begin
    perform aabb.vincular_identidade(teste.id(74),teste.id(72),teste.id(70),array['diretora'],false,null,null,'FICTICIO-71');
    raise exception 'Bootstrap repetido';
  exception when insufficient_privilege then null; end;
  begin
    perform aabb.admitir_login(teste.id(73),teste.id(75),0);
    raise exception 'Sessão admitida antes da troca';
  exception when raise_exception then
    if sqlerrm<>'Conta indisponível' then raise; end if;
  end;
end $$;

set local role supabase_auth_admin;
update auth.users set encrypted_password='marcador-ficticio-1' where id='00000000-0000-4000-8000-000000000073';
reset role;
do $$begin
  begin
    perform aabb.concluir_primeira_troca(teste.id(73),teste.id(75),0);
    raise exception 'Troca concluída com sessão provisória ainda aberta';
  exception when insufficient_privilege then null; end;
end $$;
delete from auth.sessions where id=teste.id(75);
select aabb.concluir_primeira_troca(teste.id(73),teste.id(75),0);
insert into auth.sessions(id,user_id,created_at) values(teste.id(76),teste.id(73),clock_timestamp());
select aabb.admitir_login(teste.id(73),teste.id(76),1);
select aabb.vincular_identidade(teste.id(74),teste.id(72),teste.id(70),array['administrador','professor'],
  true,teste.id(73),teste.id(76),null);

do $$begin
  if not aabb.sessao_operacional(teste.id(73),teste.id(76)) then raise exception 'Novo login indisponível'; end if;
  if not exists (select from aabb.professores where conta_id=teste.id(74) and pessoa_id=teste.id(72))
    or (select count(*) from aabb.funcoes where conta_id=teste.id(74))<>2 then
    raise exception 'Falha na separação entre conta, pessoa, professor e papéis';
  end if;
  if not exists (select from aabb.auditoria where autor_id=teste.id(73) and operacao='INSERT'
      and unidade_id=teste.id(70) and posterior->>'conta_id'=teste.id(74)::text) then
    raise exception 'Gestor precisa constar na trilha de provisionamento';
  end if;
end $$;

insert into auth.sessions(id,user_id,created_at) values(teste.id(77),teste.id(74),clock_timestamp());
select aabb.desativar_identidade(teste.id(73),teste.id(76),teste.id(74));
do $$begin
  if exists (select from auth.sessions where id=teste.id(77))
    or not exists(select from auth.users where id=teste.id(74))
    or exists(select from aabb.contas where id=teste.id(74) and ativa) then
    raise exception 'Desativação deve remover sessões e preservar a identidade';
  end if;
end $$;

update auth.users set encrypted_password='marcador-ficticio-2' where id=teste.id(73);
do $$begin
  if exists (select from aabb.sessoes where id=teste.id(76)) then raise exception 'Sessão após mudança de senha'; end if;
  begin
    perform aabb.admitir_login(teste.id(73),teste.id(76),1);
    raise exception 'Admissão com geração anterior';
  exception when insufficient_privilege then null; end;
  if exists (select from aabb.auditoria where registro_id=teste.id(73)
     and (coalesce(anterior,'{}') ? 'encrypted_password' or coalesce(posterior,'{}') ? 'encrypted_password')) then
    raise exception 'Hash presente na auditoria';
  end if;
end $$;
rollback;
