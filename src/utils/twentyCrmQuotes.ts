/**
 * Twenty CRM Quotes Integration
 * Handles fetching and updating quote records from Twenty CRM custom objects
 *
 * FLEXIBLE DESIGN: This utility is designed to work with any custom object structure.
 * Configure the object name and field mappings in the constants below.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Configuration for the Twenty CRM custom object
 * Using the "Products" custom object with fields: Name, Creation date, Stages
 */
export const CRM_CONFIG = {
  // The name of the custom object in Twenty CRM
  objectName: 'product',

  // Field mappings: dashboard field -> CRM field name
  fieldMappings: {
    id: 'id',
    name: 'name',
    status: 'stages',  // Note: Twenty CRM uses "stages" (plural)
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    ourCost: 'ourCost',  // Currency type in CRM
    orderQuantity: 'orderQuantity',  // Float type in CRM
  } as Record<string, string>,

  // Stages to show in the dashboard (CRM stage value -> Dashboard display label)
  // Only these stages will appear in the dashboard; others are filtered out
  allowedStages: {
    'planning': 'Price Quote',
    'order_samples': 'Order Samples',
    'client_review_samples': 'Sample Delivered',
    'full_batch_order': 'Full Batch Order',
  } as Record<string, string>,

  // Get all allowed CRM stage keys
  get allowedStageKeys(): string[] {
    return Object.keys(this.allowedStages);
  },
};

// =============================================================================
// TYPES
// =============================================================================

interface TwentyCrmConfig {
  apiUrl: string;
  apiKey: string;
}

export interface Quote {
  id: string;
  name: string;
  status: string;
  price?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  crmId?: string;
  rawData?: Record<string, any>;
  ourCost?: number;  // Manufacturer's cost (Currency in CRM)
  orderQuantity?: number;  // Order quantity (Float in CRM)
}

export interface FetchQuotesResponse {
  success: boolean;
  quotes: Quote[];
  statusCounts: Record<string, number>;
  error?: string;
}

export interface UpdateQuoteResponse {
  success: boolean;
  quote?: Quote;
  error?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets Twenty CRM API configuration from environment variables
 */
function getCrmConfig(): TwentyCrmConfig | null {
  const apiUrl = process.env.TWENTY_API_URL || import.meta.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY || import.meta.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('Twenty CRM Quotes: Missing API URL or API Key');
    return null;
  }

  return { apiUrl, apiKey };
}

/**
 * Makes a GraphQL request to Twenty CRM
 */
async function graphqlRequest(
  config: TwentyCrmConfig,
  query: string,
  variables: Record<string, any> = {}
): Promise<{ data?: any; errors?: any[] }> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twenty CRM API error:', response.status, errorText);
    throw new Error(`API returned status ${response.status}`);
  }

  return response.json();
}

/**
 * Maps CRM data to dashboard Quote format
 */
function mapCrmToQuote(crmData: Record<string, any>): Quote {
  const { fieldMappings, reverseStatusMappings } = CRM_CONFIG;

  // Extract mapped fields
  const quote: Quote = {
    id: crmData[fieldMappings.id] || crmData.id,
    customerName: crmData[fieldMappings.customerName] || crmData.name?.firstName
      ? `${crmData.name.firstName} ${crmData.name.lastName || ''}`.trim()
      : 'Unknown',
    customerEmail: crmData[fieldMappings.customerEmail] || crmData.emails?.primaryEmail || '',
    companyName: crmData[fieldMappings.companyName] || '',
    phone: crmData[fieldMappings.phone] || crmData.phones?.primaryPhoneNumber || '',
    targetMarket: crmData[fieldMappings.targetMarket] || '',
    orderQuantity: crmData[fieldMappings.orderQuantity] || '',
    timeline: crmData[fieldMappings.timeline] || '',
    message: crmData[fieldMappings.message] || crmData.details || '',
    status: reverseStatusMappings[crmData[fieldMappings.status]] || crmData[fieldMappings.status]?.toLowerCase() || 'new',
    totalPrice: parseAmountFromCrm(crmData[fieldMappings.totalPrice]),
    notes: crmData[fieldMappings.notes] || '',
    createdAt: crmData[fieldMappings.createdAt] || crmData.createdAt,
    updatedAt: crmData[fieldMappings.updatedAt] || crmData.updatedAt,
    crmId: crmData.id,
    rawData: crmData, // Store raw data for unmapped fields
  };

  // Parse products if available
  const productsField = crmData[fieldMappings.products];
  if (productsField) {
    quote.products = parseProducts(productsField);
  }

  return quote;
}

