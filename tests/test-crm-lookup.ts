/**
 * Quick test to verify TwentyCRM findPersonByEmail works correctly
 * Run with: npx tsx tests/test-crm-lookup.ts
 */

import 'dotenv/config';

const apiUrl = process.env.TWENTY_API_URL;
const apiKey = process.env.TWENTY_API_KEY;

if (!apiUrl || !apiKey) {
  console.error('Missing TWENTY_API_URL or TWENTY_API_KEY in .env');
  process.exit(1);
}

async function testFindPersonByEmail(email: string) {
  console.log(`\nSearching for: ${email}`);

  const query = `
    query FindPerson($filter: PersonFilterInput) {
      people(filter: $filter) {
        edges {
          node {
            id
            emails {
              primaryEmail
            }
          }
        }
      }
    }
  `;

  const variables = {
    filter: {
      emails: {
        primaryEmail: {
          ilike: email,  // Exact match without wildcards
        },
      },
    },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    return;
  }

  const people = result.data?.people?.edges || [];
  console.log(`Found ${people.length} person(s)`);

  if (people.length > 0) {
    people.forEach((edge: any) => {
      console.log(`  - ID: ${edge.node.id}, Email: ${edge.node.emails?.primaryEmail}`);
    });
  }
}

// Test cases
async function main() {
  console.log('Testing TwentyCRM findPersonByEmail (exact match)');
  console.log('='.repeat(50));

  // Test with an email that should exist (adjust as needed)
  await testFindPersonByEmail('test@example.com');

  // Test with partial match - should NOT find anything now
  await testFindPersonByEmail('test');

  console.log('\nDone!');
}

main().catch(console.error);
