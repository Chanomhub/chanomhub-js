
const fs = require('fs');

const v1 = JSON.parse(fs.readFileSync('v1_schema.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('v2_schema.json', 'utf8'));

console.log('V1 Types starting with Article:');
console.log(v1.__schema.types.filter(t => t.name.startsWith('Article')).map(t => t.name));

console.log('
V2 Types starting with Article:');
console.log(v2.__schema.types.filter(t => t.name.startsWith('Article')).map(t => t.name));
