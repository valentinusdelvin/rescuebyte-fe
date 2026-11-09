const fs = require('fs');
const path = require('path');

const otherComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pages_services_components_comments.json'), 'utf8')
);

const componentComments = otherComments.filter(c => c.file.startsWith('src/components/'));
console.log('Total component comments:', componentComments.length);

const byComp = {};
for (const c of componentComments) {
  if (!byComp[c.file]) byComp[c.file] = [];
  byComp[c.file].push(c);
}

for (const [file, items] of Object.entries(byComp)) {
  console.log(`\n=== ${file} (${items.length} comments) ===`);
  for (const item of items) {
    const preview = item.raw.replace(/\n\s*/g, ' ').slice(0, 90);
    console.log(`  L${item.line}: [${item.type}] ${preview}`);
  }
}
