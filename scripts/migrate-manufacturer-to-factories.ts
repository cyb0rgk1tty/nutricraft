/**
 * Migration Script: Copy Manufacturer to Factories
 *
 * This script migrates the single manufacturer relation to the new many-to-many
 * factories relation in Twenty CRM.
 *
 * Usage: npx ts-node scripts/migrate-manufacturer-to-factories.ts
 *
 * Or with env vars:
 * TWENTY_API_URL=https://your-crm.com/graphql TWENTY_API_KEY=your-key npx ts-node scripts/migrate-manufacturer-to-factories.ts
 */

import 'dotenv/config';

interface Product {
  id: string;
  name: string;
  manufacturer?: {
    id: string;
    name: string;
  } | null;
  factories?: {
    edges: Array<{ node: { id: string; name: string } }>;
  } | null;
}

interface GraphQLResponse {
  data?: any;
  errors?: Array<{ message: string }>;
}

const API_URL = process.env.TWENTY_API_URL;
const API_KEY = process.env.TWENTY_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('ERROR: Missing TWENTY_API_URL or TWENTY_API_KEY environment variables');
  process.exit(1);
}

async function graphqlRequest(query: string, variables: Record<string, any> = {}): Promise<GraphQLResponse> {
  const response = await fetch(API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function fetchAllProducts(): Promise<Product[]> {
  console.log('Fetching all products from Twenty CRM...');

  const query = `
    query FetchAllProducts {
      products(first: 500) {
        edges {
          node {
            id
            name
            manufacturer {
              id
              name
            }
            factories {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = await graphqlRequest(query);

  if (result.errors) {
    throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
  }

  const products = result.data?.products?.edges?.map((e: any) => e.node) || [];
  console.log(`Found ${products.length} products`);

  return products;
}

async function addFactoryToProduct(productId: string, factoryId: string): Promise<boolean> {
  // Twenty CRM uses "connect" to add relations in many-to-many fields
  const mutation = `
    mutation UpdateProductFactories($id: UUID!, $data: ProductUpdateInput!) {
      updateProduct(id: $id, data: $data) {
        id
        factories {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `;

  const variables = {
    id: productId,
    data: {
      factories: {
        connect: [{ id: factoryId }]
      }
    }
  };

  const result = await graphqlRequest(mutation, variables);

  if (result.errors) {
    console.error(`  Error: ${result.errors[0]?.message}`);
    return false;
  }

  return true;
}

async function migrate() {
  console.log('='.repeat(60));
  console.log('Manufacturer to Factories Migration');
  console.log('='.repeat(60));
  console.log('');

  try {
    const products = await fetchAllProducts();

    // Filter products that have a manufacturer but no factories
    const productsToMigrate = products.filter(p => {
      const hasManufacturer = p.manufacturer?.id;
      const hasFactories = p.factories?.edges && p.factories.edges.length > 0;
      return hasManufacturer && !hasFactories;
    });

    console.log(`\nProducts to migrate: ${productsToMigrate.length}`);
    console.log(`Products already migrated or no manufacturer: ${products.length - productsToMigrate.length}`);
    console.log('');

    if (productsToMigrate.length === 0) {
      console.log('No products need migration. All done!');
      return;
    }

    // Show what will be migrated
    console.log('Products to migrate:');
    productsToMigrate.forEach(p => {
      console.log(`  - ${p.name} (manufacturer: ${p.manufacturer?.name})`);
    });
    console.log('');

    // Perform migration
    let successCount = 0;
    let failCount = 0;

    for (const product of productsToMigrate) {
      const manufacturerId = product.manufacturer!.id;
      const manufacturerName = product.manufacturer!.name;

      process.stdout.write(`Migrating "${product.name}" -> Factory "${manufacturerName}"... `);

      const success = await addFactoryToProduct(product.id, manufacturerId);

      if (success) {
        console.log('OK');
        successCount++;
      } else {
        console.log('FAILED');
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('Migration Complete');
    console.log('='.repeat(60));
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`  Total: ${productsToMigrate.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrate();
