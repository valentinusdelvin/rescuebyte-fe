const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comments_inventory.json'), 'utf8')
);

const slopPatterns = [
  { name: 'decorative_separator', regex: /^[/*\s-]*[=\-#*]{4,}[/*\s-]*$/ },
  { name: 'empty_label', regex: /^\/\/\s*(State|Hooks|Props|Handlers|Helper functions?|Main logic|Core logic|Constants|Imports|Types|Components?)\s*$/i },
  { name: 'workflow_step', regex: /^\/\/\s*(Step\s*\d+|First|Next|Then|Finally)[:\s]/i },
  { name: 'obvious_restatement', regex: /^\/\/\s*(Set\s+\w+\s+to|Initialize|Render|Return\s+\w+|Handle\s+\w+\s+change|Toggle\s+\w+)/i },
  { name: 'emoji_in_comment', regex: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u },
  { name: 'end_marker', regex: /^\/\/\s*(end of|end)\s+\w+/i }
];

let totalComments = 0;
let slopCount = 0;
const slopDetails = [];

const categoryStats = {
  api: { files: 0, comments: 0, slop: 0 },
  hooks: { files: 0, comments: 0, slop: 0 },
  context: { files: 0, comments: 0, slop: 0 },
  utils: { files: 0, comments: 0, slop: 0 },
  components: { files: 0, comments: 0, slop: 0 },
  pages: { files: 0, comments: 0, slop: 0 },
  services: { files: 0, comments: 0, slop: 0 },
  app: { files: 0, comments: 0, slop: 0 }
};

function getCategory(filePath) {
  if (filePath.startsWith('src/api/')) return 'api';
  if (filePath.startsWith('src/hooks/')) return 'hooks';
  if (filePath.startsWith('src/context/')) return 'context';
  if (filePath.startsWith('src/utils/')) return 'utils';
  if (filePath.startsWith('src/components/')) return 'components';
  if (filePath.startsWith('src/pages/')) return 'pages';
  if (filePath.startsWith('src/services/')) return 'services';
  if (filePath.startsWith('src/app/')) return 'app';
  return 'other';
}

for (const item of inventory) {
  const cat = getCategory(item.file);
  if (categoryStats[cat]) {
    categoryStats[cat].files++;
    categoryStats[cat].comments += item.commentCount;
  }
  
  for (const c of item.comments) {
    totalComments++;
    let isSlop = false;
    for (const pat of slopPatterns) {
      if (pat.regex.test(c.text)) {
        isSlop = true;
        slopCount++;
        slopDetails.push({
          file: item.file,
          line: c.line,
          text: c.text,
          pattern: pat.name
        });
        if (categoryStats[cat]) categoryStats[cat].slop++;
        break;
      }
    }
  }
}

console.log(`TOTAL COMMENTS ANALYZED: ${totalComments}`);
console.log(`POTENTIAL AI SLOP COMMENTS: ${slopCount} (${((slopCount/totalComments)*100).toFixed(1)}%)`);
console.log('\n--- STATS BY ARCHITECTURAL CATEGORY ---');
console.table(categoryStats);

console.log('\n--- SAMPLE SLOP DETECTIONS (First 25) ---');
for (const s of slopDetails.slice(0, 25)) {
  console.log(`[${s.pattern}] ${s.file}:${s.line} -> "${s.text}"`);
}

fs.writeFileSync(
  path.join(__dirname, 'slop_analysis.json'),
  JSON.stringify({ totalComments, slopCount, categoryStats, slopDetails }, null, 2),
  'utf8'
);
