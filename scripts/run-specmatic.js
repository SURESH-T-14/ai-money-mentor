#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

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

const serverDir = __dirname.replace('/scripts', '');
const appUrl = process.env.APP_URL || 'http://localhost:5000';
const specmaticImage = process.env.SPECMATIC_IMAGE || 'specmatic/specmatic:latest';

console.log(`Running ${modeLabel}...`);
console.log(`Mode: ${mode}`);
console.log(`APP_URL: ${appUrl}`);
console.log(`Image: ${specmaticImage}`);

try {
  // Run Specmatic test command
  const cmd = `docker run --rm ` +
    `-v "${path.resolve(serverDir)}/specmatic/schema-resiliency/.work/${mode}:/usr/src/app" ` +
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
