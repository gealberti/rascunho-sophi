#Requires -RunAsAdministrator
<#
    Publica o site estático (HTML/CSS/JS) no IIS local.
    Rodar em PowerShell como Administrador:
        powershell -ExecutionPolicy Bypass -File .\deploy\setup-iis.ps1
    Parâmetros opcionais: -SiteName, -Port
#>
param(
    [string]$SiteName = 'sophia-franco',
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'
Import-Module WebAdministration

$SitePath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$AppHost  = 'MACHINE/WEBROOT/APPHOST'

Write-Host "Site: $SiteName | Porta: $Port | Pasta: $SitePath" -ForegroundColor Cyan

# 1) Application pool (sem .NET)
if (-not (Test-Path "IIS:\AppPools\$SiteName")) {
    New-WebAppPool -Name $SiteName | Out-Null
    Write-Host '[ok] Application pool criado'
}
Set-ItemProperty "IIS:\AppPools\$SiteName" -Name managedRuntimeVersion -Value ''

# 2) Site
if (Test-Path "IIS:\Sites\$SiteName") {
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $SitePath
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $SiteName
    Write-Host '[--] Site já existia, caminho e pool atualizados'
} else {
    New-Website -Name $SiteName -Port $Port -PhysicalPath $SitePath -ApplicationPool $SiteName | Out-Null
    Write-Host '[ok] Site criado'
}

# 3) Usuário anônimo = identidade do pool (simplifica permissões)
Set-WebConfigurationProperty -PSPath $AppHost -Location $SiteName `
    -Filter 'system.webServer/security/authentication/anonymousAuthentication' -Name userName -Value ''

# 4) Permissão de leitura na pasta para o pool
icacls $SitePath /grant "IIS AppPool\${SiteName}:(OI)(CI)RX" | Out-Null
Write-Host '[ok] Permissão de leitura concedida ao pool'

# 5) Iniciar
Start-WebAppPool -Name $SiteName -ErrorAction SilentlyContinue
Start-Website -Name $SiteName

Write-Host "`nPronto: http://localhost:$Port" -ForegroundColor Green
