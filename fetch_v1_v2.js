
const fs = require('fs');

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        fields {
          name
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
  }
`;

async function fetchSchema(url, filename) {
  try {
    console.log(`Fetching schema from ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`Errors in introspection for ${url}:`, result.errors);
      return;
    }

    fs.writeFileSync(filename, JSON.stringify(result.data, null, 2));
    console.log(`Schema saved to ${filename}`);
  } catch (error) {
    console.error(`Failed to fetch schema from ${url}:`, error);
  }
}

async function run() {
  await fetchSchema('https://api.chanomhub.com/api/graphql', 'v1_schema.json');
  await fetchSchema('https://api.chanomhub.com/api/v2/graphql', 'v2_schema.json');
}

run();
