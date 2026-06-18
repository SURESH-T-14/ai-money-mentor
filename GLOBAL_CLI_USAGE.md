# Global CLI: Running Specmatic Tests From Anywhere

## Overview

The `specmatic-test` command is a global CLI tool that allows you to run Specmatic tests from **any directory** on your system, without needing to navigate to the project folder.

## Installation

The CLI is automatically installed globally when you run:

```bash
cd d:\aI money mentor\aI-money-mentor
npm link
```

## Usage

### Basic Command

```bash
specmatic-test [mode]
```

### Available Modes

| Mode | Description |
|------|-------------|
| `contract` (default) | Run contract tests |
| `resiliency:positive` | Run positive resiliency tests |
| `resiliency:all` | Run all resiliency tests |
| `resiliency` | Run all three test suites sequentially |

### Examples

#### Run from anywhere on your system:

```bash
# From C:\ drive
C:\> specmatic-test

# From a random folder
D:\my-folder\project> specmatic-test contract

# Run positive resiliency tests from Desktop
C:\Users\YourName\Desktop> specmatic-test resiliency:positive

# Run all tests
C:\any-location> specmatic-test resiliency
```

### Example Output

```
📝 Running Specmatic contract tests from: D:\aI money mentor\aI-money-mentor

> server@1.0.0 test:contract
> powershell -ExecutionPolicy Bypass -File ../scripts/run-specmatic-mode.ps1 none

Running Contract Tests with schemaResiliencyTests: none
Specmatic image: specmatic/specmatic:latest
APP_URL not set, using default: http://localhost:5000

... test output ...

✅ Tests completed successfully!
```

## How It Works

### Before (Limited)
```
✗ Must be in server/ directory
✗ Must run: npm run test:contract
✗ Cannot run from other locations
```

### After (Flexible)
```
✓ Run from ANY directory
✓ Run: specmatic-test
✓ Same command works everywhere
```

### Technical Details

1. **CLI Entry Point**: `bin/specmatic-test.js`
2. **Package Configuration**: Root `package.json` with `"bin"` entry
3. **Installation Method**: `npm link` (creates symlink in system PATH)
4. **Platform Support**: Windows (PowerShell) and Unix/Linux (Bash)

## Troubleshooting

### Command Not Found

If you get "command not found", reinstall the CLI:

```bash
cd d:\aI money mentor\aI-money-mentor
npm unlink
npm link
```

### Permission Denied (on Unix/Linux)

```bash
# Make script executable
chmod +x bin/specmatic-test.js

# Then re-link
npm link
```

### Need to Update Server Location

If you move the project, the CLI will still work because it's using the project root detection. Just ensure the symlink points to the correct location:

```bash
npm unlink
npm link
```

## Uninstalling the CLI

To remove the global command:

```bash
cd d:\aI money mentor\aI-money-mentor
npm unlink
```

This removes the symlink but keeps the files in your project.

## Development

### File Structure

```
aI-money-mentor/
├── bin/
│   └── specmatic-test.js      ← CLI entry point
├── package.json               ← Contains "bin" configuration
├── server/
│   ├── package.json
│   └── scripts/
│       └── run-specmatic-mode.ps1
└── scripts/
    └── run-specmatic-mode.sh
```

### Modifying the CLI

To update the CLI behavior, edit `bin/specmatic-test.js` and re-link:

```bash
cd d:\aI money mentor\aI-money-mentor
npm link
```

## Integration with IDEs

You can use this CLI in your IDE terminals:

### VS Code

```json
{
  "label": "Run Specmatic Tests",
  "command": "specmatic-test",
  "type": "shell",
  "group": "test"
}
```

### Command Palette

Create a task in `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Specmatic: Contract Tests",
      "command": "specmatic-test",
      "args": ["contract"],
      "type": "shell",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

## Summary

✅ **Can now run tests from anywhere on your system**
✅ **One simple command: `specmatic-test`**
✅ **Supports all test modes**
✅ **Cross-platform (Windows, Mac, Linux)**
✅ **Easy to integrate with IDEs and automation tools**
