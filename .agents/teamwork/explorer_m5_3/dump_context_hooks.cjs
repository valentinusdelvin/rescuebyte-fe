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

printSection('SRC/CONTEXT/', c => c.file.startsWith('src/context/'));
printSection('SRC/HOOKS/', c => c.file.startsWith('src/hooks/'));
