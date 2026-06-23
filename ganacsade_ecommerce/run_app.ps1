# Flutter build breaks when the project path contains a comma (e.g. "Ganacsade Full Syste,").
# This script maps the repo to drive G: temporarily so builds succeed.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$driveLetter = "G:"

if ($repoRoot -match ",") {
    Write-Host "Detected comma in path: $repoRoot" -ForegroundColor Yellow
    Write-Host "Mapping $driveLetter -> $repoRoot" -ForegroundColor Cyan
    subst $driveLetter /D 2>$null | Out-Null
    subst $driveLetter $repoRoot
    $appDir = Join-Path $driveLetter "ganacsade_ecommerce"
} else {
    $appDir = $PSScriptRoot
}

Set-Location $appDir
flutter run @args

if ($repoRoot -match ",") {
    subst $driveLetter /D | Out-Null
}
