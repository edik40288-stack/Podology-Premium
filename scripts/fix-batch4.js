const fs = require('fs');
const filePath = 'C:/Users/edik4/.gemini/antigravity/scratch/PODOLOGY-QA-LAB/qa/tests/ui-client-batch-4.spec.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace any multiline text in string literals
content = content.replace(/'([^'\r\n]*\r?\n[^']*)'/g, (match) => {
  return JSON.stringify(match.slice(1, -1).replace(/\r?\n\s*/g, ' ').trim());
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed multiline string literals in batch 4');
