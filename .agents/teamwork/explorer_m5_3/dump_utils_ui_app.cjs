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

printSection('SRC/UTILS/', c => c.file.startsWith('src/utils/'));
printSection('SRC/COMPONENTS/UI/', c => c.file.startsWith('src/components/ui/'));
printSection('SRC/APP/ & APP.TSX', c => c.file.startsWith('src/app/') || c.file === 'src/App.tsx');
