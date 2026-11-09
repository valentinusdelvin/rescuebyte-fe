// Edge Case Test Suite for MysteryBoxCard Stock Logic
// Explorer 1 (.agents/teamwork/explorer_r2_1)

function checkStockStatus(item) {
  const rawStockText = item.remainingBoxesText || '';
  const stockMatch = rawStockText.match(/\d+/);
  const stockCount = stockMatch
    ? parseInt(stockMatch[0], 10)
    : (typeof item.stock === 'number' ? item.stock : 1);

  const isOutOfStock =
    (typeof item.stock === 'number' && item.stock <= 0) ||
    stockCount === 0 ||
    /\b0\s*box\b/i.test(rawStockText) ||
    /\bhabis\b/i.test(rawStockText);

  return { stockCount, isOutOfStock };
}

const matrix = [
  // Required edge cases from task assignment:
  { desc: '"Sisa 0 Box"', item: { remainingBoxesText: 'Sisa 0 Box' }, expected: true },
  { desc: '"0 Box"', item: { remainingBoxesText: '0 Box' }, expected: true },
  { desc: '"Habis"', item: { remainingBoxesText: 'Habis' }, expected: true },
  { desc: '"Sisa 10 Box"', item: { remainingBoxesText: 'Sisa 10 Box' }, expected: false },
  { desc: '"Sisa 20 Box"', item: { remainingBoxesText: 'Sisa 20 Box' }, expected: false },
  { desc: '"Sisa 100 Box"', item: { remainingBoxesText: 'Sisa 100 Box' }, expected: false },
  { desc: '"Sisa 1 Box"', item: { remainingBoxesText: 'Sisa 1 Box' }, expected: false },
  { desc: 'item.stock === 0 (with text "Sisa 0 Box")', item: { remainingBoxesText: 'Sisa 0 Box', stock: 0 }, expected: true },
  { desc: 'item.stock === 0 (with generic text "Tersedia")', item: { remainingBoxesText: 'Tersedia', stock: 0 }, expected: true },

  // Additional boundary cases:
  { desc: '"Stok Habis"', item: { remainingBoxesText: 'Stok Habis' }, expected: true },
  { desc: '"Sudah habis"', item: { remainingBoxesText: 'Sudah habis' }, expected: true },
  { desc: '"0 box" (lowercase)', item: { remainingBoxesText: '0 box' }, expected: true },
  { desc: '"Sisa 50 Box"', item: { remainingBoxesText: 'Sisa 50 Box' }, expected: false },
  { desc: '"Sisa 30 Box"', item: { remainingBoxesText: 'Sisa 30 Box' }, expected: false },
  { desc: '"Sisa 97 Box"', item: { remainingBoxesText: 'Sisa 97 Box' }, expected: false },
  { desc: 'item.stock === 10 (text "Sisa 10 Box")', item: { remainingBoxesText: 'Sisa 10 Box', stock: 10 }, expected: false },
  { desc: 'empty text, stock undefined', item: { remainingBoxesText: '' }, expected: false },
  { desc: 'text "Tersedia 0 Box"', item: { remainingBoxesText: 'Tersedia 0 Box' }, expected: true },
  { desc: 'text "Tersisa 0 box (Habis)"', item: { remainingBoxesText: 'Tersisa 0 box (Habis)' }, expected: true },
  { desc: 'text "Sisa 1000 Box"', item: { remainingBoxesText: 'Sisa 1000 Box' }, expected: false },
  { desc: 'item.stock === -1 (negative stock protection)', item: { remainingBoxesText: 'Tersedia', stock: -1 }, expected: true },
];

let failed = 0;
console.log('Testing MysteryBoxCard Stock Logic Edge Cases:\n');
for (const tc of matrix) {
  const res = checkStockStatus(tc.item);
  if (res.isOutOfStock !== tc.expected) {
    console.error(`FAIL: ${tc.desc} -> Expected: ${tc.expected}, Got: ${res.isOutOfStock}`);
    failed++;
  } else {
    console.log(`PASS: ${tc.desc.padEnd(50)} -> isOutOfStock: ${res.isOutOfStock}`);
  }
}

console.log('\n======================================================');
if (failed === 0) {
  console.log(`ALL ${matrix.length}/${matrix.length} EDGE CASES PASSED!`);
  process.exit(0);
} else {
  console.error(`FAILED ${failed} tests.`);
  process.exit(1);
}
