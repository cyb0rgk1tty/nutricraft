/**
 * Cal.com Webhook Endpoint
 * Receives booking events from Cal.com and creates opportunities in TwentyCRM
 *
 * Webhook URL: https://nutricraftlabs.com/api/webhooks/cal
 * Events: BOOKING_CREATED
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import crypto from 'crypto';
import {
  createPersonInTwentyCrm,
  createOpportunityInTwentyCrm,
  findPersonByEmail,
  hasOpportunityForPerson,
} from '../../../utils/twentyCrm';
import { logAndSanitize } from '../../../utils/errorSanitizer';

// Cal.com webhook payload structure
interface CalWebhookPayload {
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED' | 'MEETING_ENDED';
  createdAt: string;
  payload: {
    type: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    organizer: {
      id: number;
      name: string;
      email: string;
      timeZone: string;
    };
    attendees: Array<{
      name: string;
      email: string;
      timeZone: string;
      language: { locale: string };
    }>;
    location?: string;
    destinationCalendar?: unknown;
    hideCalendarNotes?: boolean;
    requiresConfirmation?: boolean;
    eventTypeId?: number;
    seatsShowAttendees?: boolean;
    seatsPerTimeSlot?: number | null;
    uid: string;
    conferenceData?: unknown;
    videoCallData?: unknown;
    appsStatus?: unknown[];
    metadata: Record<string, unknown>;
    eventTitle?: string;
    eventDescription?: string | null;
    price?: number;
    currency?: string;
    length?: number;
    bookingId?: number;
    status?: string;
    additionalNotes?: string;
    customInputs?: Record<string, unknown>;
    responses?: Record<string, unknown>;
  };
}

/**
 * Verify Cal.com webhook signature using HMAC-SHA256
 */
function verifyCalSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

/**
 * Capitalize names properly (handles hyphens, apostrophes, multiple spaces)
 */
function capitalizeName(name: string): string {
  if (!name) return '';

  const normalized = name.trim().replace(/\s+/g, ' ');

  return normalized.split(' ').map(word => {
    if (!word) return '';

    // Handle hyphenated names
    if (word.includes('-')) {
      return word.split('-').map(part => capitalizeWord(part)).join('-');
    }

    return capitalizeWord(word);
  }).join(' ');
}

function capitalizeWord(word: string): string {
  if (!word) return '';

  // Handle names with apostrophes
  if (word.includes("'")) {
    return word.split("'").map(part => {
      if (!part) return '';
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("'");
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Format date/time for display
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = process.env.CAL_WEBHOOK_SECRET || import.meta.env.CAL_WEBHOOK_SECRET;

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature (skip in development if no secret configured)
    const signature = request.headers.get('x-cal-signature-256');

    if (webhookSecret) {
      if (!verifyCalSignature(rawBody, signature, webhookSecret)) {
        console.error('Cal.com webhook: Invalid signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('Cal.com webhook: No CAL_WEBHOOK_SECRET configured - signature verification skipped');
    }

    // Parse the webhook payload
    const webhookData: CalWebhookPayload = JSON.parse(rawBody);

    // Only process BOOKING_CREATED events
    if (webhookData.triggerEvent !== 'BOOKING_CREATED') {
      console.log(`Cal.com webhook: Ignoring event type: ${webhookData.triggerEvent}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { payload } = webhookData;

    // Get the first attendee (the person who booked)
    const attendee = payload.attendees?.[0];
    if (!attendee) {
      console.error('Cal.com webhook: No attendee found in booking');
      return new Response(
        JSON.stringify({ success: false, error: 'No attendee found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for TwentyCRM
    const attendeeName = capitalizeName(attendee.name);
    const attendeeEmail = attendee.email;
    const eventTitle = payload.eventTitle || payload.title || 'Discovery Call';
    const startTime = formatDateTime(payload.startTime);

    // Build message/details from booking info
    const bookingDetails = [
      `Booked via Cal.com`,
      `Event: ${eventTitle}`,
      `Scheduled: ${startTime}`,
      payload.additionalNotes ? `Notes: ${payload.additionalNotes}` : null,
      payload.location ? `Location: ${payload.location}` : null,
    ].filter(Boolean).join('\n');

    // Create form data structure compatible with existing CRM functions
    const formData = {
      name: attendeeName,
      email: attendeeEmail,
      phone: undefined,
      phoneCountryCode: undefined,
      company: undefined,
      targetMarket: undefined,
      orderQuantity: undefined,
      budget: undefined,
      timeline: undefined,
      projectType: 'discovery-call',
      message: bookingDetails,
    };

    console.log(`Cal.com webhook: Processing booking for ${attendeeName} (${attendeeEmail})`);

    // Step 1: Check if Person already exists by email
    let personId: string | undefined;
    let isExistingPerson = false;

    try {
      const existingPersonId = await findPersonByEmail(attendeeEmail);

      if (existingPersonId) {
        personId = existingPersonId;
        isExistingPerson = true;
        console.log(`Cal.com webhook: Found existing person ${personId} for ${attendeeEmail}`);
      } else {
        // Create new Person
        const personResult = await createPersonInTwentyCrm(formData);
        if (personResult.success && personResult.personId) {
          personId = personResult.personId;
          console.log(`Cal.com webhook: Created new person ${personId}`);
        } else {
          console.error('Cal.com webhook: Failed to create person:', personResult.error);
        }
      }
    } catch (error) {
      console.error('Cal.com webhook: Error with person lookup/creation:', error);
    }

    // Step 2: Check if Opportunity already exists for this Person
    if (personId) {
      try {
        // Only check for existing opportunity if person already existed
        const opportunityExists = isExistingPerson && await hasOpportunityForPerson(personId);

        if (opportunityExists) {
          console.log(`Cal.com webhook: Skipping opportunity - one already exists for person ${personId}`);
        } else {
          // Create new Opportunity
          const opportunityResult = await createOpportunityInTwentyCrm(formData, personId);
          if (opportunityResult.success) {
            console.log(`Cal.com webhook: Created opportunity ${opportunityResult.opportunityId}`);
          } else {
            console.error('Cal.com webhook: Failed to create opportunity:', opportunityResult.error);
          }
        }
      } catch (error) {
        console.error('Cal.com webhook: Error with opportunity lookup/creation:', error);
      }
    }

    // Always return 200 to acknowledge receipt (don't fail webhooks due to CRM errors)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking processed',
        personId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log full error server-side, return sanitized message to client
    const safeMessage = logAndSanitize('Cal.com webhook', error, 'Webhook processing failed');

    // Return 200 even on errors to prevent Cal.com from retrying indefinitely
    return new Response(
      JSON.stringify({
        success: false,
        error: safeMessage,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
