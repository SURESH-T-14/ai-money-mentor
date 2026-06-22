#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const mode = process.argv[2] || 'none';
const validModes = ['none', 'positiveOnly', 'all'];

if (!validModes.includes(mode)) {
  console.error(`Invalid mode: ${mode}. Use 'none', 'positiveOnly', or 'all'`);
  process.exit(1);
}

const modeLabel = {
  none: 'Contract Tests',
  positiveOnly: 'Positive Only Resiliency Tests',
  all: 'Full Resiliency Tests'
}[mode];

// Get repository root (parent of scripts directory)
const repoRoot = path.dirname(__dirname);
const appUrl = process.env.APP_URL || 'http://localhost:5000';
const specmaticImage = process.env.SPECMATIC_IMAGE || 'specmatic/specmatic:latest';

// Specmatic work directory
const specmaticWorkDir = path.resolve(repoRoot, 'specmatic', 'schema-resiliency', '.work', mode);

console.log(`Running ${modeLabel}...`);
console.log(`Mode: ${mode}`);
console.log(`APP_URL: ${appUrl}`);
console.log(`Image: ${specmaticImage}`);
console.log(`Specmatic Work Dir: ${specmaticWorkDir}`);

// Create work directory if it doesn't exist
if (!fs.existsSync(specmaticWorkDir)) {
  fs.mkdirSync(specmaticWorkDir, { recursive: true });
  console.log(`Created directory: ${specmaticWorkDir}`);
}

try {
  // Run Specmatic test command
  const cmd = `docker run --rm ` +
    `-v "${specmaticWorkDir}:/usr/src/app" ` +
    `-e "APP_URL=${appUrl}" ` +
    `-e "schemaResiliencyTests=${mode}" ` +
    `${specmaticImage} ` +
    `test --testBaseURL ${appUrl}`;
  
  console.log(`\nExecuting Specmatic tests...\n`);
  execSync(cmd, { stdio: 'inherit' });
  
  console.log(`\n✅ ${modeLabel} completed successfully!`);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ ${modeLabel} failed!`);
  process.exit(error.status || 1);
}
