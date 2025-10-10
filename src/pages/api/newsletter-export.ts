export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

/**
 * Newsletter subscribers export endpoint
 *
 * Usage: GET /api/newsletter-export?token=YOUR_EXPORT_TOKEN
 *
 * Set NEWSLETTER_EXPORT_TOKEN in your .env file for security
 * Returns: CSV file with all newsletter subscribers from Google Sheets
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get token from URL query parameters
    const url = new URL(request.url);
    const providedToken = url.searchParams.get('token');

    // Check if export token is configured
    const exportToken = process.env.NEWSLETTER_EXPORT_TOKEN || import.meta.env.NEWSLETTER_EXPORT_TOKEN;

    if (exportToken) {
      // If token is configured, validate it
      if (!providedToken || providedToken !== exportToken) {
        return new Response('Unauthorized. Invalid or missing export token.', {
          status: 401,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    // If no token configured, allow access (useful for development)

    // Get Google Sheets credentials from environment
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || import.meta.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || import.meta.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      return new Response('Server configuration error.', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Initialize JWT auth
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Initialize Google Sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Load document properties and worksheets
    await doc.loadInfo();

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Load all rows
    const rows = await sheet.getRows();

    if (!rows || rows.length === 0) {
      return new Response('No subscribers found.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Generate CSV content
    const headers = ['email', 'subscribed_at', 'source', 'status'];
    const csvHeader = headers.join(',');

    const csvRows = rows.map(row => {
      return [
        `"${row.get('email') || ''}"`,
        `"${row.get('subscribed_at') || ''}"`,
        `"${row.get('source') || ''}"`,
        `"${row.get('status') || ''}"`
      ].join(',');
    });

    const csv = [csvHeader, ...csvRows].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `newsletter-subscribers-${timestamp}.csv`;

    // Return CSV file
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    });

  } catch (error) {
    console.error('Export error:', error);

    let errorMessage = 'An unexpected error occurred.';

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Make sure the sheet is shared with the service account.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Google Sheet not found. Check the GOOGLE_SHEET_ID environment variable.';
      }
    }

    return new Response(errorMessage, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
