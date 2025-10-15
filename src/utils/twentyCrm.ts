/**
 * Twenty CRM Integration Utility
 * Handles creation of Person records in Twenty CRM from contact form submissions
 */

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  targetMarket?: string;
  orderQuantity?: string;
  budget?: string;
  projectType: string;
  message: string;
}

interface TwentyCrmResponse {
  success: boolean;
  personId?: string;
  error?: string;
}

/**
 * Creates a Person record in Twenty CRM
 * @param formData - Contact form submission data
 * @returns Promise with success status and person ID or error
 */
export async function createPersonInTwentyCrm(
  formData: ContactFormData
): Promise<TwentyCrmResponse> {
  try {
    const apiUrl = process.env.TWENTY_API_URL || import.meta.env.TWENTY_API_URL;
    const apiKey = process.env.TWENTY_API_KEY || import.meta.env.TWENTY_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Twenty CRM: Missing API URL or API Key');
      return { success: false, error: 'Missing CRM configuration' };
    }

    // Build additional notes with lead qualification data
    const leadNotes = [
      formData.targetMarket && `Target Market: ${formData.targetMarket}`,
      formData.orderQuantity && `Order Quantity: ${formData.orderQuantity}`,
      formData.budget && `Budget: ${formData.budget}`,
      `Project Type: ${formData.projectType}`,
      `Message: ${formData.message}`,
    ]
      .filter(Boolean)
      .join('\n');

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

    // Build input data - Twenty CRM uses plural fields for emails and phones
    const variables = {
      data: {
        name: {
          firstName,
          lastName,
        },
        ...(formData.company && { companyName: formData.company }),
      },
    };

    // Add email if provided (Twenty may expect it as singular 'email' in input despite plural query field)
    if (formData.email) {
      (variables.data as any).email = formData.email;
    }

    // Add phone if provided
    if (formData.phone) {
      (variables.data as any).phone = formData.phone;
    }

    // Make API request to Twenty CRM
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twenty CRM API error:', response.status, errorText);
      return {
        success: false,
        error: `API returned status ${response.status}`,
      };
    }

    const result = await response.json();

    // Check for GraphQL errors
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

    console.log(`Twenty CRM: Created person ${personId} for ${formData.email}`);

    // TODO: In the future, we could also create a Note record attached to this person
    // with the leadNotes content to store the additional lead qualification data

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
