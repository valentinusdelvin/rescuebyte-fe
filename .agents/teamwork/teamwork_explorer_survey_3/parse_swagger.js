import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docPath = path.join(__dirname, 'doc.json');
const swagger = JSON.parse(fs.readFileSync(docPath, 'utf8'));

console.log('=== SWAGGER / OPENAPI OVERVIEW ===');
console.log('Swagger Version:', swagger.swagger || swagger.openapi);
console.log('Info:', JSON.stringify(swagger.info, null, 2));
console.log('Host:', swagger.host);
console.log('BasePath:', swagger.basePath);
console.log('Schemes:', swagger.schemes);
console.log('Security Definitions:', JSON.stringify(swagger.securityDefinitions || swagger.components?.securitySchemes, null, 2));

const tags = swagger.tags || [];
console.log('\n=== TAGS ===');
tags.forEach(t => console.log(`- ${t.name}: ${t.description || ''}`));

const paths = swagger.paths || {};
const endpoints = [];

for (const [route, methods] of Object.entries(paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
      endpoints.push({
        route,
        method: method.toUpperCase(),
        summary: op.summary || '',
        description: op.description || '',
        operationId: op.operationId || '',
        tags: op.tags || [],
        security: op.security || [],
        parameters: op.parameters || [],
        responses: Object.keys(op.responses || {})
      });
    }
  }
}

console.log(`\nTotal Endpoints: ${endpoints.length}`);

// Group by tags
const byTag = {};
endpoints.forEach(ep => {
  const tag = (ep.tags && ep.tags[0]) || 'Uncategorized';
  if (!byTag[tag]) byTag[tag] = [];
  byTag[tag].push(ep);
});

console.log('\n=== ENDPOINTS BY TAG ===');
for (const [tag, eps] of Object.entries(byTag)) {
  console.log(`\n## Tag: ${tag} (${eps.length} endpoints)`);
  eps.forEach(ep => {
    const sec = ep.security.length > 0 ? '[AUTH]' : '[PUBLIC]';
    console.log(`  ${ep.method.padEnd(6)} ${ep.route.padEnd(40)} ${sec} ${ep.summary}`);
  });
}
