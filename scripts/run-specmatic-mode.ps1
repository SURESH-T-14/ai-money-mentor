param(
  [ValidateSet("none", "positiveOnly", "all")]
  [string]$Mode = "none"
)

$ErrorActionPreference = "Stop"

switch ($Mode) {
  "none" {
    $ModeLabel = "Contract Tests"
    $ExpectedTests = 3
    $ExpectedSuccesses = 3
    $ReportFileName = "contract-test-report.html"
    $OutputFileName = "contract-test-output.txt"
  }
  "positiveOnly" {
    $ModeLabel = "Positive Only Resiliency Tests"
    $ExpectedTests = 42
    $ExpectedSuccesses = 42
    $ReportFileName = "positive-only-report.html"
    $OutputFileName = "positive-only-output.txt"
  }
  "all" {
    $ModeLabel = "Full Resiliency Tests"
    $ExpectedTests = 600
    $ExpectedSuccesses = 600
    $ReportFileName = "resiliency-report.html"
    $OutputFileName = "resiliency-output.txt"
  }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$SpecDir = Join-Path $RootDir "specmatic/schema-resiliency"
$WorkDir = Join-Path $SpecDir ".work/$Mode"
$ExamplesWorkDir = Join-Path $WorkDir "examples"
$ReportDir = Join-Path $RootDir "reports"
$OutputFile = Join-Path $ReportDir $OutputFileName
$ReportFile = Join-Path $ReportDir $ReportFileName
$SpecmaticImage = if ($env:SPECMATIC_IMAGE) { $env:SPECMATIC_IMAGE } else { "specmatic/specmatic:latest" }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  [Console]::Error.WriteLine("Docker is required to run Specmatic tests, but the docker command was not found.")
  exit 127
}

New-Item -ItemType Directory -Force -Path $ExamplesWorkDir, $ReportDir | Out-Null
Get-ChildItem -Path $ExamplesWorkDir -Filter "*.json" -ErrorAction SilentlyContinue | Remove-Item -Force
Copy-Item -Path (Join-Path $SpecDir "examples/*.json") -Destination $ExamplesWorkDir -Force

$SpecmaticYaml = @"
version: 3

components:
  sources:
    labsContracts:
      git:
        url: https://github.com/specmatic/labs-contracts.git
        branch: main

