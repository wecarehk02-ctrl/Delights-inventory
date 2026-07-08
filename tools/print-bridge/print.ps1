param(
  [Parameter(Mandatory = $true)][string]$FilePath,
  [Parameter(Mandatory = $true)][string]$PrinterName,
  [int]$Copies = 1
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $FilePath)) {
  throw "Print file not found: $FilePath"
}

$printer = Get-Printer -Name $PrinterName -ErrorAction Stop
for ($i = 0; $i -lt $Copies; $i++) {
  Get-Content -LiteralPath $FilePath -Raw -Encoding UTF8 | Out-Printer -Name $printer.Name
}

Write-Output "Printed $Copies copy/copies to $($printer.Name)"
