[CmdletBinding()]
param([string]$Psql = "$env:ProgramFiles/PostgreSQL/17/bin/psql.exe")

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$missing = @('supabase', 'docker', 'node' | Where-Object { -not (Get-Command $_ -CommandType Application -ErrorAction SilentlyContinue) })
if (-not (Test-Path -LiteralPath $Psql -PathType Leaf)) { $missing += 'psql' }
if ($missing.Count) { throw "Ferramentas necessárias indisponíveis: $($missing -join ', ')." }

$contextHost = $env:DOCKER_HOST
if (-not $contextHost -or $env:DOCKER_CONTEXT) {
    $contextHost = docker context inspect --format '{{.Endpoints.docker.Host}}'
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar o contexto Docker.' }
}
if ($contextHost -notmatch '^(npipe:/{4}\./pipe/[^/]+|unix:///)') {
    throw 'O Docker deve usar um socket local.'
}
docker version --format '{{.Server.Version}}'
if ($LASTEXITCODE -ne 0) { throw 'O daemon Docker local está indisponível.' }
supabase --version
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar a versão da CLI.' }
& $Psql --version
node --version

$repo = (Resolve-Path "$PSScriptRoot/../../..").Path
$output = (New-Item -Force -ItemType Directory -Path (Join-Path $repo 'output')).FullName
$projeto = 'aabb-auth-' + [guid]::NewGuid().ToString('N').Substring(0, 16)
$pasta = (New-Item -ItemType Directory -Path (Join-Path $output $projeto)).FullName
$caminhoSupabase = (New-Item -ItemType Directory -Path (Join-Path $pasta 'supabase')).FullName
$attempted = $false
$networkId = $null
$saved = @{}

try {
    Copy-Item -LiteralPath (Join-Path $repo 'supabase/migrations') -Destination $caminhoSupabase -Recurse
    $config = Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/config.toml')
    $config = $config -replace '(?m)^project_id = .+$', "project_id = `"$projeto`""
    $config = $config -replace '(?m)^jwt_expiry = 300\r?$', 'jwt_expiry = 120'
    $config = $config -replace '(?m)^\[auth\.rate_limit\]\r?$', "[auth.rate_limit]`nsign_in_sign_ups = 80"
    Set-Content -LiteralPath (Join-Path $caminhoSupabase 'config.toml') -Value $config -Encoding utf8

    $networkId = docker network create -o 'com.docker.network.bridge.host_binding_ipv4=127.0.0.1' $projeto
    if ($LASTEXITCODE -ne 0 -or $networkId -notmatch '^[a-f0-9]{64}$') { throw 'Falha ao criar a rede descartável local.' }
    # A saída da CLI pode conter chaves. Exibir somente o estado e as versões.
    $attempted = $true
    $null = supabase start --workdir $pasta --network-id $networkId 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Supabase start falhou no projeto descartável. Verifique portas, CLI e imagens locais.' }
    $estado = supabase status --workdir $pasta -o env 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Supabase status falhou no projeto descartável.' }
    $valores = @{}
    foreach ($linha in $estado) {
        if ($linha -match '^([A-Z_]+)="([^"\r\n]+)"$') { $valores[$Matches[1]] = $Matches[2] }
    }

    foreach ($item in @(@{ Container = 'rest'; Names = @('PGRST_DB_SCHEMAS') },
        @{ Container = 'auth'; Names = @('GOTRUE_SESSIONS_TIMEBOX', 'GOTRUE_SESSIONS_INACTIVITY_TIMEOUT', 'GOTRUE_JWT_EXP') },
        @{ Container = 'db'; Names = @() })) {
        $dados = docker inspect "supabase_$($item.Container)_$projeto" --format '{{json .Config}}' | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or -not $dados) { throw 'Não foi possível verificar serviços locais.' }
        Write-Host $dados.Image
        $dados.Env | Where-Object { ($_ -split '=', 2)[0] -in $item.Names } | Write-Host
        if ($item.Container -eq 'rest' -and 'PGRST_DB_SCHEMAS=aabb_api' -notin $dados.Env) { throw 'Schemas expostos divergentes.' }
        if ($item.Container -eq 'auth' -and (-not ($dados.Env -match '^GOTRUE_SESSIONS_TIMEBOX=8h(0m0s)?$') -or
            -not ($dados.Env -match '^GOTRUE_SESSIONS_INACTIVITY_TIMEOUT=30m(0s)?$') -or 'GOTRUE_JWT_EXP=120' -notin $dados.Env)) {
            throw 'Limites do Auth divergentes da configuração de homologação.'
        }
    }

    $variaveis = @{
        AABB_HTTP_API = $valores.API_URL
        AABB_HTTP_DB = $valores.DB_URL
        AABB_HTTP_MAIL = ($valores.MAILPIT_URL ?? $valores.INBUCKET_URL)
        AABB_HTTP_ANON = $valores.ANON_KEY
        AABB_HTTP_SERVICE = $valores.SERVICE_ROLE_KEY
        AABB_HTTP_PSQL = $Psql
    }
    foreach ($nome in $variaveis.Keys) {
        $saved[$nome] = [Environment]::GetEnvironmentVariable($nome)
        [Environment]::SetEnvironmentVariable($nome, $variaveis[$nome])
    }
    node --test (Join-Path $PSScriptRoot 'integracao.http.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'A homologação integrada apresentou falhas.' }
} finally {
    foreach ($nome in $saved.Keys) { [Environment]::SetEnvironmentVariable($nome, $saved[$nome]) }
    if ($attempted) {
        $null = supabase stop --workdir $pasta --project-id $projeto --no-backup 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Warning "Confira o encerramento do ambiente descartável $projeto." }
    }
    if ($networkId -match '^[a-f0-9]{64}$') {
        $null = docker network rm $networkId 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Warning "Confira a remoção da rede descartável $projeto." }
    }
    $resolvido = (Resolve-Path -LiteralPath $pasta).Path
    if ($resolvido -eq (Join-Path $output $projeto)) {
        Remove-Item -Recurse -Force -LiteralPath $resolvido
    }
}
