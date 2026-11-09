# Dead Ends Log

| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
| 1 | `item.remainingBoxesText.toLowerCase().includes('0 box')` for stock evaluation | Substring match falsely triggers on multiples of 10 (`10 Box`, `20 Box`, `50 Box`, `100 Box`), incorrectly disabling the order button with "Habis" for in-stock products. Must use word boundaries or strictly rely on `stockCount === 0`. | `src/components/customer/MysteryBoxCard.tsx` |
