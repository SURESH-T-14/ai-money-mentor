const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error("Usage: node filter-openapi.js <input_path> <output_path> <mode>");
  process.exit(1);
}

const [inputPath, outputPath, mode] = args;

let allowedStatuses = [];
if (mode === 'none' || mode === 'positiveOnly') {
  allowedStatuses = ['200', '201'];
} else if (mode === 'all') {
  allowedStatuses = ['200', '201', '400'];
} else {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}

console.log(`Filtering OpenAPI spec for mode: ${mode}`);
console.log(`Allowed statuses: ${allowedStatuses.join(', ')}`);

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split(/\r?\n/);

let inResponses = false;
let includeCurrent = true;
const outputLines = [];

for (const line of lines) {
  // Check indentation of the line
  const matchSpaces = line.match(/^ */);
  const indent = matchSpaces ? matchSpaces[0].length : 0;

  if (inResponses) {
    // Look for status code lines at exactly 8 spaces of indentation
    const statusMatch = line.match(/^ {8}([0-9]{3}):/);
    if (statusMatch) {
      const statusCode = statusMatch[1];
      includeCurrent = allowedStatuses.includes(statusCode);
    } else if (indent <= 6 && line.trim() !== '') {
      // Exited responses block (must check that it's not an empty line)
      inResponses = false;
      includeCurrent = true;
    }
  }

  // Look for responses block start at exactly 6 spaces
  if (line.match(/^ {6}responses:\s*$/)) {
    inResponses = true;
    includeCurrent = true;
  }

  if (includeCurrent) {
    outputLines.push(line);
  }
}

fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf8');
console.log(`Filtered OpenAPI spec written to ${outputPath}`);
