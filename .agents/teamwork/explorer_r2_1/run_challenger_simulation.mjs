// Simulated Challenger run with the fix applied
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const original = fs.readFileSync('scripts/test_challenger_r1_r6.mjs', 'utf8');

// Replace the old buggy logic inside the test harness with the proposed fix:
const fixed = original.replace(
  /const isOutOfStock = stockCount === 0 \|\| remainingBoxesText\.toLowerCase\(\)\.includes\('0 box'\);/g,
  'const isOutOfStock = stockCount === 0 || /\\b0\\s*box\\b/i.test(remainingBoxesText) || /\\bhabis\\b/i.test(remainingBoxesText);'
);

const tempScriptPath = path.resolve('.agents/teamwork/explorer_r2_1/simulated_challenger_test.mjs');
fs.writeFileSync(tempScriptPath, fixed, 'utf8');

console.log('Running simulated challenger test with proposed fix:\n');
await import(pathToFileURL(tempScriptPath).href);
