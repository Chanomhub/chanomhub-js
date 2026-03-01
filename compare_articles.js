const fs = require('fs');

const v1 = JSON.parse(fs.readFileSync('v1_schema.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('v2_schema.json', 'utf8'));

function findType(schema, typeName) {
    return schema.__schema.types.find((t) => t.name === typeName);
}

const typeName = 'ArticleGraphQLDTO';
const v1Article = findType(v1, typeName);
const v2Article = findType(v2, typeName);

if (!v1Article || !v2Article) {
    console.error(`Could not find ${typeName} type in one of the schemas`);
    process.exit(1);
}

const v1Fields = (v1Article.fields || []).reduce((acc, f) => ({ ...acc, [f.name]: f }), {});
const v2Fields = (v2Article.fields || []).reduce((acc, f) => ({ ...acc, [f.name]: f }), {});

const v1Names = Object.keys(v1Fields);
const v2Names = Object.keys(v2Fields);

const onlyInV1 = v1Names.filter((name) => !v2Names.includes(name));
const onlyInV2 = v2Names.filter((name) => !v1Names.includes(name));
const inBoth = v1Names.filter((name) => v2Names.includes(name));

console.log(`--- ${typeName} Migration Summary ---`);
console.log(`V1 Fields: ${v1Names.length}`);
console.log(`V2 Fields: ${v2Names.length}`);

console.log('\n--- Fields only in V1 (Potential removals/renames) ---');
onlyInV1.forEach((name) => console.log(`- ${name}`));

console.log('\n--- Fields only in V2 (New fields) ---');
onlyInV2.forEach((name) => console.log(`- ${name}`));

console.log('\n--- Potential Type Changes ---');
inBoth.forEach((name) => {
    const v1Type = JSON.stringify(v1Fields[name].type);
    const v2Type = JSON.stringify(v2Fields[name].type);
    if (v1Type !== v2Type) {
        console.log(`- ${name}:`);
        console.log(`  V1: ${v1Type}`);
        console.log(`  V2: ${v2Type}`);
    }
});
