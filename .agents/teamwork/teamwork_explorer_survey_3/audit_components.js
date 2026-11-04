import fs from 'fs';
import path from 'path';

function findFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', '.agents', 'dist', 'services'].includes(file)) {
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

const componentAudits = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative('c:/Users/fahmi/Documents/Lomba/rescuebyte-fe', file).replace(/\\/g, '/');

  // Check imports from services
  const serviceImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]*services\/([^'"]+)['"]/g;
  let match;
  const importedServices = [];

  while ((match = serviceImportRegex.exec(content)) !== null) {
    const funcs = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const serviceName = match[2];
    importedServices.push({ service: serviceName, functions: funcs });
  }

  if (importedServices.length > 0) {
    const hasUseEffect = content.includes('useEffect(');
    const hasLoadingState = /loading|isLoading|isSubmitting/i.test(content);
    const hasErrorState = /error|isError|errorMessage/i.test(content);
    const hasEmptyState = /empty|noData|kosong|belum ada/i.test(content);

    componentAudits.push({
      file: relPath,
      importedServices,
      hasUseEffect,
      hasLoadingState,
      hasErrorState,
      hasEmptyState,
      totalLines: content.split('\n').length
    });
  }
}

console.log(`Found ${componentAudits.length} components coupling directly to services.`);
componentAudits.forEach(ca => {
  console.log(`\n📄 ${ca.file} (${ca.totalLines} lines):`);
  ca.importedServices.forEach(is => {
    console.log(`   - from ${is.service}: ${is.functions.join(', ')}`);
  });
  console.log(`   [State tracking] useEffect: ${ca.hasUseEffect}, loading: ${ca.hasLoadingState}, error: ${ca.hasErrorState}, empty: ${ca.hasEmptyState}`);
});

fs.writeFileSync('c:/Users/fahmi/Documents/Lomba/rescuebyte-fe/.agents/teamwork/teamwork_explorer_survey_3/component_api_audit.json', JSON.stringify(componentAudits, null, 2));
