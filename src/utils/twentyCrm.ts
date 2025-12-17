/**
 * Twenty CRM Integration Utility
 * Handles creation of Person, Company, and Opportunity records in Twenty CRM
 * from contact form submissions, and fetching Opportunities for the dashboard
 */

// =============================================================================
// TYPES
// =============================================================================

interface TwentyCrmConfig {
  apiUrl: string;
  apiKey: string;
}

interface TwentyCrmResponse {
  success: boolean;
  personId?: string;
  companyId?: string;
  opportunityId?: string;
  error?: string;
}

export interface OpportunitiesResponse {
  success: boolean;
  opportunities: Array<{
    id: string;
    name: string;
    stage: string;
    createdAt: string;
  }>;
  error?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  company?: string;
  targetMarket?: string;
  orderQuantity?: string;
  budget?: string;
  timeline?: string;
  projectType: string;
  message: string;
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
    console.error('Twenty CRM: Missing API URL or API Key');
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
  variables: Record<string, any>
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
 * Parses budget string to micros (multiply by 1,000,000)
 * Returns upper value of the range
 */
function parseBudgetToMicros(budget: string | undefined): number | null {
  if (!budget) return null;

  // Map budget selections to upper dollar values (must match form option values)
  const budgetMap: Record<string, number> = {
    '$0 - $5,000': 5000,
    '$5,000 - $10,000': 10000,
    '$10,000+': 0, // No upper bound - return null
  };

  const dollarValue = budgetMap[budget];
  if (dollarValue === undefined || dollarValue === 0) return null;

  // Convert to micros (multiply by 1,000,000)
  return dollarValue * 1000000;
}

/**
 * Normalizes phone number to E.164 format
 * Phone input library should send E.164 format (+14168888888), but we handle edge cases
 * @param phone - Phone number from form (should be E.164 format)
 * @returns Normalized phone number or null if invalid
 */
function normalizePhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If already has country code (starts with +), return as-is (expected from intl-tel-input)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Fallback handling for edge cases where E.164 format isn't provided:

  // If it's a 10-digit North American number, add +1
  if (cleaned.length === 10 && /^[2-9]\d{9}$/.test(cleaned)) {
    return `+1${cleaned}`;
  }

  // If it's an 11-digit number starting with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // For other formats, we can't reliably determine the country code
  // Log warning but don't fail - phone is optional
  console.warn(`Twenty CRM: Unable to normalize phone number: ${phone}`);
  return null;
}

// =============================================================================
// COMPANY FUNCTIONS
// =============================================================================

/**
 * Searches for a company by name (case-insensitive)
 * @param companyName - Name to search for
 * @returns Company ID if found, null otherwise
 */
