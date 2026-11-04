## 2026-11-03T17:21:05Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Agent 2 — UI/UX & Design System Specialist (Worker M1).
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m1
Original Request: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
Master Blueprint: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
Parent: da2dba90-b6bf-4c5e-813a-a8fef275193d / Project Orchestrator: 59a4cfaf-061f-42fa-9551-4492d1892343

Read the following reference reports and skills before starting:
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_2\handoff.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_1\handoff.md
- Skill: C:\Users\fahmi\.gemini\config\skills\antislop-ui\SKILL.md
- Skill: C:\Users\fahmi\.gemini\config\skills\antislop-human\SKILL.md

Scope & File Ownership (Exclusive write ownership for this milestone):
- `src/index.css`
- `src/components/ui/` (`Button.tsx`, `Input.tsx`, `Badge.tsx`, `Card.tsx`, `Modal.tsx`, `EmptyState.tsx`, `Skeleton.tsx`, `index.ts`)
- `src/utils/currency.ts`
- `src/utils/markdown.ts`
- Remove dead files: `src/pages/Home.tsx`, `src/components/FolderCard.tsx`, `src/components/Header.tsx`, `src/hooks/useCounter.ts`, `src/components/common/MysteryBoxThumb.tsx`

Tasks:
1. Standardize Tailwind CSS v4 `@theme` in `src/index.css` with the full design token taxonomy from `Design.md` and Explorer 2's report (surface hierarchy, evergreen `--color-primary: #1f2a24`, secondary leaf green, marigold, vermilion error, outline variant `#e2e6df`, elevation shadows level 1-3, radii). Keep backward compatibility for any existing classes like `--color-primary-dark`, etc.
2. Build reusable UI components in `src/components/ui/`:
   - `Button.tsx`: variants (`primary`, `secondary`, `outline`, `urgent`, `ghost`), sizes (`sm`, `md`, `lg`), `isLoading` spinner, icon support, accessible focus ring (`focus-visible:ring-2 focus-visible:ring-primary`).
   - `Input.tsx`: label, error message, hint, left/right icons, accessible focus states.
   - `Badge.tsx`: variants (`halal`, `urgent-stock`, `discount`, `mystery`, `neutral`), pill geometry, proper contrast.
   - `Card.tsx`: surface, border `#e2e6df`, radius `rounded-2xl`, elevation.
   - `Modal.tsx`: accessible dialog shell with backdrop blur, focus trap, Escape key dismiss, and ARIA title linkage.
   - `EmptyState.tsx`: Lucide icons (no raw emojis), title, description, action button.
   - `Skeleton.tsx`: smooth pulsing geometry for cards, text, avatars.
   - `index.ts`: export all primitives.
3. Consolidate currency formatting in `src/utils/currency.ts` (`formatRupiah`, `formatPriceInput`, `parsePriceInput`).
4. Create `src/utils/markdown.ts` to export `renderInlineFormatted` cleanly (fixing the fast refresh lint warning from `FormattedDescription.tsx`).
5. Safely delete the 5 identified dead starter files that are never routed or imported by real pages.
6. Run `npm run typecheck` (`tsc -b`), `npm run build`, and `npm run lint` (`oxlint`). Verify 0 errors!
7. Output your full handoff report to:
   `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m1\handoff.md`
8. Notify the orchestrator via send_message when complete.
