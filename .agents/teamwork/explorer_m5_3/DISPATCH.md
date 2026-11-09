# Dispatch for Explorer M5.3 (Code Comments & Documentation Localization Audit)

## Objective
Audit the codebase comments, JSDoc, and documentation across `src/` to prepare for natural Indonesian localization per antislop-code guidelines:
1. Locate where code comments, JSDoc headers, and explanatory comments exist across `src/` (e.g. `src/api/`, `src/hooks/`, `src/components/`, `src/context/`, `src/utils/`).
2. Identify any generic AI slop comments (e.g., "This function renders...", "State variable for...", "Import React", "Handle click event") that should be cleaned or refined.
3. Formulate clear guidelines and targets for localizing meaningful code comments and JSDoc into natural, conversational, professional Indonesian (written like a real Indonesian developer / mahasiswa).
4. Strictly verify that user-facing UI copy/strings are NOT modified (per user clarification).
5. Ensure technical English terms are preserved (API, Backend, Dashboard, Marketplace, Bearer Token, Hooks, etc.).
6. Provide concrete targets and recommendations for the Worker. Write findings to `handoff.md`.


## 2026-11-09T14:21:31Z
You are Explorer M5.3 (Code Comments & Documentation Localization Audit).
Your working directory is: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
Your state folder is: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_m5_3

Mandatory reading before starting:
- ORIGINAL_REQUEST: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Critical user clarification in ORIGINAL_REQUEST.md: "eh itu yang kumaksud tuh command pada kode loh ya, kek dokumentasi nya! bukan pada UI FrontEnd nya oke." (DO NOT change user-facing UI copy/text! The localization applies strictly to CODE COMMENTS, JSDoc, and CODEBASE DOCUMENTATION per antislop-code guidelines).
- PROJECT.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
- DISPATCH.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_m5_3\DISPATCH.md
- antislop-code skill if available: C:\Users\fahmi\.gemini\config\skills\antislop-code\SKILL.md

Objective:
1. Locate where code comments, JSDoc headers, and explanatory comments exist across `src/` (e.g. `src/api/`, `src/hooks/`, `src/components/`, `src/context/`, `src/utils/`).
2. Identify any generic AI slop comments (e.g., "This function renders...", "State variable for...", "Import React", "Handle click event") that should be cleaned or refined.
3. Formulate clear guidelines and file targets for localizing meaningful code comments and JSDoc into natural, conversational, professional Indonesian (written like a real Indonesian developer / mahasiswa).
4. Strictly verify that user-facing UI copy/strings are NOT modified (per user clarification).
5. Ensure technical English terms are preserved (API, Backend, Dashboard, Marketplace, Bearer Token, Hooks, etc.).
6. Provide concrete targets and recommendations for the Worker. Write findings to your `handoff.md`. Communicate completion to the orchestrator (conversation ID: 66869129-f30f-4e5b-9a7d-e1f1c04e57d5).
Remember: Explorers are read-only and do NOT modify code.
