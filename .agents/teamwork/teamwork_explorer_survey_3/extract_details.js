import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swagger = JSON.parse(fs.readFileSync(path.join(__dirname, 'doc.json'), 'utf8'));

const definitions = swagger.definitions || {};

function resolveRef(ref) {
  if (!ref || !ref.startsWith('#/definitions/')) return ref;
  const defName = ref.replace('#/definitions/', '');
  return { defName, schema: definitions[defName] };
}

console.log('Total definitions:', Object.keys(definitions).length);
console.log('Definition names:', Object.keys(definitions).join(', '));

// Export detailed endpoint spec
const detailedEndpoints = [];

for (const [route, methods] of Object.entries(swagger.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) continue;

    const params = (op.parameters || []).map(p => {
      let schema = p.schema;
      let ref = null;
      if (schema && schema.$ref) {
        ref = schema.$ref.replace('#/definitions/', '');
      }
      return {
        name: p.name,
        in: p.in,
        required: !!p.required,
        type: p.type || (schema ? schema.type : undefined),
        format: p.format || (schema ? schema.format : undefined),
        description: p.description || '',
        schemaRef: ref,
        items: p.items,
        enum: p.enum
      };
    });

    const responses = {};
    for (const [code, resp] of Object.entries(op.responses || {})) {
      let ref = null;
      if (resp.schema && resp.schema.$ref) {
        ref = resp.schema.$ref.replace('#/definitions/', '');
      }
      responses[code] = {
        description: resp.description,
        schemaRef: ref,
        type: resp.schema ? resp.schema.type : undefined
      };
    }

    detailedEndpoints.push({
      route,
      method: method.toUpperCase(),
      summary: op.summary || '',
      description: op.description || '',
      operationId: op.operationId || '',
      tag: (op.tags && op.tags[0]) || 'Uncategorized',
      isAuth: (op.security && op.security.length > 0) || false,
      consumes: op.consumes || [],
      produces: op.produces || [],
      parameters: params,
      responses
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'detailed_endpoints.json'), JSON.stringify(detailedEndpoints, null, 2));
fs.writeFileSync(path.join(__dirname, 'definitions.json'), JSON.stringify(definitions, null, 2));

console.log('Wrote detailed_endpoints.json and definitions.json');
