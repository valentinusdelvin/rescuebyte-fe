const fs = require('fs');
const path = require('path');

const coreComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'core_files_comments.json'), 'utf8')
);

// Examine client.ts, types.ts, services in api
const apiComments = coreComments.filter(c => c.file.startsWith('src/api/'));
console.log('API comments count:', apiComments.length);

const hooksComments = coreComments.filter(c => c.file.startsWith('src/hooks/'));
console.log('Hooks comments count:', hooksComments.length);

const contextComments = coreComments.filter(c => c.file.startsWith('src/context/'));
console.log('Context comments count:', contextComments.length);

const utilsComments = coreComments.filter(c => c.file.startsWith('src/utils/'));
console.log('Utils comments count:', utilsComments.length);

const uiComments = coreComments.filter(c => c.file.startsWith('src/components/ui/'));
console.log('UI comments count:', uiComments.length);

const appComments = coreComments.filter(c => c.file.startsWith('src/app/') || c.file === 'src/App.tsx');
console.log('App comments count:', appComments.length);