/**
 * Maps dashboard Quote to CRM update format
 */
function mapQuoteToCrm(quote: Partial<Quote>): Record<string, any> {
  const { fieldMappings } = CRM_CONFIG;
  const crmData: Record<string, any> = {};

  if (quote.status !== undefined) {
    // Use the status value directly (lowercase) as Twenty CRM expects
    crmData[fieldMappings.status] = quote.status;
  }

  if (quote.ourCost !== undefined) {
    crmData[fieldMappings.ourCost] = {
      amountMicros: Math.round(quote.ourCost * 1000000),
      currencyCode: 'USD',
    };
  }

  if (quote.orderQuantity !== undefined) {
    crmData[fieldMappings.orderQuantity] = quote.orderQuantity;
  }

  return crmData;
}

/**
 * Parse amount from CRM format (could be micros or direct value)
 */
function parseAmountFromCrm(amount: any): number | undefined {
  if (!amount) return undefined;

  // If it's an object with amountMicros
  if (typeof amount === 'object' && amount.amountMicros) {
    return amount.amountMicros / 1000000;
  }

  // If it's a direct number
  if (typeof amount === 'number') {
    return amount;
  }

  // Try to parse string
  if (typeof amount === 'string') {
    return parseFloat(amount) || undefined;
  }

  return undefined;
}

/**
 * Parse products from CRM format
 */
function parseProducts(productsData: any): QuoteProduct[] {
  if (!productsData) return [];

  // If it's already an array
  if (Array.isArray(productsData)) {
    return productsData.map((p: any) => ({
      id: p.id,
      name: p.name || p.productName || 'Product',
      sku: p.sku,
      quantity: p.quantity,
      price: p.price || p.unitPrice,
    }));
  }

  // If it's a JSON string
  if (typeof productsData === 'string') {
    try {
      const parsed = JSON.parse(productsData);
      return parseProducts(parsed);
    } catch {
      return [];
    }
  }

  // If it's a relations object with edges
  if (productsData.edges) {
    return productsData.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name || edge.node.productName || 'Product',
      sku: edge.node.sku,
      quantity: edge.node.quantity,
      price: edge.node.price || edge.node.unitPrice,
    }));
  }

  return [];
}

/**
 * Build GraphQL query fields based on configuration
 */
