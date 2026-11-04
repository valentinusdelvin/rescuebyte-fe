import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defs = JSON.parse(fs.readFileSync(path.join(__dirname, 'definitions.json'), 'utf8'));

console.log('=== HTTP RESPONSE FORMAT ===');
console.log('Success Response Wrapper:');
console.log(JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_pkg_helpers_http_response.Response'], null, 2));

console.log('\nError Response Wrapper:');
console.log(JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_pkg_helpers_http_response.ErrorResponse'], null, 2));
console.log(JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_pkg_helpers_http_response.ErrorPayload'], null, 2));
console.log(JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_pkg_helpers_http_response.ErrorDetail'], null, 2));

console.log('\nPagination Wrapper:');
console.log(JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_domain_helpers_pagination.Response'], null, 2));

console.log('\nEnums:');
console.log('AuthProvider:', JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_domain_enums.AuthProvider'], null, 2));
console.log('GenderIdx:', JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_domain_enums.GenderIdx'], null, 2));
console.log('UserRoleIdx:', JSON.stringify(defs['github_com_rescuebyte_rescuebyte-be_domain_enums.UserRoleIdx'], null, 2));
