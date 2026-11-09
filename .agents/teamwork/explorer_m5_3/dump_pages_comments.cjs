const fs = require('fs');
const path = require('path');

const otherComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pages_services_components_comments.json'), 'utf8')
);

const pageComments = otherComments.filter(c => c.file.startsWith('src/pages/'));
console.log('Total page comments:', pageComments.length);

const byPage = {};
for (const c of pageComments) {
  if (!byPage[c.file]) byPage[c.file] = [];
  byPage[c.file].push(c);
}

for (const [file, items] of Object.entries(byPage)) {
  console.log(`\n=== ${file} (${items.length} comments) ===`);
  for (const item of items) {
    const preview = item.raw.replace(/\n\s*/g, ' ').slice(0, 90);
    console.log(`  L${item.line}: [${item.type}] ${preview}`);
  }
}
