-- Apenas no cluster efêmero criado por run.ps1.
create schema teste;
create function teste.id(n integer) returns uuid language sql immutable as $$
 select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid
$$;
insert into aabb.unidades(id,nome,fuso) values(teste.id(1),'Unidade fictícia','America/Sao_Paulo');
insert into auth.users(id,email) values
 (teste.id(2),'direcao@example.invalid'),(teste.id(3),'docente@example.invalid');
insert into aabb.contas(id,ativa,troca_pendente) values (teste.id(2),true,false),(teste.id(3),true,false);
insert into aabb.funcoes(unidade_id,conta_id,papel) values (teste.id(1),teste.id(2),'diretora'),(teste.id(1),teste.id(3),'professor');
insert into auth.sessions(id,user_id,created_at) values
 ('a0000000-0000-4000-8000-000000000002',teste.id(2),now()),
 ('a0000000-0000-4000-8000-000000000003',teste.id(3),now());
insert into aabb.sessoes(id,conta_id) select id,user_id from auth.sessions;
insert into aabb.professores(id,unidade_id,conta_id,nome) values(teste.id(4),teste.id(1),teste.id(3),'Docente de teste');
insert into aabb.alunos(id,unidade_id,nome,nascimento,validado) values(teste.id(5),teste.id(1),'Aluno de teste','2015-01-01',true);
insert into aabb.responsaveis(id,unidade_id,nome,telefone) values(teste.id(6),teste.id(1),'Responsável de teste','contato fictício');
insert into aabb.aluno_responsavel(unidade_id,aluno_id,responsavel_id) values(teste.id(1),teste.id(5),teste.id(6));

create function teste.login(papel text) returns void language plpgsql as $$
declare n integer;
begin
 n := case papel when 'diretora' then 2 when 'professor' then 3 end;
 if n is null then raise exception 'Persona fictícia inválida'; end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teste.id(n),'role','authenticated',
  'session_id','a0000000-0000-4000-8000-00000000000'||n)::text,false);
end $$;
grant usage on schema teste to authenticated,anon;
grant execute on all functions in schema teste to authenticated,anon;
