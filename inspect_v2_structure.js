const fs = require('fs');

const v2 = JSON.parse(fs.readFileSync('v2_schema.json', 'utf8'));

function findType(schema, typeName) {
    return schema.__schema.types.find(t => t.name === typeName);
}

const v2Query = findType(v2, 'Query');
const publicField = v2Query.fields.find(f => f.name === 'public');
const systemField = v2Query.fields.find(f => f.name === 'system');

console.log('Public Query Type:', publicField.type.name || publicField.type.ofType.name);
console.log('System Query Type:', systemField.type.name || systemField.type.ofType.name);

const publicType = findType(v2, publicField.type.name || publicField.type.ofType.name);
console.log('\nFields in Public:');
publicType.fields.forEach(f => console.log(`- ${f.name}`));

const systemType = findType(v2, systemField.type.name || systemField.type.ofType.name);
console.log('\nFields in System:');
systemType.fields.forEach(f => console.log(`- ${f.name}`));
