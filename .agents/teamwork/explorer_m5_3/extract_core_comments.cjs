const fs = require('fs');
const path = require('path');

const filesToInspect = [
  'src/api/client.ts',
  'src/api/types.ts',
  'src/api/services/authApi.ts',
  'src/api/services/cartApi.ts',
  'src/api/services/orderApi.ts',
  'src/api/services/productApi.ts',
  'src/api/services/reviewApi.ts',
  'src/api/services/storeApi.ts',
  'src/api/services/storageApi.ts',
  'src/api/services/userApi.ts',
  'src/api/services/enumApi.ts',
  'src/hooks/useAuth.ts',
  'src/hooks/useCart.ts',
  'src/hooks/useCheckout.ts',
  'src/hooks/useCustomerCart.ts',
  'src/hooks/useGeolocation.ts',
  'src/hooks/useMerchantOrders.ts',
  'src/hooks/useOrders.ts',
  'src/hooks/useProductDetail.ts',
  'src/hooks/useProducts.ts',
  'src/hooks/useReviews.ts',
  'src/hooks/useStoreProfile.ts',
  'src/context/AuthContext.tsx',
  'src/context/CartContext.tsx',
  'src/context/ToastContext.tsx',
  'src/context/LocationContext.tsx',
  'src/utils/currency.ts',
  'src/utils/date.ts',
  'src/utils/time.ts',
  'src/utils/markdown.ts',
  'src/components/ui/Button.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui/EmptyState.tsx',
  'src/components/ui/Skeleton.tsx',
  'src/app/hashRouting.ts',
  'src/app/useHashNavigation.ts',
  'src/app/AppRoutes.tsx',
  'src/App.tsx'
];

const results = [];

for (const relPath of filesToInspect) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  const content = fs.readFileSync(fullPath, 'utf8');
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
        results.push({
          file: relPath,
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
        results.push({
          file: relPath,
          line: blockStart,
          endLine: lineNum,
          type: 'block',
          raw: blockLines.join('\n')
        });
        blockLines = [];
      }
    } else if (trimmed.startsWith('//')) {
      results.push({
        file: relPath,
        line: lineNum,
        endLine: lineNum,
        type: 'line',
        raw: trimmed
      });
    }
  }
}

fs.writeFileSync(
  path.join(__dirname, 'core_files_comments.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

console.log(`Extracted ${results.length} comment blocks from core architecture files.`);
