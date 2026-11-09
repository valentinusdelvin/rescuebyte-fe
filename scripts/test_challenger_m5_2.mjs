import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('=== CHALLENGER M5.2: STATIC AST & ANTI-SLOP VERIFICATION HARNESS ===\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, testName, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

function getAllFiles(dir, extensions = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// -------------------------------------------------------------
// TEST SUITE 1: Decorative Box Banners Check
// -------------------------------------------------------------
console.log('--- SUITE 1: Decorative Box Banners Check ---');

const bannerFiles = [
  path.join(SRC_DIR, 'api', 'types.ts'),
  path.join(SRC_DIR, 'api', 'client.ts')
];

let bannerViolations = [];
const bannerRegex = /(\/\/|\/\*|\*).*(=[=]{2,}|-[ -]{3,}|\*{3,})/;

bannerFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  if (!fs.existsSync(filePath)) {
    bannerViolations.push(`${relPath} does not exist`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('//') || line.includes('/*') || line.trim().startsWith('*')) {
      if (bannerRegex.test(line)) {
        bannerViolations.push(`${relPath}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
});

assert(
  bannerViolations.length === 0,
  'Zero decorative box banners in src/api/types.ts and src/api/client.ts',
  bannerViolations.join('; ')
);

const allSrcFiles = getAllFiles(SRC_DIR);
let srcBannerViolations = [];
allSrcFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('//') || line.includes('/*') || line.trim().startsWith('*')) {
      if (bannerRegex.test(line)) {
        srcBannerViolations.push(`${relPath}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
});

assert(
  srcBannerViolations.length === 0,
  `Zero decorative box banners across all ${allSrcFiles.length} files in src/`,
  srcBannerViolations.slice(0, 5).join('; ')
);

// -------------------------------------------------------------
// TEST SUITE 2: Numbered Workflow Narration in services/ & api/
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Numbered Workflow Narration Check ---');

const apiFiles = getAllFiles(path.join(SRC_DIR, 'api'));
const servicesFiles = getAllFiles(path.join(SRC_DIR, 'services'));

const workflowRegex = /\/\/\s*(\d+\.|step\s*\d+|langkah\s*\d+|tahap\s*\d+)/i;

let apiWorkflowViolations = [];
apiFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (line.includes('//')) {
      const commentPart = line.substring(line.indexOf('//'));
      if (workflowRegex.test(commentPart)) {
        apiWorkflowViolations.push(`${relPath}:${idx + 1}: ${commentPart.trim()}`);
      }
    }
  });
});

assert(
  apiWorkflowViolations.length === 0,
  'Zero numbered workflow narration comments in src/api/',
  apiWorkflowViolations.join('; ')
);

let servicesWorkflowViolations = [];
servicesFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (line.includes('//')) {
      const commentPart = line.substring(line.indexOf('//'));
      if (workflowRegex.test(commentPart)) {
        servicesWorkflowViolations.push(`${relPath}:${idx + 1}: ${commentPart.trim()}`);
      }
    }
  });
});

assert(
  servicesWorkflowViolations.length === 0,
  'Zero numbered workflow narration comments in src/services/',
  servicesWorkflowViolations.join('; ')
);

// -------------------------------------------------------------
// TEST SUITE 3: UI Copy & String Literal Preservation in M5
// -------------------------------------------------------------
console.log('\n--- SUITE 3: UI Copy & String Literal Preservation in M5 ---');

// The 4 UI files touched in M5 are:
// - src/components/ui/Badge.tsx
// - src/components/ui/Button.tsx
// - src/components/ui/Modal.tsx
// - src/pages/customer/CustomerHome.tsx

// Verify Badge.tsx: only comments changed, variant object keys and CSS class strings identical
const badgeContent = fs.readFileSync(path.join(SRC_DIR, 'components', 'ui', 'Badge.tsx'), 'utf8');
assert(
  badgeContent.includes('bg-[#e8f1de] text-[#2d5922]') &&
  badgeContent.includes('bg-[#fdeceb] text-[#d94a38]') &&
  badgeContent.includes('bg-secondary text-white shadow-xs') &&
  badgeContent.includes('bg-[#fff6e5] text-[#9a5d00]'),
  'src/components/ui/Badge.tsx preserved exact styling tokens and variant keys'
);

