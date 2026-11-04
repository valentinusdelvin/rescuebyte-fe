import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = JSON.parse(fs.readFileSync(path.join(__dirname, 'doc.json'), 'utf8'));

const results = [];

for (const [p, m] of Object.entries(doc.paths)) {
  for (const [verb, op] of Object.entries(m)) {
    const r = op.responses && (op.responses['200'] || op.responses['201']);
    let payloadRef = 'unknown';

    if (r?.schema?.allOf) {
      for (const item of r.schema.allOf) {
        if (item.properties?.payload) {
          const pld = item.properties.payload;
          if (pld.$ref) {
            payloadRef = pld.$ref.replace('#/definitions/', '').split('.').pop();
          } else if (pld.type === 'array' && pld.items?.$ref) {
            payloadRef = `${pld.items.$ref.replace('#/definitions/', '').split('.').pop()}[]`;
          } else if (pld.type) {
            payloadRef = pld.type;
          }
        }
      }
    } else if (r?.schema?.$ref) {
      payloadRef = r.schema.$ref.replace('#/definitions/', '').split('.').pop();
    }

    const bodyParam = op.parameters?.find(param => param.in === 'body');
    const bodyRef = bodyParam?.schema?.$ref?.replace('#/definitions/', '').split('.').pop() || (bodyParam?.schema?.type) || '-';

    results.push({
      method: verb.toUpperCase(),
      route: p,
      tag: op.tags?.[0] || 'Uncategorized',
      summary: op.summary || '',
      requestBody: bodyRef,
      payloadResponse: payloadRef,
      statusCodes: Object.keys(op.responses || {})
    });
  }
}

console.log(`Extracted exact payload models for ${results.length} endpoints:`);
results.forEach(r => {
  console.log(`${r.method.padEnd(6)} ${r.route.padEnd(38)} Req: ${r.requestBody.padEnd(28)} Res: ${r.payloadResponse}`);
});

fs.writeFileSync(path.join(__dirname, 'endpoints_with_payloads.json'), JSON.stringify(results, null, 2));
