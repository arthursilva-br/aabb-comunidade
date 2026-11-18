# Executar com pwsh -File supabase/tests/run.ps1 em Windows com PostgreSQL 17.
[CmdletBinding()]
param([string]$PgBin = "$env:ProgramFiles/PostgreSQL/17/bin")

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/../..").Path
$output = New-Item -Force -ItemType Directory -Path "$repo/output"
$runName = 'pg-aabb-' + [guid]::NewGuid().ToString('N')
$scratch = New-Item -ItemType Directory -Path (Join-Path $output.FullName $runName)
$pwFile = Join-Path $scratch.FullName 'bootstrap.local'
$pgCtl = Join-Path $PgBin 'pg_ctl.exe'
$started = $false
$saved = @{}

function Invoke-Checked([string]$Program, [string[]]$Arguments) {
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$([IO.Path]::GetFileName($Program)) retornou $LASTEXITCODE."
    }
}
function Invoke-SqlFile($File) {
    Write-Host "Executando $([IO.Path]::GetFileName($File))"
    $relative = [IO.Path]::GetRelativePath($scratch.FullName, $File)
    Invoke-Checked 'psql.exe' @('-X', '-w', '-q', '-v', 'ON_ERROR_STOP=1', '-f', $relative)
}
Push-Location -LiteralPath $scratch.FullName
try {
    # Ignorar credenciais, serviços e opções libpq herdadas.
    foreach ($entry in Get-ChildItem Env:PG*) {
        $saved[$entry.Name] = $entry.Value
        Remove-Item "Env:$($entry.Name)"
    }
    $saved['PATH'] = $env:PATH
    $env:PATH = "$PgBin;$env:PATH"
    $env:PGHOST = '127.0.0.1'
    $socket = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $socket.Start()
    try { $env:PGPORT = $socket.LocalEndpoint.Port.ToString() } finally { $socket.Stop() }
    $env:PGDATABASE = 'postgres'
    $env:PGUSER = 'aabb_teste'
    $env:PGCLIENTENCODING = 'UTF8'
    $env:PGPASSWORD = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    [IO.File]::WriteAllText($pwFile, $env:PGPASSWORD, [Text.Encoding]::ASCII)
    Invoke-Checked (Join-Path $PgBin 'initdb.exe') @('-D', 'pgdata', '-U', $env:PGUSER, '--pwfile=bootstrap.local', '-A', 'scram-sha-256', '--encoding=UTF8', '--locale=C', '--no-sync')
    Remove-Item -LiteralPath $pwFile
    $server = Start-Process -FilePath (Join-Path $PgBin 'postgres.exe') -ArgumentList @('-D', 'pgdata', '-h', '127.0.0.1', '-p', $env:PGPORT) -PassThru -WindowStyle Hidden -WorkingDirectory $scratch.FullName -RedirectStandardError (Join-Path $scratch.FullName 'servidor.log')
    $limit = [DateTime]::UtcNow.AddSeconds(30)
    do {
        if ($server.HasExited) {
            Get-Content -LiteralPath (Join-Path $scratch.FullName 'servidor.log') -Tail 10
            throw 'O servidor descartavel encerrou durante a inicializacao.'
        }
        Start-Sleep -Milliseconds 300
        $status = Get-Content 'pgdata/postmaster.pid' -ErrorAction SilentlyContinue
    } until (($status -and $status[-1].Trim() -eq 'ready') -or [DateTime]::UtcNow -ge $limit)
    $started = $true
    if (-not $status -or $status[-1].Trim() -ne 'ready') { throw 'Timeout iniciando PostgreSQL.' }
    Invoke-SqlFile "$PSScriptRoot/auth_fixture.sql"
    $migrations = @(Get-ChildItem "$PSScriptRoot/../migrations/*.sql" | Sort-Object Name)
    $sqlTests = @(Get-ChildItem "$PSScriptRoot/*.test.sql" | Sort-Object Name)
    $parallelTests = @(Get-ChildItem "$PSScriptRoot/*.test.ps1" | Sort-Object Name)
    if (-not $migrations.Count -or -not $sqlTests.Count -or -not $parallelTests.Count) {
        throw 'Suite incompleta: sao necessarias migrations, testes SQL e teste concorrente.'
    }
    foreach ($file in $migrations) {
        Invoke-SqlFile $file.FullName
    }
    Invoke-SqlFile "$PSScriptRoot/dados_fixture.sql"
    foreach ($file in $sqlTests) {
        Invoke-SqlFile $file.FullName
    }
    foreach ($file in $parallelTests) {
        Write-Host "Executando $($file.Name)"
        Invoke-Checked 'pwsh.exe' @('-NoProfile', '-File', $file.FullName)
    }
} finally {
    try {
        if ($started) { Invoke-Checked $pgCtl @('stop', '-D', 'pgdata', '-m', 'fast', '-w') }
        Pop-Location
        $resolved = (Resolve-Path -LiteralPath $scratch.FullName).Path
        if ($resolved -eq (Join-Path $output.FullName $runName)) {
            Remove-Item -Recurse -Force -LiteralPath $resolved
        }
    } finally {
        foreach ($entry in Get-ChildItem Env:PG*) { Remove-Item "Env:$($entry.Name)" }
        foreach ($name in $saved.Keys) { Set-Item "Env:$name" $saved[$name] }
    }
}
