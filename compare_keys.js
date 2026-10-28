
const fs = require('fs');
const content = fs.readFileSync('constants.ts', 'utf8');

const kuMatch = content.match(/ku: \{([\s\S]*?)\},/);
const enMatch = content.match(/en: \{([\s\S]*?)\},/);

if (kuMatch && enMatch) {
    const kuKeys = kuMatch[1].split('\n').map(line => line.trim().split(':')[0]).filter(k => k);
    const enKeys = enMatch[1].split('\n').map(line => line.trim().split(':')[0]).filter(k => k);
    
    const missingInKu = enKeys.filter(k => !kuKeys.includes(k));
    console.log('Missing in KU:', missingInKu);
}
