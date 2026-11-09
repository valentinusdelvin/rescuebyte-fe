# Task Assignment: Explorer 1 — Iteration 2 (MysteryBoxCard Stock Logic Fix)

## Issue Context
Challenger 1 detected a bug in `src/components/customer/MysteryBoxCard.tsx` line 74:
```ts
const stockMatch = item.remainingBoxesText.match(/\d+/);
const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
```
Because `"10 box"`, `"20 box"`, `"50 box"`, `"100 box"` contains `"0 box"` as a substring, items with multiple-of-10 inventory falsely evaluate `isOutOfStock = true` and show "Habis".

## Task
1. Inspect `src/components/customer/MysteryBoxCard.tsx` lines 70-80.
2. Formulate the exact robust solution:
   - For example: `/\b0\s*box\b/i.test(item.remainingBoxesText)` or simply `stockCount === 0`.
   - Consider all boundary cases: `"Sisa 0 Box"`, `"0 Box"`, `"Habis"`, `"Sisa 10 Box"`, `"Sisa 20 Box"`, `"Sisa 100 Box"`, `"Sisa 1 Box"`, `item.stock === 0`.
3. Provide the exact recommended replacement code.

## Output
- Write your report to `.agents/teamwork/explorer_r2_1/handoff.md`.
- Send completion message to parent (`38968871-17e4-4323-bc74-f1f1c77fe5bd`).
