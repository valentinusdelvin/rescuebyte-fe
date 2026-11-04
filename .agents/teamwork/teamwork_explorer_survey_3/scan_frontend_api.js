import fs from 'fs';
import path from 'path';

function findFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.agents' && file !== 'dist') {
        results = results.concat(findFiles(fullPath, exts));
      }
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const srcDir = 'c:/Users/fahmi/Documents/Lomba/rescuebyte-fe/src';
const files = findFiles(srcDir);

const apiCalls = [];

const regexes = [
  /api\.(get|post|put|delete|patch)\s*(?:<[^>]+>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g,
  /axios\.(get|post|put|delete|patch)\s*(?:<[^>]+>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g,
  /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g,
  /[`'"](\/api\/v1\/[^`'"]+)[`'"]/g,
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative('c:/Users/fahmi/Documents/Lomba/rescuebyte-fe', file).replace(/\\/g, '/');

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      apiCalls.push({
        file: relPath,
        match: match[0],
        endpoint: match[2] || match[1],
        method: match[1] && ['get', 'post', 'put', 'delete', 'patch'].includes(match[1].toLowerCase()) ? match[1].toUpperCase() : 'UNKNOWN'
      });
    }
  }
}

console.log(`Scanned ${files.length} source files.`);
console.log(`Found ${apiCalls.length} API calls/endpoint references:`);

const uniqueEndpoints = {};
apiCalls.forEach(call => {
  const key = `${call.method} ${call.endpoint}`;
  if (!uniqueEndpoints[key]) uniqueEndpoints[key] = [];
  uniqueEndpoints[key].push(call.file);
});

for (const [ep, fileList] of Object.entries(uniqueEndpoints)) {
  console.log(`\n${ep}`);
  [...new Set(fileList)].forEach(f => console.log(`   in ${f}`));
}

fs.writeFileSync('c:/Users/fahmi/Documents/Lomba/rescuebyte-fe/.agents/teamwork/teamwork_explorer_survey_3/frontend_api_calls.json', JSON.stringify(apiCalls, null, 2));
