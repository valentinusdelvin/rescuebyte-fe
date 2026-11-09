const fs = require('fs');
const path = require('path');

function getFiles(dir, exts, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getFiles(filePath, exts, fileList);
      }
    } else {
      if (exts.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const rootDir = path.resolve('.');
const srcDir = path.join(rootDir, 'src');
const tsFiles = getFiles(srcDir, ['.ts', '.tsx']);

const results = [];

for (const file of tsFiles) {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const comments = [];
  let inBlockComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (inBlockComment) {
      comments.push({ line: i + 1, text: trimmed, type: 'block' });
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
    } else if (trimmed.startsWith('/*')) {
      inBlockComment = true;
      comments.push({ line: i + 1, text: trimmed, type: 'block' });
      if (trimmed.includes('*/') && !trimmed.endsWith('/*')) {
        inBlockComment = false;
      }
    } else if (trimmed.startsWith('//')) {
      comments.push({ line: i + 1, text: trimmed, type: 'line' });
    }
  }
  
  if (comments.length > 0) {
    results.push({
      file: relPath,
      totalLines: lines.length,
      commentCount: comments.length,
      comments: comments
    });
  }
}

results.sort((a, b) => b.commentCount - a.commentCount);

console.log(`TOTAL FILES WITH COMMENTS: ${results.length} / ${tsFiles.length}`);
console.log('--- TOP FILES BY COMMENT COUNT ---');
for (const r of results.slice(0, 30)) {
  console.log(`${r.commentCount.toString().padStart(4)} comments (${r.totalLines} lines) : ${r.file}`);
}

fs.writeFileSync(
  path.join(__dirname, 'comments_inventory.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);
console.log('Saved full inventory to comments_inventory.json');
