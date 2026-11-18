begin;
-- Núcleo anual. As escritas do cliente passam exclusivamente pelos comandos.
create table aabb.oficinas (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  nome text not null check (btrim(nome) <> ''),
  unique(id, unidade_id)
);
create table aabb.turmas (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references aabb.unidades,
  oficina_id uuid not null,
  ano integer not null check (ano between 1 and 9999),
  turno text not null check (turno in ('matutino','vespertino')),
  capacidade integer check (capacidade >= 0),
  estado text not null default 'preparacao' check (estado in ('preparacao','ativa','encerrada')),
  inicio_operacional date,
  fim_operacional date,
  marco_digital date,
  unique (oficina_id, ano, turno),
  unique (id, unidade_id), unique (id, unidade_id, ano),
  foreign key (oficina_id, unidade_id) references aabb.oficinas(id, unidade_id),
  check (extract(year from inicio_operacional) = ano and extract(year from fim_operacional) = ano),
  check (extract(year from marco_digital) = ano and marco_digital >= inicio_operacional),
  check (fim_operacional >= inicio_operacional),
  check (estado <> 'ativa' or (capacidade is not null and inicio_operacional is not null))
);
create table aabb.semana_turma (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  turma_id uuid not null,
  dia_iso smallint not null check (dia_iso between 1 and 7),
  unique(turma_id,dia_iso),
  foreign key(turma_id,unidade_id) references aabb.turmas(id,unidade_id)
);
create table aabb.excecoes_calendario (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  turma_id uuid not null,
  data date not null,
  atividade boolean not null,
  motivo text not null check (btrim(motivo) <> ''),
  unique(turma_id,data),
  foreign key(turma_id,unidade_id) references aabb.turmas(id,unidade_id)
);
create function aabb.dia_atividade(p_turma uuid,p_data date) returns boolean
language sql stable set search_path='' as $$
  select exists(select from aabb.turmas t where t.id=p_turma
    and t.estado <> 'preparacao' and extract(year from p_data)=t.ano
    and p_data >= t.inicio_operacional and (t.fim_operacional is null or p_data <= t.fim_operacional)
    and coalesce((select e.atividade from aabb.excecoes_calendario e where e.turma_id=t.id and e.data=p_data),
      exists(select from aabb.semana_turma s where s.turma_id=t.id and s.dia_iso=extract(isodow from p_data))))