export async function findCompanyByName(companyName: string): Promise<string | null> {
  try {
    const config = getCrmConfig();
    if (!config) return null;

    const query = `
      query FindCompany($filter: CompanyFilterInput) {
        companies(filter: $filter) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;

    const variables = {
      filter: {
        name: {
          ilike: `%${companyName}%`,
        },
      },
    };

    const result = await graphqlRequest(config, query, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error searching for company:', result.errors);
      return null;
    }

    const companies = result.data?.companies?.edges || [];

    // Find exact match (case-insensitive)
    const exactMatch = companies.find(
      (edge: any) => edge.node.name.toLowerCase() === companyName.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch.node.id;
    }

    return null;
  } catch (error) {
    console.error('Twenty CRM: Error finding company:', error);
    return null;
  }
}

/**
 * Searches for a person by email address (case-insensitive)
 * @param email - Email to search for
 * @returns Person ID if found, null otherwise
 */
export async function findPersonByEmail(email: string): Promise<string | null> {
  try {
    const config = getCrmConfig();
    if (!config) return null;

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
            ilike: `%${email}%`,
          },
        },
      },
    };

    const result = await graphqlRequest(config, query, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error searching for person:', result.errors);
      return null;
    }

    const people = result.data?.people?.edges || [];

    // Find exact match (case-insensitive)
    const exactMatch = people.find(
      (edge: any) => edge.node.emails?.primaryEmail?.toLowerCase() === email.toLowerCase()
    );

    if (exactMatch) {
      console.log(`Twenty CRM: Found existing person ${exactMatch.node.id} for ${email}`);
      return exactMatch.node.id;
    }

    return null;
  } catch (error) {
    console.error('Twenty CRM: Error finding person:', error);
    return null;
  }
}

/**
 * Checks if a person already has an opportunity
 * @param personId - Person ID to check
 * @returns true if opportunity exists, false otherwise
 */
export async function hasOpportunityForPerson(personId: string): Promise<boolean> {
  try {
    const config = getCrmConfig();
    if (!config) return false;

    const query = `
      query FindOpportunities($filter: OpportunityFilterInput) {
        opportunities(filter: $filter, first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const variables = {
      filter: {
        pointOfContactId: {
          eq: personId,
        },
      },
    };

    const result = await graphqlRequest(config, query, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error checking for opportunities:', result.errors);
      return false;
    }

    const opportunities = result.data?.opportunities?.edges || [];
    return opportunities.length > 0;
  } catch (error) {
    console.error('Twenty CRM: Error checking for opportunities:', error);
    return false;
  }
}

/**
 * Creates a Company record in Twenty CRM
 * @param companyName - Name of the company
 * @param emailDomain - Optional domain extracted from email
 * @returns Response with success status and company ID
 */
export async function createCompanyInTwentyCrm(
  companyName: string,
  emailDomain?: string
): Promise<TwentyCrmResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, error: 'Missing CRM configuration' };
    }

    const mutation = `
      mutation CreateCompany($data: CompanyCreateInput!) {
        createCompany(data: $data) {
          id
          name
        }
      }
    `;

    const variables: any = {
      data: {
        name: companyName,
      },
    };

    // Add domain if provided
    if (emailDomain) {
      variables.data.domainName = {
        primaryLinkUrl: emailDomain,
      };
    }

    const result = await graphqlRequest(config, mutation, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error creating company:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    const companyId = result.data?.createCompany?.id;

    if (!companyId) {
      console.error('Twenty CRM: No company ID returned', result);
      return { success: false, error: 'No company ID returned' };
    }

    console.log(`Twenty CRM: Created company ${companyId} for "${companyName}"`);

    return {
      success: true,
      companyId,
    };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error creating company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// PERSON FUNCTIONS
// =============================================================================

/**
 * Creates a Person record in Twenty CRM
 * @param formData - Contact form submission data
 * @param companyId - Optional company ID to link the person to
 * @returns Promise with success status and person ID or error
 */
export async function createPersonInTwentyCrm(
  formData: ContactFormData,
  companyId?: string
): Promise<TwentyCrmResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, error: 'Missing CRM configuration' };
    }

    // GraphQL mutation to create a person
    const mutation = `
      mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) {
          id
          name {
            firstName
            lastName
          }
        }
      }
    `;

    // Prepare variables - split name into firstName and lastName
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build input data - Twenty CRM uses object structures for emails and phones
    const variables: any = {
      data: {
        name: {
          firstName,
          lastName,
        },
      },
    };

    // Link to company if provided
    if (companyId) {
      variables.data.companyId = companyId;
    }

    // Add emails if provided (Twenty CRM expects an object with primaryEmail and additionalEmails)
    if (formData.email) {
      variables.data.emails = {
        primaryEmail: formData.email,
        additionalEmails: null,
      };
    }

    // Add phones if provided and valid
    if (formData.phone) {
      const normalizedPhone = normalizePhoneNumber(formData.phone);
      if (normalizedPhone) {
        // Use ISO country code from intl-tel-input (e.g., "CA", "US", "GB")
        const countryCode = formData.phoneCountryCode || '';

        variables.data.phones = {
          primaryPhoneNumber: normalizedPhone,
          primaryPhoneCountryCode: countryCode,
          additionalPhones: null,
        };
      }
    }

    const result = await graphqlRequest(config, mutation, variables);

    if (result.errors) {
      console.error('Twenty CRM GraphQL errors:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    const personId = result.data?.createPerson?.id;

    if (!personId) {
      console.error('Twenty CRM: No person ID returned', result);
      return { success: false, error: 'No person ID returned' };
    }

    console.log(`Twenty CRM: Created person ${personId} for ${formData.email}${companyId ? ` (company: ${companyId})` : ''}`);

    return {
      success: true,
      personId,
    };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// OPPORTUNITY FUNCTIONS
// =============================================================================

/**
 * Creates an Opportunity record in Twenty CRM
 * @param formData - Contact form submission data
 * @param personId - Person ID to link as point of contact
 * @param companyId - Optional company ID to link
 * @returns Promise with success status and opportunity ID or error
 */
export async function createOpportunityInTwentyCrm(
  formData: ContactFormData,
  personId: string,
  companyId?: string
): Promise<TwentyCrmResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, error: 'Missing CRM configuration' };
    }

    const mutation = `
      mutation CreateOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) {
          id
          name
          stage
        }
      }
    `;

    // Format project type for display (e.g., "private-label" -> "Private Label")
    const projectTypeDisplay = formData.projectType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Build opportunity name: "Project Type - Contact Name"
    const opportunityName = `${projectTypeDisplay} - ${formData.name}`;

    // Parse budget to micros
    const amountMicros = parseBudgetToMicros(formData.budget);

    const variables: any = {
      data: {
        name: opportunityName,
        stage: 'NEW',
        pointOfContactId: personId,
        details: formData.message || '',
      },
    };

    // Add company link if provided
    if (companyId) {
      variables.data.companyId = companyId;
    }

    // Add amount if budget was provided and parsed
    if (amountMicros !== null) {
      variables.data.amount = {
        amountMicros: amountMicros,
        currencyCode: 'USD',
      };
    }

    const result = await graphqlRequest(config, mutation, variables);

    if (result.errors) {
      console.error('Twenty CRM: Error creating opportunity:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    const opportunityId = result.data?.createOpportunity?.id;

    if (!opportunityId) {
      console.error('Twenty CRM: No opportunity ID returned', result);
      return { success: false, error: 'No opportunity ID returned' };
    }

    console.log(`Twenty CRM: Created opportunity ${opportunityId} "${opportunityName}"`);

    return {
      success: true,
      opportunityId,
    };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error creating opportunity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// FETCH OPPORTUNITIES (for Dashboard)
// =============================================================================

/**
 * Fetches opportunities from Twenty CRM for the admin dashboard
 * Returns the most recent opportunities (last 100) for daily tracking
 */
export async function fetchOpportunities(): Promise<OpportunitiesResponse> {
  try {
    const config = getCrmConfig();
    if (!config) {
      return { success: false, opportunities: [], error: 'Missing CRM configuration' };
    }

    const query = `
      query FetchOpportunities($first: Int!) {
        opportunities(first: $first, orderBy: { createdAt: DescNullsLast }) {
          edges {
            node {
              id
              name
              stage
              createdAt
            }
          }
        }
      }
    `;

    // Fetch last 100 opportunities (covers ~30 days typically)
    const result = await graphqlRequest(config, query, { first: 100 });

    if (result.errors) {
      console.error('Twenty CRM: Error fetching opportunities:', result.errors);
      return {
        success: false,
        opportunities: [],
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    // Transform edges to flat array
    const opportunities = result.data?.opportunities?.edges?.map(
      (edge: { node: { id: string; name: string; stage: string; createdAt: string } }) => edge.node
    ) || [];

    return { success: true, opportunities };
  } catch (error) {
    console.error('Twenty CRM: Unexpected error fetching opportunities:', error);
    return {
      success: false,
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
