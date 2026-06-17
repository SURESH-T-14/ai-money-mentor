#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-none}"

case "$MODE" in
  none)
    MODE_LABEL="Contract Tests"
    EXPECTED_TESTS="3"
    EXPECTED_SUCCESSES="3"
    REPORT_FILE_NAME="contract-test-report.html"
    OUTPUT_FILE_NAME="contract-test-output.txt"
    ;;
  positiveOnly)
    MODE_LABEL="Positive Only Resiliency Tests"
    EXPECTED_TESTS="42"
    EXPECTED_SUCCESSES="42"
    REPORT_FILE_NAME="positive-only-report.html"
    OUTPUT_FILE_NAME="positive-only-output.txt"
    ;;
  all)
    MODE_LABEL="Full Resiliency Tests"
    EXPECTED_TESTS="600"
    EXPECTED_SUCCESSES="600"
    REPORT_FILE_NAME="resiliency-report.html"
    OUTPUT_FILE_NAME="resiliency-output.txt"
    ;;
  *)
    echo "Unsupported Specmatic mode: $MODE" >&2
    echo "Usage: $0 none|positiveOnly|all" >&2
    exit 2
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEC_DIR="$ROOT_DIR/specmatic/schema-resiliency"
WORK_DIR="$SPEC_DIR/.work/$MODE"
REPORT_DIR="$ROOT_DIR/reports"
OUTPUT_FILE="$REPORT_DIR/$OUTPUT_FILE_NAME"
REPORT_FILE="$REPORT_DIR/$REPORT_FILE_NAME"
SPECMATIC_IMAGE="${SPECMATIC_IMAGE:-specmatic/specmatic:latest}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run Specmatic tests, but the docker command was not found." >&2
  exit 127
fi

mkdir -p "$WORK_DIR/examples" "$REPORT_DIR"
rm -f "$WORK_DIR/examples"/*.json
cp "$SPEC_DIR/examples/"*.json "$WORK_DIR/examples/"

cat > "$WORK_DIR/specmatic.yaml" <<YAML
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
            \$ref: "#/components/sources/labsContracts"
          specs:
            - openapi/schema-resiliency/simple-openapi-spec.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "\${APP_URL:http://localhost:8080}"
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
                \$ref: "#/components/sources/labsContracts"
              specs:
                - openapi/schema-resiliency/simple-openapi-spec.yaml
        runOptions:
          openapi:
            type: mock
            baseUrl: "\${APP_URL:http://localhost:8080}"

specmatic:
  settings:
    test:
      schemaResiliencyTests: $MODE
    mock:
      generative: true
YAML

LICENSE_ARGS=()
if [ -n "${SPECMATIC_LICENSE_FILE:-}" ]; then
  if [ ! -f "$SPECMATIC_LICENSE_FILE" ]; then
    echo "SPECMATIC_LICENSE_FILE points to a missing file: $SPECMATIC_LICENSE_FILE" >&2
    exit 2
  fi

  LICENSE_ARGS=(-v "$SPECMATIC_LICENSE_FILE:/specmatic/specmatic-license.txt:ro")
  cat >> "$WORK_DIR/specmatic.yaml" <<'YAML'
  license:
    path: /specmatic/specmatic-license.txt
YAML
fi

echo "Running $MODE_LABEL with schemaResiliencyTests: $MODE"
echo "Specmatic image: $SPECMATIC_IMAGE"

set +e
docker run --rm \
  -v "$WORK_DIR:/usr/src/app" \
  "${LICENSE_ARGS[@]}" \
  -w /usr/src/app \
  "$SPECMATIC_IMAGE" test 2>&1 | tee "$OUTPUT_FILE"
DOCKER_STATUS=${PIPESTATUS[0]}
set -e

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python is required to generate the HTML report." >&2
  exit 127
fi

set +e
"$PYTHON_BIN" - "$OUTPUT_FILE" "$REPORT_FILE" "$MODE_LABEL" "$MODE" "$EXPECTED_TESTS" "$EXPECTED_SUCCESSES" "$DOCKER_STATUS" <<'PY'
import datetime
import html
import re
import sys
from pathlib import Path

output_path = Path(sys.argv[1])
report_path = Path(sys.argv[2])
mode_label = sys.argv[3]
mode = sys.argv[4]
expected_tests = int(sys.argv[5])
expected_successes = int(sys.argv[6])
docker_status = int(sys.argv[7])

text = output_path.read_text(encoding="utf-8", errors="replace")
summary = re.search(
    r"Tests run:\s*(\d+),\s*Successes:\s*(\d+),\s*Failures:\s*(\d+)"
    r"(?:,\s*WIP:\s*(\d+),\s*Errors:\s*(\d+))?",
    text,
)

actual_tests = actual_successes = actual_failures = None
wip = errors = None
if summary:
    actual_tests = int(summary.group(1))
    actual_successes = int(summary.group(2))
    actual_failures = int(summary.group(3))
    wip = int(summary.group(4) or 0)
    errors = int(summary.group(5) or 0)

passed = (
    docker_status == 0
    and actual_tests == expected_tests
    and actual_successes == expected_successes
    and actual_failures == 0
    and (wip in (None, 0))
    and (errors in (None, 0))
)
status = "PASS" if passed else "FAIL"
generated_at = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def value_or_dash(value):
    return "-" if value is None else str(value)

report_path.write_text(
    f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{html.escape(mode_label)} - Specmatic Report</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 32px; color: #202124; }}
    h1 {{ margin-bottom: 4px; }}
    .status {{ display: inline-block; padding: 4px 10px; border-radius: 4px; background: {'#d1fadf' if passed else '#ffe0e0'}; }}
    table {{ border-collapse: collapse; margin: 24px 0; min-width: 520px; }}
    th, td {{ border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; }}
    th {{ background: #f6f8fa; }}
    pre {{ padding: 16px; background: #f6f8fa; border: 1px solid #d0d7de; overflow-x: auto; white-space: pre-wrap; }}
  </style>
</head>
<body>
  <h1>{html.escape(mode_label)}</h1>
  <p>Generated: {generated_at}</p>
  <p>schemaResiliencyTests: <strong>{html.escape(mode)}</strong></p>
  <p>Status: <span class="status">{status}</span></p>
  <table>
    <tr><th>Metric</th><th>Expected</th><th>Actual</th></tr>
    <tr><td>Tests run</td><td>{expected_tests}</td><td>{value_or_dash(actual_tests)}</td></tr>
    <tr><td>Successes</td><td>{expected_successes}</td><td>{value_or_dash(actual_successes)}</td></tr>
    <tr><td>Failures</td><td>0</td><td>{value_or_dash(actual_failures)}</td></tr>
    <tr><td>WIP</td><td>0</td><td>{value_or_dash(wip)}</td></tr>
    <tr><td>Errors</td><td>0</td><td>{value_or_dash(errors)}</td></tr>
    <tr><td>Docker exit code</td><td>0</td><td>{docker_status}</td></tr>
  </table>
  <h2>Specmatic Output</h2>
  <pre>{html.escape(text)}</pre>
</body>
</html>
""",
    encoding="utf-8",
)

print(f"Report written to {report_path}")
if not summary:
    print("Specmatic summary line was not found in the output.", file=sys.stderr)
    sys.exit(3)
if not passed:
    print("Specmatic result did not match the expected summary.", file=sys.stderr)
    sys.exit(4)
PY
REPORT_STATUS=$?
set -e

if [ "$DOCKER_STATUS" -ne 0 ]; then
  exit "$DOCKER_STATUS"
fi

exit "$REPORT_STATUS"
