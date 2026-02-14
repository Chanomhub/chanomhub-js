
const fs = require('fs');

const QUERY = `
query GetArticleType {
  __type(name: "Article") {
    name
    fields {
      name
      description
      type {
        name
        kind
        ofType {
          name
          kind
          ofType {
             name
             kind
          }
        }
      }
    }
  }
}
`;

async function fetchSchema(url) {
  try {
    console.log(`Fetching from ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY }),
    });
    const json = await response.json();

    if (json.errors) {
      console.error(`GraphQL Errors from ${url}:`, JSON.stringify(json.errors, null, 2));
      return null;
    }

    if (!json.data || !json.data.__type) {
      console.error(`No Type found in response from ${url}`);
      return null;
    }

    return json.data.__type;
  } catch (e) {
    console.error(`Error fetching ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  // Try explicit v1 first
  let v1 = await fetchSchema('https://api.chanomhub.com/api/v1/graphql');

  // If explicit v1 fails, try default which is likely v1
  if (!v1) {
    console.log('Failed to fetch from /api/v1/graphql. Trying /api/graphql...');
    v1 = await fetchSchema('https://api.chanomhub.com/api/graphql');
  }

  // Try explicit v2
  const v2 = await fetchSchema('https://api.chanomhub.com/api/v2/graphql');

  if (!v1) console.log('Could not fetch ANY V1 schema.');
  else console.log(`Fetched V1 schema with ${(v1.fields || []).length} fields.`);

  if (!v2) console.log('Could not fetch ANY V2 schema.');
  else console.log(`Fetched V2 schema with ${(v2.fields || []).length} fields.`);

  if (v1 && v2) {
    const v1Fields = new Set((v1.fields || []).map(f => f.name));
    const v2Fields = new Set((v2.fields || []).map(f => f.name));

    const inV1Only = [...v1Fields].filter(x => !v2Fields.has(x));
    const inV2Only = [...v2Fields].filter(x => !v1Fields.has(x));

    console.log(`\n====== FIELDS IN V1 BUT NOT IN V2 (${inV1Only.length}) ======`);
    inV1Only.forEach(f => console.log(`- ${f}`));

    console.log(`\n====== FIELDS IN V2 BUT NOT IN V1 (${inV2Only.length}) ======`);
    inV2Only.forEach(f => console.log(`- ${f}`));
  }
}

main();
