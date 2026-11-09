const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comments_inventory.json'), 'utf8')
);

// We want to classify each comment into:
// 1. SLOP: Decorative banner / separator (e.g. /* ====== */)
// 2. SLOP: Obvious echo / restatement (e.g. // Update localStorage, // Initialize state, // Delete a product)
// 3. SLOP: Step-by-step workflow narration (e.g. // 1. Prepend new order..., // Step 2:)
// 4. VALUABLE JSDOC: Function/method/type documentation explaining intent, contracts, parameters, edge cases
// 5. VALUABLE INLINE: Architecture decisions, workarounds, security, sync behavior, non-obvious logic

const auditResults = {
  totalFilesWithComments: inventory.length,
  totalCommentLines: 0,
  breakdownByFolder: {},
  slopCandidates: [],
  valuableToLocalize: []
};

for (const item of inventory) {
  const folder = item.file.split('/')[1] || 'root';
  if (!auditResults.breakdownByFolder[folder]) {
    auditResults.breakdownByFolder[folder] = {
      files: 0,
      totalComments: 0,
      fileList: []
    };
  }
  auditResults.breakdownByFolder[folder].files++;
  auditResults.breakdownByFolder[folder].totalComments += item.commentCount;
  auditResults.breakdownByFolder[folder].fileList.push({
    file: item.file,
    commentCount: item.commentCount,
    totalLines: item.totalLines
  });
  
  auditResults.totalCommentLines += item.commentCount;
}

console.log('--- BREAKDOWN BY FOLDER ---');
for (const [folder, data] of Object.entries(auditResults.breakdownByFolder)) {
  console.log(`${folder.padEnd(12)}: ${data.files.toString().padStart(3)} files, ${data.totalComments.toString().padStart(4)} comment lines`);
}

fs.writeFileSync(
  path.join(__dirname, 'folder_breakdown.json'),
  JSON.stringify(auditResults, null, 2),
  'utf8'
);
