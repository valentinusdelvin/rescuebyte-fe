import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = JSON.parse(fs.readFileSync(path.join(__dirname, 'doc.json'), 'utf8'));

for (const [p, m] of Object.entries(doc.paths)) {
  for (const [verb, op] of Object.entries(m)) {
    const r = op.responses && (op.responses['200'] || op.responses['201']);
    const ref = r?.schema?.$ref || r?.schema?.type || 'none';
    const tag = op.tags?.[0] || '';
    console.log(`${verb.toUpperCase().padEnd(6)} ${p.padEnd(40)} [${tag}] -> ${ref}`);
  }
}