$$;
create table aabb.matriculas (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  ano integer not null,
  aluno_id uuid not null,
  turma_id uuid not null,
  estado text check (estado in ('ativa','desligada','concluida')),
  unique(id,unidade_id), unique(id,aluno_id,unidade_id,ano),
  foreign key(aluno_id,unidade_id) references aabb.alunos(id,unidade_id),
  foreign key(turma_id,unidade_id,ano) references aabb.turmas(id,unidade_id,ano)
);
create unique index matricula_ativa_anual on aabb.matriculas(aluno_id,ano,unidade_id) where estado='ativa';
create index matricula_ocupacao on aabb.matriculas(turma_id) where estado='ativa';
create table aabb.vinculos_matricula (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  ano integer not null,
  aluno_id uuid not null,
  matricula_id uuid not null,
  turma_id uuid not null,
  inicio date,
  fim date,
  aberto boolean, -- NULL quando a fonte histórica não informa a situação.
  check (fim >= inicio),
  check (aberto is not true or fim is null),
  check (extract(year from inicio)=ano and extract(year from fim)=ano),
  foreign key(matricula_id,aluno_id,unidade_id,ano) references aabb.matriculas(id,aluno_id,unidade_id,ano),
  foreign key(turma_id,unidade_id,ano) references aabb.turmas(id,unidade_id,ano)
);
create unique index vinculo_aberto on aabb.vinculos_matricula(matricula_id) where aberto;
create index vinculo_elegibilidade on aabb.vinculos_matricula(turma_id,inicio,fim);
create table aabb.espera (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  aluno_id uuid not null,
  turma_id uuid not null,
  solicitada_em timestamptz not null default clock_timestamp(),
  estado text not null default 'aguardando' check (estado in ('aguardando','atendida','retirada','cancelada')),
  motivo text check (motivo is null or btrim(motivo)<>''),
  check (estado <> 'cancelada' or motivo is not null),
  foreign key(aluno_id,unidade_id) references aabb.alunos(id,unidade_id),
  foreign key(turma_id,unidade_id) references aabb.turmas(id,unidade_id)
);
create unique index espera_ativa on aabb.espera(aluno_id,turma_id) where estado='aguardando';
create index espera_ordem on aabb.espera(turma_id,solicitada_em,id) where estado='aguardando';
create table aabb.movimentos (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null,
  aluno_id uuid not null,
  ano integer not null,
  matricula_id uuid not null,
  operacao text not null check (operacao in ('matricular','reingressar','transferir','desligar')),
  origem_id uuid,
  destino_id uuid,
  data date not null,
  usuario_id uuid not null references aabb.contas,
  chave uuid not null,
  espera_id uuid references aabb.espera,
  motivo text,
  unique(usuario_id,chave),
  foreign key(matricula_id,aluno_id,unidade_id,ano) references aabb.matriculas(id,aluno_id,unidade_id,ano),
  foreign key(origem_id,unidade_id,ano) references aabb.turmas(id,unidade_id,ano),
  foreign key(destino_id,unidade_id,ano) references aabb.turmas(id,unidade_id,ano)
);
create function aabb.elegiveis(p_turma uuid,p_data date)
returns table(matricula_id uuid, aluno_id uuid)
language plpgsql stable set search_path='' as $$
begin
  if exists(select from aabb.vinculos_matricula v where v.turma_id=p_turma
    and extract(year from p_data)=v.ano and (v.inicio is null or v.inicio<=p_data)
    and (v.fim is null or v.fim>=p_data)
    and (v.inicio is null or v.fim=p_data or (v.fim is null and v.aberto is not true)))
    or exists(select from aabb.movimentos m where m.destino_id=p_turma
      and m.data=p_data and m.operacao in ('matricular','transferir','reingressar')) then
    raise exception 'Vigência ambígua na data. Revisão administrativa necessária.';
  end if;
  return query select v.matricula_id,v.aluno_id from aabb.vinculos_matricula v
    where v.turma_id=p_turma and extract(year from p_data)=v.ano and v.inicio<=p_data
    and (v.fim>p_data or (v.fim is null and v.aberto));
end $$;
-- A migration de chamadas substitui este ponto de integração antes dos grants.
create function aabb.validar_movimento_chamada(p_turma uuid,p_data date) returns void
language plpgsql set search_path='' as $$
begin raise exception 'Módulo de chamadas ainda não instalado'; end $$;

