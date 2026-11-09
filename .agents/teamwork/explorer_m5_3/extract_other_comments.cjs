const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comments_inventory.json'), 'utf8')
);

// Filter files in pages, services, components
const targetCategories = ['pages', 'services', 'components'];

const detailedComments = [];

for (const item of inventory) {
  const parts = item.file.split('/');
  const cat = parts[1];
  if (!targetCategories.includes(cat)) continue;
  
  const content = fs.readFileSync(path.join('.', item.file), 'utf8');
  const lines = content.split('\n');
  
  let inBlock = false;
  let blockLines = [];
  let blockStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();
    
    if (inBlock) {
      blockLines.push(trimmed);
      if (trimmed.includes('*/')) {
        inBlock = false;
        detailedComments.push({
          file: item.file,
          line: blockStart,
          endLine: lineNum,
          type: 'block',
          raw: blockLines.join('\n')
        });
        blockLines = [];
      }
    } else if (trimmed.startsWith('/*')) {
      inBlock = true;
      blockStart = lineNum;
      blockLines = [trimmed];
      if (trimmed.includes('*/') && trimmed.length > 3) {
        inBlock = false;
        detailedComments.push({
          file: item.file,
          line: blockStart,
          endLine: lineNum,
          type: 'block',
          raw: blockLines.join('\n')
        });
        blockLines = [];
      }
    } else if (trimmed.startsWith('//')) {
      detailedComments.push({
        file: item.file,
        line: lineNum,
        endLine: lineNum,
        type: 'line',
        raw: trimmed
      });
    }
  }
}

console.log(`Found ${detailedComments.length} comment entries across pages, services, components.`);

fs.writeFileSync(
  path.join(__dirname, 'pages_services_components_comments.json'),
  JSON.stringify(detailedComments, null, 2),
  'utf8'
);
