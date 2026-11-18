-- Personas, identificadores e datas para teste local descartável.
begin;
set local timezone='America/Sao_Paulo';
insert into aabb.oficinas(id,unidade_id,nome) values(teste.id(10),teste.id(1),'Oficina de teste');
insert into aabb.turmas(id,unidade_id,oficina_id,ano,turno,capacidade,estado,inicio_operacional,marco_digital)
select teste.id(n),teste.id(1),teste.id(10),extract(year from current_date),turno,3,'ativa',current_date,current_date
from (values(11,'matutino'),(12,'vespertino')) x(n,turno);
insert into aabb.semana_turma(unidade_id,turma_id,dia_iso)
values(teste.id(1),teste.id(11),extract(isodow from current_date));
insert into aabb.matriculas(id,unidade_id,ano,aluno_id,turma_id,estado)
values(teste.id(13),teste.id(1),extract(year from current_date),teste.id(5),teste.id(11),'ativa');
insert into aabb.vinculos_matricula(unidade_id,ano,aluno_id,matricula_id,turma_id,inicio,aberto)
values(teste.id(1),extract(year from current_date),teste.id(5),teste.id(13),teste.id(11),current_date,true);
insert into aabb.vinculos_docentes(id,unidade_id,professor_id,turma_id,tipo)
values(teste.id(14),teste.id(1),teste.id(4),teste.id(11),'substituto');
select teste.login('diretora');
set local role authenticated;
select aabb_api.autorizar_docente(teste.id(14),current_date-9,current_date-1);
reset role;
select teste.login('professor');
set local role authenticated;
do $$ begin
 if exists(select from aabb_api.minhas_turmas()) then raise exception 'Concessão expirada'; end if;
end $$;
reset role;
select teste.login('diretora');
set local role authenticated;
select aabb_api.autorizar_docente(teste.id(14),current_date,null) as concessao \gset
reset role;
select teste.login('professor');
set local role authenticated;
do $$
declare u uuid:=teste.id(11); m uuid:=teste.id(13); itens jsonb; c uuid; resultado jsonb;
begin
 if (select count(*) from aabb_api.minhas_turmas())<>1 then raise exception 'Turmas incorretas'; end if;
 select to_jsonb(s) into strict resultado from aabb_api.alunos_docentes(u,current_date) s;
 if resultado ?| array['cpf','rg','observacoes'] or resultado->'responsaveis'->0->>'telefone' is distinct from 'contato fictício'
 then raise exception 'Projeção docente incorreta'; end if;
 begin
   perform * from aabb_api.alunos_docentes(teste.id(12),current_date);
   raise exception 'Turma indevida';
 exception when insufficient_privilege then null; end;
 begin
   perform aabb_api.gravar_chamada(u,current_date,0,'[]',true,teste.id(100));
   raise exception 'Lista incompleta aceita' using errcode='XX000';
 exception when raise_exception then null; end;
 itens:=jsonb_build_array(jsonb_build_object('matricula_id',m,'marca',null));
 if aabb_api.gravar_chamada(u,current_date,0,itens,false,teste.id(101))<>1
 then raise exception 'Rascunho'; end if;
 begin
   perform aabb_api.gravar_chamada(u,current_date,1,itens,true,teste.id(102));
   raise exception 'Marca indefinida aceita' using errcode='XX000';
 exception when raise_exception then null; end;
 itens:=jsonb_build_array(jsonb_build_object('matricula_id',m,'marca','ausente'));
 begin
   perform aabb_api.gravar_chamada(u,current_date,0,itens,true,teste.id(102));
   raise exception 'Revisão obsoleta aceita' using errcode='XX000';
 exception when raise_exception then null; end;
 if aabb_api.gravar_chamada(u,current_date,1,itens,true,teste.id(102))<>2 then raise exception 'Conclusão'; end if;
 if aabb_api.gravar_chamada(u,current_date,1,itens,true,teste.id(102))<>2 then raise exception 'Replay'; end if;
 select chamada_id into strict c from aabb_api.historico_chamadas(u) where concluida and marca='ausente';
 if aabb_api.corrigir_frequencia(c,m,2,'ausente','Justificativa fictícia','Revisão de teste',teste.id(103))<>3 then raise exception 'Correção'; end if;
 if aabb_api.corrigir_frequencia(c,m,2,'ausente','Justificativa fictícia','Revisão de teste',teste.id(103))<>3 then raise exception 'Replay da correção'; end if;
 begin
   perform aabb_api.corrigir_frequencia(c,m,3,'presente',null,' ',teste.id(104));
   raise exception 'Correção sem motivo aceita';
 exception when check_violation then null; end;
end $$;
reset role;
do $$ begin
 if (select count(*) from aabb.correcoes_frequencia where autor=teste.id(3) and marca_anterior='ausente'
 and justificativa_anterior is null and justificativa_nova='Justificativa fictícia')<>1 then raise exception 'Histórico de correção'; end if;
end $$;
update aabb.turmas set estado='encerrada' where id=teste.id(11);
select id as chamada from aabb.chamadas where turma_id=teste.id(11) \gset
set local role authenticated;
do $$ declare c uuid; begin
 select chamada_id into strict c from aabb_api.historico_chamadas(teste.id(11));
 begin
   perform aabb_api.corrigir_frequencia(c,teste.id(13),3,'presente',null,'Teste',teste.id(105));
   raise exception 'Correção após encerramento sem autorização';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select teste.login('diretora');
set local role authenticated;
select aabb_api.permitir_correcao(:'chamada',teste.id(4),current_date);
reset role;
select teste.login('professor');
set local role authenticated;
select aabb_api.corrigir_frequencia(:'chamada',teste.id(13),3,'presente',null,'Teste',teste.id(105));
reset role;
select teste.login('diretora');
set local role authenticated;
select aabb_api.revogar_docente(:'concessao');
reset role;
select teste.login('professor');
set local role authenticated;
do $$ begin
 begin
   perform * from aabb_api.historico_chamadas(teste.id(11));
   raise exception 'Histórico exposto após revogação';
 exception when insufficient_privilege then null; end;
end $$;
-- O substituto autorizado hoje consulta também a chamada anterior à sua concessão.
reset role;
insert into aabb.turmas(id,unidade_id,oficina_id,ano,turno,estado)
values(teste.id(21),teste.id(1),teste.id(10),extract(year from current_date)-1,'matutino','encerrada');
insert into aabb.vinculos_docentes(id,unidade_id,professor_id,turma_id,tipo)
values(teste.id(22),teste.id(1),teste.id(4),teste.id(21),'substituto');
insert into aabb.chamadas(unidade_id,turma_id,data,aberta_por,concluida_por,concluida_em,versao)
values(teste.id(1),teste.id(21),make_date(extract(year from current_date)::integer-1,7,1),
       teste.id(3),teste.id(3),now(),1);
select teste.login('diretora');
set local role authenticated;
select aabb_api.autorizar_docente(teste.id(22),current_date,current_date);
reset role;
select teste.login('professor');
set local role authenticated;
do $$ begin
  if (select count(*) from aabb_api.historico_chamadas(teste.id(21)) where data<current_date and concluida)<>1
    then raise exception 'Histórico anual indisponível ao substituto'; end if;
end $$;
rollback;