create function aabb_api.movimentar_matricula(
  p_chave uuid, p_operacao text, p_aluno uuid, p_turma uuid,
  p_matricula uuid default null, p_espera uuid default null, p_motivo text default null,
  p_origem_esperada uuid default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare
  t aabb.turmas; m aabb.matriculas; evento aabb.movimentos; fila aabb.espera;
  hoje date; origem uuid; destino uuid; resultado uuid;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Movimentação exige isolamento READ COMMITTED';
  end if;
  select * into t from aabb.turmas where id=p_turma;
  if not found or aabb.admin(t.unidade_id) is not true then raise insufficient_privilege; end if;
  if p_operacao='transferir' and aabb.direcao(t.unidade_id) is not true then raise insufficient_privilege; end if;
  if p_chave is null or p_operacao is null or p_operacao not in ('matricular','reingressar','transferir','desligar')
     or ((p_operacao in ('transferir','desligar')) <> (p_matricula is not null))
     or ((p_operacao='transferir') <> (p_origem_esperada is not null))
     or (p_operacao='desligar' and p_espera is not null) then raise exception 'Comando inválido'; end if;
  perform from aabb.alunos where id=p_aluno and unidade_id=t.unidade_id for update;
  if not found then raise exception 'Cadastro indisponível'; end if;
  select * into evento from aabb.movimentos where usuario_id=auth.uid() and chave=p_chave;
  if found then
    if evento.operacao=p_operacao and evento.aluno_id=p_aluno and coalesce(evento.destino_id,evento.origem_id)=p_turma
      and (p_matricula is null or evento.matricula_id=p_matricula)
      and (p_origem_esperada is null or p_origem_esperada=evento.origem_id)
      and evento.espera_id is not distinct from p_espera and evento.motivo is not distinct from p_motivo then return evento.matricula_id;
    end if;
    raise exception 'Chave já utilizada com parâmetros diferentes';
  end if;
  if p_matricula is not null then
    select * into m from aabb.matriculas where id=p_matricula and aluno_id=p_aluno and ano=t.ano and estado='ativa';
    if not found then raise exception 'Matrícula ativa não localizada'; end if;
    origem := m.turma_id;
  end if;
  -- Ordem total impede interbloqueio entre transferências em sentidos opostos.
  perform from aabb.turmas where id in (origem,p_turma) order by id for update;
  select * into strict t from aabb.turmas where id=p_turma;
  hoje := aabb.hoje(t.unidade_id);
  if t.estado<>'ativa' or extract(year from hoje)<>t.ano or hoje<t.inicio_operacional or hoje>t.fim_operacional then
    raise exception 'Turma fora do período operacional';
  end if;
  if p_operacao='transferir' and (origem<>p_origem_esperada or origem=p_turma or not exists(select from aabb.turmas where id=origem and estado='ativa'))
    or p_operacao='desligar' and origem<>p_turma then raise exception 'Origem incompatível'; end if;
  if p_operacao<>'desligar' then
    destino:=p_turma;
    if aabb.cadastro_completo(p_aluno) is not true then raise exception 'Cadastro provisório'; end if;
    if (select count(*) from aabb.matriculas where turma_id=destino and estado='ativa')>=t.capacidade then raise exception 'Turma sem vaga'; end if;
    select * into fila from aabb.espera where turma_id=destino and aluno_id=p_aluno and estado='aguardando' for update;
    if fila.id is distinct from p_espera then raise exception 'Reconfirme a solicitação da lista de espera'; end if;
    if exists(select from aabb.espera e where e.turma_id=destino and e.estado='aguardando'
        and (fila.id is null or (e.solicitada_em,e.id)<(fila.solicitada_em,fila.id)))
        and nullif(btrim(p_motivo),'') is null then raise exception 'Seleção fora da ordem exige justificativa'; end if;
  end if;
  perform aabb.validar_movimento_chamada(p_turma,hoje);
  if p_operacao='transferir' then perform aabb.validar_movimento_chamada(origem,hoje); end if;
  if p_operacao in ('matricular','reingressar') then
    if exists(select from aabb.matriculas where aluno_id=p_aluno and ano=t.ano and (estado='ativa' or estado is null)) then
      raise exception 'Matrícula anual ativa ou pendente de revisão';
    end if;
    if (p_operacao='reingressar') <> exists(select from aabb.matriculas where aluno_id=p_aluno and ano=t.ano and estado='desligada') then
      raise exception 'Reconfirme o tipo da movimentação anual';
    end if;
    insert into aabb.matriculas(unidade_id,ano,aluno_id,turma_id,estado)
      values(t.unidade_id,t.ano,p_aluno,destino,'ativa') returning id into resultado;
  else
    resultado:=m.id;
    update aabb.vinculos_matricula set fim=hoje, aberto=false where matricula_id=m.id and aberto;
    if not found then raise exception 'Vigência de origem pendente de revisão'; end if;
    update aabb.matriculas set turma_id=coalesce(destino,origem), estado=case when destino is null then 'desligada' else 'ativa' end where id=m.id;
  end if;
  if destino is not null then
    insert into aabb.vinculos_matricula(unidade_id,ano,aluno_id,matricula_id,turma_id,inicio,aberto)
      values(t.unidade_id,t.ano,p_aluno,resultado,destino,hoje,true);
  end if;
  if p_espera is not null then update aabb.espera set estado='atendida' where id=p_espera; end if;
  insert into aabb.movimentos(unidade_id,ano,aluno_id,matricula_id,operacao,origem_id,destino_id,data,usuario_id,chave,espera_id,motivo)
    values(t.unidade_id,t.ano,p_aluno,resultado,p_operacao,origem,destino,hoje,auth.uid(),p_chave,p_espera,p_motivo);
  return resultado;
end $$;
create function aabb_api.disponibilidade(p_turma uuid)
returns table(capacidade integer, ocupacao bigint, vagas bigint)
language sql stable security definer set search_path='' as $$
  select t.capacidade, count(m.id), case when t.capacidade is not null then greatest(t.capacidade-count(m.id),0) end
  from aabb.turmas t left join aabb.matriculas m on m.turma_id=t.id and m.estado='ativa'
  where t.id=p_turma and aabb.admin(t.unidade_id) group by t.id
$$;
create function aabb_api.alterar_capacidade(p_turma uuid,p_capacidade integer,p_confirmar_excesso boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare t aabb.turmas;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Capacidade exige isolamento READ COMMITTED';
  end if;
  select * into t from aabb.turmas where id=p_turma;
  if not found or aabb.admin(t.unidade_id) is not true then raise insufficient_privilege; end if;
  perform from aabb.turmas where id=p_turma for update;
  if p_capacidade is null or p_capacidade<0 then raise exception 'Capacidade inválida'; end if;
  if p_capacidade < (select count(*) from aabb.matriculas where turma_id=p_turma and estado='ativa')
     and (p_confirmar_excesso is not true or aabb.direcao(t.unidade_id) is not true) then
    raise exception 'Capacidade abaixo da ocupação requer confirmação da direção';
  end if;
  update aabb.turmas set capacidade=p_capacidade where id=p_turma;
end $$;
create function aabb_api.solicitar_espera(p_turma uuid,p_aluno uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare t aabb.turmas; resultado uuid;
begin
  select * into t from aabb.turmas where id=p_turma;
  if not found or aabb.admin(t.unidade_id) is not true then raise insufficient_privilege; end if;
  perform from aabb.alunos where id=p_aluno and unidade_id=t.unidade_id for update;
  if not found then raise exception 'Cadastro indisponível'; end if;
  select * into t from aabb.turmas where id=p_turma for update;
  if t.estado<>'ativa' or exists(select from aabb.matriculas where aluno_id=p_aluno and turma_id=p_turma and estado='ativa')
     then raise exception 'Solicitação incompatível'; end if;
  select id into resultado from aabb.espera where aluno_id=p_aluno and turma_id=p_turma and estado='aguardando';
  if found then return resultado; end if;
  insert into aabb.espera(unidade_id,turma_id,aluno_id) values(t.unidade_id,p_turma,p_aluno) returning id into resultado;
  return resultado;
end $$;
create function aabb_api.encerrar_espera(p_id uuid,p_estado text,p_motivo text default null) returns void
language plpgsql security definer set search_path='' as $$
declare e aabb.espera;
begin
  select * into e from aabb.espera where id=p_id;
  if not found or aabb.admin(e.unidade_id) is not true then raise insufficient_privilege; end if;
  perform from aabb.turmas where id=e.turma_id for update;
  if p_estado is null or p_estado not in ('cancelada','retirada') then raise exception 'Estado inválido'; end if;
  update aabb.espera set estado=p_estado,motivo=p_motivo where id=p_id and estado='aguardando';
  if not found then raise exception 'Solicitação já encerrada'; end if;
end $$;
revoke all on all functions in schema aabb_api,aabb from public,anon,authenticated,service_role;
commit;
