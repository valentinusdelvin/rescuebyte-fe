const fs = require('fs');
const path = require('path');

const coreComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'core_files_comments.json'), 'utf8')
);

// Group by file
const byFile = {};
for (const c of coreComments) {
  if (!byFile[c.file]) byFile[c.file] = [];
  byFile[c.file].push(c);
}

for (const [file, list] of Object.entries(byFile)) {
  console.log(`\n### ${file} (${list.length} blocks)`);
  for (const item of list) {
    const preview = item.raw.replace(/\n\s*/g, ' ').slice(0, 100);
    console.log(`  L${item.line}: [${item.type}] ${preview}`);
  }
}
