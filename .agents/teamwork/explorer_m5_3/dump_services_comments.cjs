const fs = require('fs');
const path = require('path');

const otherComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pages_services_components_comments.json'), 'utf8')
);

const serviceComments = otherComments.filter(c => c.file.startsWith('src/services/'));
console.log('Total service comments:', serviceComments.length);

const byService = {};
for (const c of serviceComments) {
  if (!byService[c.file]) byService[c.file] = [];
  byService[c.file].push(c);
}

for (const [file, items] of Object.entries(byService)) {
  console.log(`\n=== ${file} (${items.length} comments) ===`);
  for (const item of items) {
    const preview = item.raw.replace(/\n\s*/g, ' ').slice(0, 100);
    console.log(`  L${item.line}: [${item.type}] ${preview}`);
  }
}
