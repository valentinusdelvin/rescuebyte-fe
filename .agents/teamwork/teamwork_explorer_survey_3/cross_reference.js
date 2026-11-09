import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const endpoints = JSON.parse(fs.readFileSync(path.join(__dirname, 'detailed_endpoints.json'), 'utf8'));
const defs = JSON.parse(fs.readFileSync(path.join(__dirname, 'definitions.json'), 'utf8'));
const frontendCalls = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend_api_calls.json'), 'utf8'));

console.log(`Analyzing ${endpoints.length} Swagger endpoints...`);

// Group swagger endpoints by route + method
const swaggerMap = {};
endpoints.forEach(ep => {
  const normRoute = ep.route.replace(/{[^}]+}/g, ':param');
  swaggerMap[`${ep.method} ${ep.route}`] = ep;
});

// Compare with frontend calls
const analysis = endpoints.map(ep => {
  // Normalize Swagger path for matching: e.g. /api/v1/orders/{id} -> /api/v1/orders/
  const paramRegex = new RegExp('^' + ep.route.replace(/{[^}]+}/g, '[^/]+') + '$');

  const matchingCalls = frontendCalls.filter(fc => {
    // Check if endpoint matches
    const cleanEndpoint = fc.endpoint
      .replace(/\${[^}]+}/g, 'PARAM')
      .replace(/\/PARAM$/, '');

    const cleanSwagger = ep.route.replace(/{[^}]+}/g, 'PARAM').replace(/\/PARAM$/, '');

    return (
      cleanEndpoint.startsWith(cleanSwagger) ||
      cleanSwagger.startsWith(cleanEndpoint) ||
      (ep.route.includes('/products/{id}') && fc.endpoint.includes('/products/')) ||
      (ep.route.includes('/stores/{id}') && fc.endpoint.includes('/stores/')) ||
      (ep.route.includes('/orders/{id}') && fc.endpoint.includes('/orders/')) ||
      (ep.route.includes('/cart/items/{id}') && fc.endpoint.includes('/cart/items/')) ||
      (ep.route.includes('/cart/stores/{store_id}') && fc.endpoint.includes('/cart/stores/')) ||
      (ep.route.includes('/payments/order/{order_id}') && fc.endpoint.includes('/payments/order/'))
    ) && (fc.method === 'UNKNOWN' || fc.method === ep.method);
  });

  const files = [...new Set(matchingCalls.map(c => c.file))];

  return {
    method: ep.method,
    route: ep.route,
    tag: ep.tag,
    summary: ep.summary,
    isAuth: ep.isAuth,
    parameters: ep.parameters,
    responses: ep.responses,
    implementedInFrontend: files.length > 0,
    frontendFiles: files
  };
});

fs.writeFileSync(path.join(__dirname, 'endpoint_analysis.json'), JSON.stringify(analysis, null, 2));

const implemented = analysis.filter(a => a.implementedInFrontend);
const missing = analysis.filter(a => !a.implementedInFrontend);

console.log(`Implemented in frontend: ${implemented.length} / ${endpoints.length}`);
console.log(`Not directly implemented in frontend: ${missing.length}`);
console.log('\nMissing Endpoints:');
missing.forEach(m => console.log(`  - [${m.tag}] ${m.method} ${m.route} (${m.summary})`));
