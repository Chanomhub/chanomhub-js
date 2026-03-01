const INTROSPECT_TYPES = `
query {
  __schema {
    types {
      name
      kind
    }
  }
}
`;

function fieldsQuery(typeName) {
    return `
    query {
      __type(name: "${typeName}") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType { name kind }
            }
          }
        }
      }
    }
  `;
}

async function gqlFetch(url, query) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    return response.json();
}

async function fetchTypes(url) {
    console.log(`Fetching types from ${url}...`);
    const json = await gqlFetch(url, INTROSPECT_TYPES);
    if (!json.data?.__schema?.types) {
        console.error(`  Failed to fetch types from ${url}`);
        return null;
    }
    const types = json.data.__schema.types
        .filter((t) => !t.name.startsWith('__') && t.kind === 'OBJECT')
        .map((t) => t.name)
        .sort();
    console.log(`  Found ${types.length} OBJECT types`);
    return types;
}

async function fetchFieldsForType(url, typeName) {
    const json = await gqlFetch(url, fieldsQuery(typeName));
    if (!json.data?.__type?.fields) return [];
    return json.data.__type.fields.map((f) => {
        const t = f.type;
        const typStr = t.name || `${t.kind}<${t.ofType?.name || t.ofType?.ofType?.name || '?'}>`;
        return { name: f.name, type: typStr };
    });
}

function formatType(f) {
    return `${f.name}: ${f.type}`;
}

async function main() {
    const V1_URL = 'https://api.chanomhub.com/api/graphql';
    const V2_URL = 'https://api.chanomhub.com/api/v2/graphql';

    // 1. Compare top-level types
    const v1Types = await fetchTypes(V1_URL);
    const v2Types = await fetchTypes(V2_URL);

    if (!v1Types || !v2Types) {
        console.error('Could not fetch schemas. Aborting.');
        return;
    }

    const v1Set = new Set(v1Types);
    const v2Set = new Set(v2Types);
    const inV1Only = v1Types.filter((t) => !v2Set.has(t));
    const inV2Only = v2Types.filter((t) => !v1Set.has(t));

    console.log(`\n====== TYPES IN V1 ONLY (${inV1Only.length}) ======`);
    inV1Only.forEach((t) => console.log(`  - ${t}`));

    console.log(`\n====== TYPES IN V2 ONLY (${inV2Only.length}) ======`);
    inV2Only.forEach((t) => console.log(`  + ${t}`));

    // 2. Compare fields for each shared type
    const sharedTypes = v1Types.filter((t) => v2Set.has(t));
    console.log(`\n====== COMPARING FIELDS FOR ${sharedTypes.length} SHARED TYPES ======\n`);

    for (const typeName of sharedTypes) {
        const v1Fields = await fetchFieldsForType(V1_URL, typeName);
        const v2Fields = await fetchFieldsForType(V2_URL, typeName);

        const v1Map = new Map(v1Fields.map((f) => [f.name, f]));
        const v2Map = new Map(v2Fields.map((f) => [f.name, f]));

        const removed = v1Fields.filter((f) => !v2Map.has(f.name));
        const added = v2Fields.filter((f) => !v1Map.has(f.name));
        const changed = v1Fields.filter((f) => {
            const v2f = v2Map.get(f.name);
            return v2f && v2f.type !== f.type;
        });

        if (removed.length || added.length || changed.length) {
            console.log(`--- ${typeName} ---`);
            removed.forEach((f) => console.log(`  - REMOVED: ${formatType(f)}`));
            added.forEach((f) => console.log(`  + ADDED:   ${formatType(f)}`));
            changed.forEach((f) => {
                const v2f = v2Map.get(f.name);
                console.log(`  ~ CHANGED: ${f.name}: ${f.type} → ${v2f.type}`);
            });
            console.log('');
        }
    }

    console.log('Done.');
}

main();
