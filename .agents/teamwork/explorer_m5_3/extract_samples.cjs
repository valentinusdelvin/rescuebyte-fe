const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comments_inventory.json'), 'utf8')
);

// Group comments by file to see what kinds of comments exist
const samples = {};

for (const item of inventory) {
  const file = item.file;
  const content = fs.readFileSync(path.join('.', file), 'utf8');
  const lines = content.split('\n');
  
  // Extract comment blocks
  const blocks = [];
  let currentBlock = [];
  let inBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const trimmed = l.trim();
    if (trimmed.startsWith('/**') || trimmed.startsWith('/*')) {
      inBlock = true;
      currentBlock.push({ line: i + 1, text: trimmed });
      if (trimmed.includes('*/') && trimmed.length > 3) {
        inBlock = false;
        blocks.push([...currentBlock]);
        currentBlock = [];
      }
    } else if (inBlock) {
      currentBlock.push({ line: i + 1, text: trimmed });
      if (trimmed.includes('*/')) {
        inBlock = false;
        blocks.push([...currentBlock]);
        currentBlock = [];
      }
    } else if (trimmed.startsWith('//')) {
      blocks.push([{ line: i + 1, text: trimmed }]);
    }
  }
  
  samples[file] = blocks;
}

// Print comments from selected architectural files
const targetFiles = [
  'src/api/client.ts',
  'src/api/types.ts',
  'src/api/services/authApi.ts',
  'src/api/services/cartApi.ts',
  'src/api/services/productApi.ts',
  'src/context/AuthContext.tsx',
  'src/context/CartContext.tsx',
  'src/hooks/useAuth.ts',
  'src/hooks/useCart.ts',
  'src/hooks/useProducts.ts',
  'src/hooks/useReviews.ts',
  'src/utils/currency.ts',
  'src/utils/date.ts',
  'src/utils/time.ts',
  'src/components/ui/Button.tsx',
  'src/components/ui/Modal.tsx',
  'src/services/authService.ts',
  'src/services/cartService.ts',
  'src/services/productService.ts',
  'src/services/orderService.ts'
];

let summary = '';
for (const tf of targetFiles) {
  if (samples[tf]) {
    summary += `\n================ FILE: ${tf} ================\n`;
    for (const block of samples[tf]) {
      const firstLine = block[0].line;
      const text = block.map(b => b.text).join('\n  ');
      summary += `Line ${firstLine}:\n  ${text}\n`;
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'comment_samples.txt'), summary, 'utf8');
console.log('Saved comment samples to comment_samples.txt (length:', summary.length, ')');
