# Requer o cluster descartável e a fixture de run.ps1.
$ErrorActionPreference = 'Stop'
if ($env:PGHOST -ne '127.0.0.1' -or $env:PGUSER -ne 'aabb_teste') {
    throw 'Execute pelo runner de banco isolado.'
}
$psql = (Get-Command psql -CommandType Application -ErrorAction Stop).Source
function Invoke-TestSql([string]$Sql) {
    $result = & $psql -X -w -qAt -v ON_ERROR_STOP=1 -c $Sql
    if ($LASTEXITCODE -ne 0) { throw 'Falha no SQL de preparação ou conferência.' }
    return $result
}
function Start-Session([string]$Name) {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $psql
    $info.Arguments = '-X -w -qAt -v ON_ERROR_STOP=1'
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardInput = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.Environment['PGAPPNAME'] = $Name
    return [Diagnostics.Process]::Start($info)
}
function Wait-Condition([string]$Query) {
    $deadline = [DateTime]::UtcNow.AddSeconds(20)
    do {
        if ((Invoke-TestSql $Query) -eq 't') { return }
        Start-Sleep -Milliseconds 100
    } while ([DateTime]::UtcNow -lt $deadline)
    throw 'Condição de concorrência não observada antes do limite.'
}
Invoke-TestSql @'
insert into aabb.oficinas(id,unidade_id,nome) values(teste.id(301),teste.id(1),'Oficina de teste');
insert into aabb.turmas(id,unidade_id,oficina_id,ano,turno,estado,inicio_operacional,capacidade)
select teste.id(302),teste.id(1),teste.id(301),extract(year from d),'matutino','ativa',d,1 from (select aabb.hoje(teste.id(1)) d) x;
insert into aabb.alunos(id,unidade_id,nome,nascimento,validado)
values(teste.id(303),teste.id(1),'Segundo aluno de teste','2014-01-01',true);
insert into aabb.aluno_responsavel(unidade_id,aluno_id,responsavel_id) values(teste.id(1),teste.id(303),teste.id(6));
insert into auth.users(id,email) values(teste.id(304),'segunda@example.invalid');
insert into aabb.contas(id,ativa,troca_pendente) values(teste.id(304),true,false);
insert into aabb.funcoes(unidade_id,conta_id,papel) values(teste.id(1),teste.id(304),'administrador');
insert into auth.sessions(id,user_id,created_at) values(teste.id(305),teste.id(304),now());
insert into aabb.sessoes(id,conta_id) values(teste.id(305),teste.id(304));
'@
$winner = Start-Session 'aabb-vaga-A'
$contender = Start-Session 'aabb-vaga-B'
try {
    $winner.StandardInput.WriteLine("begin; select teste.login('diretora'); set local role authenticated; select aabb_api.movimentar_matricula(teste.id(306),'matricular',teste.id(5),teste.id(302));")
    $winner.StandardInput.Flush()
    Wait-Condition "select exists(select from pg_stat_activity where application_name='aabb-vaga-A' and state='idle in transaction' and query like '%movimentar_matricula%')"
    $contender.StandardInput.WriteLine("begin; select set_config('request.jwt.claims',jsonb_build_object('sub',teste.id(304),'session_id',teste.id(305))::text,false); set local role authenticated; select aabb_api.movimentar_matricula(teste.id(307),'matricular',teste.id(303),teste.id(302)); commit;")
    $contender.StandardInput.Close()
    Wait-Condition "select exists(select from pg_stat_activity where application_name='aabb-vaga-B' and wait_event_type='Lock' and query like '%movimentar_matricula%')"
    Write-Host 'Bloqueio real observado em pg_stat_activity; liberando a transação vencedora.'
    $winner.StandardInput.WriteLine('commit;')
    $winner.StandardInput.Close()
    if (!$winner.WaitForExit(10000) -or $winner.ExitCode -ne 0) { throw 'Falha no primeiro commit.' }
    if (!$contender.WaitForExit(10000) -or $contender.ExitCode -eq 0 -or $contender.StandardError.ReadToEnd() -notmatch 'Turma sem vaga') {
        throw 'A segunda operação deveria falhar por ausência de vaga.'
    }
    if ((Invoke-TestSql "select count(*) from aabb.matriculas where turma_id=teste.id(302) and estado='ativa'") -ne '1') {
        throw 'Ocupação divergente após os commits.'
    }
    $consistent = Invoke-TestSql @'
select
 (select count(*) from aabb.matriculas where turma_id=teste.id(302) and aluno_id=teste.id(5) and estado='ativa')=1
 and (select count(*) from aabb.matriculas where turma_id=teste.id(302))=1
 and not exists(select from aabb.matriculas where aluno_id=teste.id(303))
 and (select count(*) from aabb.vinculos_matricula v join aabb.matriculas m on m.id=v.matricula_id where v.turma_id=teste.id(302) and v.aluno_id=teste.id(5) and v.aberto and m.estado='ativa')=1
 and (select count(*) from aabb.vinculos_matricula where turma_id=teste.id(302))=1
 and not exists(select from aabb.vinculos_matricula where aluno_id=teste.id(303))
 and (select count(*) from aabb.movimentos where chave=teste.id(306) and aluno_id=teste.id(5) and destino_id=teste.id(302))=1
 and not exists(select from aabb.movimentos where chave=teste.id(307) or aluno_id=teste.id(303))
 and not exists(select from aabb.auditoria where autor_id=teste.id(304) and entidade in ('matriculas','vinculos_matricula','movimentos','espera'))
 and not exists(select from aabb.espera where turma_id=teste.id(302));
'@
    if ($consistent -ne 't') { throw 'Registros parciais ou inconsistentes após disputa.' }
    Write-Host 'Integridade confirmada: uma matrícula, um vínculo, um movimento vencedor; nenhuma escrita parcial do concorrente.'
    Write-Host 'Disputa da última vaga confirmada com dois administradores em sessões simultâneas.'
} finally {
    foreach ($process in @($winner,$contender)) {
        if (!$process.HasExited) { $process.Kill(); $process.WaitForExit() }
        $process.Dispose()
    }
}