function buildQueryFields(): string {
  // Return a comprehensive list of common fields
  // The actual CRM will return what's available
  return `
    id
    createdAt
    updatedAt
    name {
      firstName
      lastName
    }
    emails {
      primaryEmail
    }
    phones {
      primaryPhoneNumber
    }
    stage
    amount {
      amountMicros
      currencyCode
    }
    details
  `;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Fetches all products from Twenty CRM custom "Products" object
 */
export async function fetchQuotesFromCRM(): Promise<FetchQuotesResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, quotes: [], statusCounts: {}, error: 'Missing CRM configuration' };
    }

    // Query the Products custom object
    // Note: Twenty CRM uses plural lowercase for custom object queries (e.g., "products")
    // The field is "stages" (plural) based on CRM schema
    const query = `
      query FetchProducts {
        products(first: 100, orderBy: { createdAt: DescNullsLast }) {
          edges {
            node {
              id
              name
              stages
              createdAt
              updatedAt
              ourCost {
                amountMicros
                currencyCode
              }
              orderQuantity
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(config, query);

    if (result.errors) {
      console.error('Twenty CRM: Error fetching products:', result.errors);
      return {
        success: false,
        quotes: [],
        statusCounts: {},
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    // Parse products into quotes, filtering to only allowed stages
    const products = result.data?.products?.edges || [];
    const allQuotes: Quote[] = products.map((edge: any) => {
      const product = edge.node;
      // stages field may be plural - get the current/first stage value
      const stageValue = Array.isArray(product.stages) ? product.stages[0] : product.stages;
      // Normalize to lowercase for matching
      const normalizedStage = stageValue?.toLowerCase() || '';

      // Parse ourCost from Currency type (amountMicros)
      let ourCost: number | undefined;
      if (product.ourCost?.amountMicros) {
        ourCost = product.ourCost.amountMicros / 1000000;
      }

      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        status: normalizedStage,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        crmId: product.id,
        ourCost,
        orderQuantity: product.orderQuantity || undefined,
      };
    });

    // Filter to only include allowed stages
    const quotes = allQuotes.filter(quote =>
      CRM_CONFIG.allowedStages.hasOwnProperty(quote.status)
    );

    // Calculate status counts (only for allowed stages)
    const statusCounts = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`Twenty CRM: Fetched ${quotes.length} products (filtered from ${allQuotes.length} total)`);

    return {
      success: true,
      quotes,
      statusCounts,
    };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error fetching products:', error);
    return {
      success: false,
      quotes: [],
      statusCounts: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Updates a product in Twenty CRM
 */
export async function updateQuoteInCRM(
  quoteId: string,
  updates: Partial<Quote>
): Promise<UpdateQuoteResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, error: 'Missing CRM configuration' };
    }

    // Map dashboard updates to CRM format
    const crmData = mapQuoteToCrm(updates);

    // Update the Products custom object
    // Note: Twenty CRM uses singular PascalCase for mutations (e.g., "updateProduct")
    // ID type is UUID! in Twenty CRM
    const mutation = `
      mutation UpdateProduct($id: UUID!, $data: ProductUpdateInput!) {
        updateProduct(id: $id, data: $data) {
          id
          name
          stages
          updatedAt
          ourCost {
            amountMicros
            currencyCode
          }
          orderQuantity
        }
      }
    `;

    const variables = {
      id: quoteId,
      data: crmData,
    };

    const result = await graphqlRequest(config, mutation, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error updating product:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    const updatedProduct = result.data?.updateProduct;
    if (!updatedProduct) {
      return { success: false, error: 'No data returned from update' };
    }

    console.log(`Twenty CRM: Updated product ${quoteId}`);

    // Handle stages field (may be array or single value)
    const stageValue = Array.isArray(updatedProduct.stages) ? updatedProduct.stages[0] : updatedProduct.stages;

    return {
      success: true,
      quote: {
        id: updatedProduct.id,
        name: updatedProduct.name || '',
        status: CRM_CONFIG.reverseStatusMappings[stageValue] || stageValue?.toLowerCase() || 'new',
        updatedAt: updatedProduct.updatedAt,
      },
    };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Syncs a quote to Twenty CRM (full sync including all fields)
 */
export async function syncQuoteToCRM(quote: Quote): Promise<UpdateQuoteResponse> {
  // For now, this is the same as update
  // In the future, could handle more complex sync logic
  return updateQuoteInCRM(quote.id, quote);
}

/**
 * Introspects the CRM schema to discover available fields on the Products object
 * Useful for debugging and setting up field mappings
 */
export async function introspectCRMSchema(): Promise<{ success: boolean; fields?: string[]; error?: string }> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, error: 'Missing CRM configuration' };
    }

    const query = `
      query IntrospectProduct {
        __type(name: "Product") {
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(config, query);

    if (result.errors) {
      return { success: false, error: result.errors[0]?.message };
    }

    const fields = result.data?.__type?.fields?.map((f: any) => f.name) || [];

    return { success: true, fields };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