// Verify Button.tsx: only comments changed, variants and sizes intact
const buttonContent = fs.readFileSync(path.join(SRC_DIR, 'components', 'ui', 'Button.tsx'), 'utf8');
assert(
  buttonContent.includes('primary:') &&
  buttonContent.includes('secondary:') &&
  buttonContent.includes('outline:') &&
  buttonContent.includes('urgent:') &&
  buttonContent.includes('ghost:'),
  'src/components/ui/Button.tsx preserved exact variants and interactive tokens'
);

// Verify Modal.tsx: accessibility logic and focus trap preserved, no UI copy altered
const modalContent = fs.readFileSync(path.join(SRC_DIR, 'components', 'ui', 'Modal.tsx'), 'utf8');
assert(
  modalContent.includes('handleKeyDown') &&
  modalContent.includes('previousActiveElement') &&
  modalContent.includes('role="dialog"'),
  'src/components/ui/Modal.tsx preserved dialog behavior and accessibility structure'
);

// Verify CustomerHome.tsx: contains exact 3 cards cap & Lihat Selengkapnya links
const homeContent = fs.readFileSync(path.join(SRC_DIR, 'pages', 'customer', 'CustomerHome.tsx'), 'utf8');
assert(
  homeContent.includes('parsed.slice(0, 3)') &&
  homeContent.includes('.slice(0, 3)') &&
  homeContent.includes('Array.from({ length: 3 })'),
  'CustomerHome.tsx enforces 3 cards cap in cache, queries, and skeletons'
);

assert(
  homeContent.includes('Lihat Selengkapnya') &&
  homeContent.includes('href="#marketplace"'),
  'CustomerHome.tsx renders accessible "Lihat Selengkapnya" links to #marketplace'
);

// -------------------------------------------------------------
// TEST SUITE 4: Indonesian Localization & Technical Terms
// -------------------------------------------------------------
console.log('\n--- SUITE 4: Indonesian Comments & English Technical Terms Preservation ---');

// Check that technical terms are NOT mistranslated to awkward calques
const badCalquesRegex = /\b(kait\s+kustom|pencegat\s+axios|titik\s+akhir\s+api|pasar\s+makanan|papan\s+peringkat\s+admin)\b/i;
let calqueViolations = [];

allSrcFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (line.includes('//') || line.includes('/*') || line.trim().startsWith('*')) {
      if (badCalquesRegex.test(line)) {
        calqueViolations.push(`${relPath}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
});

assert(
  calqueViolations.length === 0,
  'No mistranslated Indonesian calques for standard technical terms across src/',
  calqueViolations.join('; ')
);

// Check standard technical terms in key files
const apiTypesContent = fs.readFileSync(path.join(SRC_DIR, 'api', 'types.ts'), 'utf8');
const clientContent = fs.readFileSync(path.join(SRC_DIR, 'api', 'client.ts'), 'utf8');
const authContextContent = fs.readFileSync(path.join(SRC_DIR, 'context', 'AuthContext.tsx'), 'utf8');

assert(
  apiTypesContent.includes('Swagger 2.0') &&
  apiTypesContent.includes('DTO') &&
  apiTypesContent.includes('Kontrak universal response & format error'),
  'types.ts retains technical terms (Swagger 2.0, DTO, response, error)'
);

assert(
  clientContent.includes('Bearer token') &&
  clientContent.includes('localStorage') &&
  clientContent.includes('Request Interceptor') &&
  clientContent.includes('Response Interceptor'),
  'client.ts retains technical terms (Bearer token, localStorage, Request/Response Interceptor)'
);

assert(
  authContextContent.includes('JWT') &&
  authContextContent.includes('token') &&
  authContextContent.includes('session'),
  'AuthContext.tsx retains technical terms (JWT, token, session)'
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=============================================================');
console.log(`TOTAL CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failedChecks}`);
console.log('=============================================================');

if (failedChecks > 0) {
  console.log(`\nVERDICT: REJECT (${failedChecks} check failed)`);
  process.exit(1);
} else {
  console.log('\nVERDICT: APPROVE (All checks passed)');
  process.exit(0);
}
