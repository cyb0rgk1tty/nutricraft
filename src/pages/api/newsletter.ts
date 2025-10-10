export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse JSON body
    const { email, source = 'footer' } = await request.json();

    // Validate email presence
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email address is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Please provide a valid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get Google Sheets credentials from environment
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || import.meta.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || import.meta.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      console.error('Missing Google Sheets credentials in environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error. Please try again later.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize JWT auth
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize Google Sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Load document properties and worksheets
    await doc.loadInfo();

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Load all rows to check for duplicates
    const rows = await sheet.getRows();

    // Check if email already exists (case-insensitive)
    const emailExists = rows.some(row =>
      row.get('email') && row.get('email').toLowerCase().trim() === normalizedEmail
    );

    if (emailExists) {
      return new Response(JSON.stringify({
        success: true,
        message: 'You\'re already subscribed to our newsletter!',
        alreadySubscribed: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add new subscriber
    const timestamp = new Date().toISOString();
    await sheet.addRow({
      email: normalizedEmail,
      subscribed_at: timestamp,
      source: source,
      status: 'active'
    });

    // Success
    return new Response(JSON.stringify({
      success: true,
      message: 'Thanks for subscribing! We\'ll keep you updated with supplement industry insights.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    // Provide more specific error messages for common issues
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = 'Server configuration error. Please contact support.';
        console.error('Google Sheets permission error. Make sure the sheet is shared with the service account.');
      } else if (error.message.includes('not found')) {
        errorMessage = 'Server configuration error. Please contact support.';
        console.error('Google Sheet not found. Check the GOOGLE_SHEET_ID environment variable.');
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
