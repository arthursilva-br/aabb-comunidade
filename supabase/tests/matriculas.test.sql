begin;
insert into aabb.oficinas(id,unidade_id,nome) values(teste.id(201),teste.id(1),'Oficina fictícia matrícula');
insert into aabb.turmas(id,oficina_id,unidade_id,turno,ano,inicio_operacional,capacidade,estado)
select teste.id(n),teste.id(201),teste.id(1),turno,extract(year from d),d,1,'ativa'
from (values(202,'matutino'),(203,'vespertino')) x(n,turno),
 (select aabb.hoje(teste.id(1)) d) data;
insert into aabb.alunos(id,unidade_id,nome,nascimento,validado)
values(teste.id(204),teste.id(1),'Outro aluno fictício','2014-01-01',true),
(teste.id(205),teste.id(1),'Cadastro fictício incompleto',null,false);
insert into aabb.aluno_responsavel(unidade_id,aluno_id,responsavel_id) values(teste.id(1),teste.id(204),teste.id(6));
select teste.login('diretora');
set local role authenticated;
do $$
declare
  a uuid:=teste.id(5); b uuid:=teste.id(204); t uuid:=teste.id(202); u uuid:=teste.id(203);
  m uuid; n uuid; fila uuid; fila_b uuid; voltou uuid;
begin
  begin
    perform aabb_api.movimentar_matricula(teste.id(211),'matricular',teste.id(205),t);
    raise exception 'Teste falhou: aceitou provisório';
  exception when raise_exception then if sqlerrm <> 'Cadastro provisório' then raise; end if; end;
  m:=aabb_api.movimentar_matricula(teste.id(212),'matricular',a,t);
  assert m=aabb_api.movimentar_matricula(teste.id(212),'matricular',a,t);
  begin
    perform aabb_api.movimentar_matricula(teste.id(212),'matricular',a,u);
    raise exception 'Teste falhou: aceitou reuso divergente';
  exception when raise_exception then if sqlerrm <> 'Chave já utilizada com parâmetros diferentes' then raise; end if; end;
  begin
    perform aabb_api.movimentar_matricula(teste.id(213),'matricular',a,u);
    raise exception 'Teste falhou: duplicou matrícula';
  exception when raise_exception then if sqlerrm <> 'Matrícula anual ativa ou pendente de revisão' then raise; end if; end;
  n:=aabb_api.movimentar_matricula(teste.id(214),'matricular',b,u);
  fila:=aabb_api.solicitar_espera(u,a);
  begin
    perform aabb_api.movimentar_matricula(teste.id(215),'transferir',a,u,m,fila,null,t);
    raise exception 'Teste falhou: aceitou turma cheia';
  exception when raise_exception then if sqlerrm <> 'Turma sem vaga' then raise; end if; end;
  perform aabb_api.movimentar_matricula(teste.id(216),'desligar',b,u,n);
  assert m=aabb_api.movimentar_matricula(teste.id(215),'transferir',a,u,m,fila,null,t);
  perform aabb_api.movimentar_matricula(teste.id(217),'desligar',a,u,m);
  fila_b:=aabb_api.solicitar_espera(t,b);
  fila:=aabb_api.solicitar_espera(t,a);
  begin
    perform aabb_api.movimentar_matricula(teste.id(218),'reingressar',a,t,null,fila);
    raise exception 'Teste falhou: ignorou ordem';
  exception when raise_exception then if sqlerrm <> 'Seleção fora da ordem exige justificativa' then raise; end if; end;
  voltou:=aabb_api.movimentar_matricula(teste.id(218),'reingressar',a,t,null,fila,'Motivo fictício');
  assert voltou<>m;
  begin
    perform aabb_api.alterar_capacidade(t,0);
    raise exception 'Teste falhou: reduziu sem confirmação';
  exception when raise_exception then if sqlerrm <> 'Capacidade abaixo da ocupação requer confirmação da direção' then raise; end if; end;
  perform aabb_api.alterar_capacidade(t,0,true);
  assert (select vagas=0 and ocupacao=1 from aabb_api.disponibilidade(t));
  perform aabb_api.encerrar_espera(fila_b,'cancelada','Motivo fictício');
end $$;
reset role;
do $$
begin
  begin
    perform from aabb.elegiveis(teste.id(202),aabb.hoje(teste.id(1)));
    raise exception 'Teste falhou: resolveu automaticamente a fronteira de movimentação no dia';
  exception when raise_exception then
    if sqlerrm <> 'Vigência ambígua na data. Revisão administrativa necessária.' then raise; end if;
  end;
  assert (select count(*)=3 from aabb.matriculas where turma_id in (teste.id(202),teste.id(203)));
  assert (select count(*)=1 from aabb.matriculas where turma_id=teste.id(202) and estado='ativa');
  assert (select count(*)=4 from aabb.vinculos_matricula where turma_id in (teste.id(202),teste.id(203)));
  assert (select count(*)=6 from aabb.movimentos where aluno_id in (teste.id(5),teste.id(204)) and ano=extract(year from aabb.hoje(teste.id(1))));
  assert (select count(*)=2 from aabb.espera where turma_id in (teste.id(202),teste.id(203)) and estado='atendida');
  begin
    insert into aabb.matriculas(unidade_id,ano,aluno_id,turma_id,estado)
    select unidade_id,ano,aluno_id,turma_id,estado from aabb.matriculas where aluno_id=teste.id(5) and estado='ativa';
    raise exception 'Teste falhou: índice de unicidade ausente';
  exception when unique_violation then null; end;
  begin
    insert into aabb.matriculas(unidade_id,ano,aluno_id,turma_id,estado)
    select unidade_id,ano+1,aluno_id,turma_id,estado from aabb.matriculas where aluno_id=teste.id(5) and estado='ativa';
    raise exception 'Teste falhou: aceitou ano incompatível';
  exception when foreign_key_violation then null; end;
end $$;
rollback;

begin isolation level repeatable read;
select teste.login('diretora');
set local role authenticated;
do $$
begin
  perform aabb_api.movimentar_matricula(teste.id(212),'matricular',teste.id(5),teste.id(202));
  raise exception 'Teste falhou: isolamento incompatível';
exception when raise_exception then if sqlerrm <> 'Movimentação exige isolamento READ COMMITTED' then raise; end if;
end $$;
rollback;