systemUnderTest:
  service:
    definitions:
      - definition:
          source:
            `$ref: "#/components/sources/labsContracts"
          specs:
            - openapi/schema-resiliency/simple-openapi-spec.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "`${APP_URL:http://localhost:8080}"
        filter: "PATH!='/health,/monitor/{id},/swagger' && TAGS!='WIP' && STATUS!='202,429'"
    data:
      examples:
        - directories:
            - ./examples

dependencies:
  services:
    - service:
        definitions:
          - definition:
              source:
                `$ref: "#/components/sources/labsContracts"
              specs:
                - openapi/schema-resiliency/simple-openapi-spec.yaml
        runOptions:
          openapi:
            type: mock
            baseUrl: "`${APP_URL:http://localhost:8080}"

specmatic:
  settings:
    test:
      schemaResiliencyTests: $Mode
    mock:
      generative: true
"@

$LicenseArgs = @()
if ($env:SPECMATIC_LICENSE_FILE) {
  if (-not (Test-Path $env:SPECMATIC_LICENSE_FILE)) {
    [Console]::Error.WriteLine("SPECMATIC_LICENSE_FILE points to a missing file: $env:SPECMATIC_LICENSE_FILE")
    exit 2
  }

  $LicenseArgs = @("-v", "$($env:SPECMATIC_LICENSE_FILE):/specmatic/specmatic-license.txt:ro")
  $SpecmaticYaml += @"

  license:
    path: /specmatic/specmatic-license.txt
"@
}

Set-Content -Path (Join-Path $WorkDir "specmatic.yaml") -Value $SpecmaticYaml -Encoding UTF8

Write-Output "Running $ModeLabel with schemaResiliencyTests: $Mode"
Write-Output "Specmatic image: $SpecmaticImage"

$DockerArgs = @(
  "run",
  "--rm",
  "-v",
  "$($WorkDir):/usr/src/app"
) + $LicenseArgs + @(
  "-w",
  "/usr/src/app",
  $SpecmaticImage,
  "run-suite"
)

$Output = & docker @DockerArgs 2>&1
$DockerStatus = $LASTEXITCODE
$OutputText = ($Output | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
Set-Content -Path $OutputFile -Value $OutputText -Encoding UTF8
Write-Output $OutputText

$Summary = [regex]::Match(
  $OutputText,
  "Tests run:\s*(\d+),\s*Successes:\s*(\d+),\s*Failures:\s*(\d+)(?:,\s*WIP:\s*(\d+),\s*Errors:\s*(\d+))?"
)

$ActualTests = $null
$ActualSuccesses = $null
$ActualFailures = $null
$Wip = $null
$ErrorsCount = $null

if ($Summary.Success) {
  $ActualTests = [int]$Summary.Groups[1].Value
  $ActualSuccesses = [int]$Summary.Groups[2].Value
  $ActualFailures = [int]$Summary.Groups[3].Value
  $Wip = if ($Summary.Groups[4].Success) { [int]$Summary.Groups[4].Value } else { 0 }
  $ErrorsCount = if ($Summary.Groups[5].Success) { [int]$Summary.Groups[5].Value } else { 0 }
}

$Passed = (
  $DockerStatus -eq 0 -and
  $ActualTests -eq $ExpectedTests -and
  $ActualSuccesses -eq $ExpectedSuccesses -and
  $ActualFailures -eq 0 -and
  ($null -eq $Wip -or $Wip -eq 0) -and
  ($null -eq $ErrorsCount -or $ErrorsCount -eq 0)
)

$StatusText = if ($Passed) { "PASS" } else { "FAIL" }
$StatusColor = if ($Passed) { "#d1fadf" } else { "#ffe0e0" }
$GeneratedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

function Format-Value($Value) {
  if ($null -eq $Value) {
    return "-"
  }

  return [string]$Value
}

$EscapedOutput = [System.Net.WebUtility]::HtmlEncode($OutputText)
$EscapedModeLabel = [System.Net.WebUtility]::HtmlEncode($ModeLabel)

$ReportHtml = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>$EscapedModeLabel - Specmatic Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #202124; }
    h1 { margin-bottom: 4px; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 4px; background: $StatusColor; }
    table { border-collapse: collapse; margin: 24px 0; min-width: 520px; }
    th, td { border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; }
    pre { padding: 16px; background: #f6f8fa; border: 1px solid #d0d7de; overflow-x: auto; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>$EscapedModeLabel</h1>
  <p>Generated: $GeneratedAt</p>
  <p>schemaResiliencyTests: <strong>$Mode</strong></p>
  <p>Status: <span class="status">$StatusText</span></p>
  <table>
    <tr><th>Metric</th><th>Expected</th><th>Actual</th></tr>
    <tr><td>Tests run</td><td>$ExpectedTests</td><td>$(Format-Value $ActualTests)</td></tr>
    <tr><td>Successes</td><td>$ExpectedSuccesses</td><td>$(Format-Value $ActualSuccesses)</td></tr>
    <tr><td>Failures</td><td>0</td><td>$(Format-Value $ActualFailures)</td></tr>
    <tr><td>WIP</td><td>0</td><td>$(Format-Value $Wip)</td></tr>
    <tr><td>Errors</td><td>0</td><td>$(Format-Value $ErrorsCount)</td></tr>
    <tr><td>Docker exit code</td><td>0</td><td>$DockerStatus</td></tr>
  </table>
  <h2>Specmatic Output</h2>
  <pre>$EscapedOutput</pre>
</body>
</html>
"@

Set-Content -Path $ReportFile -Value $ReportHtml -Encoding UTF8
Write-Output "Report written to $ReportFile"

if ($DockerStatus -ne 0) {
  exit $DockerStatus
}

if (-not $Summary.Success) {
  [Console]::Error.WriteLine("Specmatic summary line was not found in the output.")
  exit 3
}

if (-not $Passed) {
  [Console]::Error.WriteLine("Specmatic result did not match the expected summary.")
  exit 4
}
