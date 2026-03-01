const fs = require('fs');

const v1 = JSON.parse(fs.readFileSync('v1_schema.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('v2_schema.json', 'utf8'));

function findType(schema, typeName) {
    return schema.__schema.types.find((t) => t.name === typeName);
}

const v1Query = findType(v1, 'Query');
const v2Query = findType(v2, 'Query');

const v1Fields = (v1Query.fields || []).reduce((acc, f) => ({ ...acc, [f.name]: f }), {});
const v2Fields = (v2Query.fields || []).reduce((acc, f) => ({ ...acc, [f.name]: f }), {});

const v1Names = Object.keys(v1Fields);
const v2Names = Object.keys(v2Fields);

const onlyInV1 = v1Names.filter((name) => !v2Names.includes(name));
const onlyInV2 = v2Names.filter((name) => !v1Names.includes(name));

console.log('--- Query Type Migration Summary ---');
console.log(`V1 Queries: ${v1Names.length}`);
console.log(`V2 Queries: ${v2Names.length}`);

console.log('\n--- Queries only in V1 ---');
onlyInV1.forEach((name) => console.log(`- ${name}`));

console.log('\n--- Queries only in V2 ---');
onlyInV2.forEach((name) => console.log(`- ${name}`));
