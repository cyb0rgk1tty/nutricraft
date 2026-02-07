export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// In-memory rate limiting for newsletter subscriptions
const newsletterAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBSCRIPTIONS_PER_HOUR = 5;

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

function checkNewsletterRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = newsletterAttempts.get(ip);

  if (!record || now > record.resetAt) {
    newsletterAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  record.count++;
  return record.count <= MAX_SUBSCRIPTIONS_PER_HOUR;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limit check
    const clientIP = getClientIP(request);
    if (!checkNewsletterRateLimit(clientIP)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many subscription attempts. Please try again later.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
