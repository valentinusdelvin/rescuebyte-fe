const fs = require('fs');
const path = require('path');

function getMdFiles(dir, list = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      getMdFiles(p, list);
    } else if (item.endsWith('.md')) {
      list.push(p);
    }
  }
  return list;
}

const mdFiles = getMdFiles('.');
console.log('MARKDOWN FILES IN REPO:');
for (const f of mdFiles) {
  console.log(f.replace(/\\/g, '/'));
}
