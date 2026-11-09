const fs = require('fs');
const path = require('path');

const coreComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'core_files_comments.json'), 'utf8')
);

function printSection(title, filterFn) {
  console.log(`\n=================== ${title} ===================`);
  const items = coreComments.filter(filterFn);
  for (const item of items) {
    console.log(`\nFile: ${item.file}:${item.line}-${item.endLine} (${item.type})`);
    console.log(item.raw);
  }
}

printSection('SRC/API/CLIENT.TS', c => c.file === 'src/api/client.ts');
printSection('SRC/API/TYPES.TS', c => c.file === 'src/api/types.ts');
printSection('SRC/API/SERVICES', c => c.file.startsWith('src/api/services/'));
