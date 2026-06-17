# Specmatic Schema Resiliency Suite

This folder contains the external examples used by `scripts/run-specmatic-mode.sh`.
The script generates a mode-specific `specmatic.yaml` under `.work/` and runs the
official Specmatic Docker image against the Specmatic schema-resiliency lab
contract.

Run from the repository root:

```bash
bash scripts/run-specmatic-mode.sh none
bash scripts/run-specmatic-mode.sh positiveOnly
bash scripts/run-specmatic-mode.sh all
```

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 none
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 positiveOnly
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 all
```

By default the runner uses `specmatic/specmatic:latest`. To use Specmatic
Enterprise, set `SPECMATIC_IMAGE`:

```bash
SPECMATIC_IMAGE=specmatic/enterprise:latest bash scripts/run-specmatic-mode.sh all
```

If your Enterprise image requires a license file, set `SPECMATIC_LICENSE_FILE`
to the local license path before running.
