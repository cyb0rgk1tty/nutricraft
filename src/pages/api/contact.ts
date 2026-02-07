export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import {
  createPersonInTwentyCrm,
  createCompanyInTwentyCrm,
  createOpportunityInTwentyCrm,
  findCompanyByName,
  findPersonByEmail,
  hasOpportunityForPerson,
} from '../../utils/twentyCrm';

/**
 * Escape HTML special characters to prevent XSS in email templates
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Capitalize names properly for display in emails and CRM
 * Handles hyphens, apostrophes, and multiple spaces
 * @param name - Full name from form input
 * @returns Properly capitalized name
 */
function capitalizeName(name: string): string {
  if (!name) return '';

  // Trim and normalize multiple spaces to single space
  const normalized = name.trim().replace(/\s+/g, ' ');

  // Split by spaces and capitalize each word
  return normalized.split(' ').map(word => {
    if (!word) return '';

    // Handle hyphenated names (e.g., "mary-jane" -> "Mary-Jane")
    if (word.includes('-')) {
      return word.split('-').map(part => capitalizeWord(part)).join('-');
    }

    return capitalizeWord(word);
  }).join(' ');
}

/**
 * Capitalize a single word, handling apostrophes
 * @param word - Single word to capitalize
 * @returns Capitalized word
 */
function capitalizeWord(word: string): string {
  if (!word) return '';

  // Handle names with apostrophes (e.g., "o'brien" -> "O'Brien")
  if (word.includes("'")) {
    return word.split("'").map((part, index) => {
      if (!part) return '';
      // Capitalize first letter of each part after apostrophe
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("'");
  }

  // Standard capitalization: first letter uppercase, rest lowercase
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse form data
    const data = await request.formData();
    const name = capitalizeName(data.get('name')?.toString() || '');
    const email = data.get('email')?.toString() || '';
    const phone = data.get('phone')?.toString() || '';
    const phoneCountryCode = data.get('phoneCountryCode')?.toString() || '';
    const company = data.get('company')?.toString() || '';
    const targetMarket = data.get('target-market')?.toString() || '';
    const orderQuantity = data.get('order-quantity')?.toString() || '';
    const budget = data.get('budget')?.toString() || '';
    const timeline = data.get('timeline')?.toString() || '';
    const projectType = data.get('project-type')?.toString() || '';
    const projectStage = data.get('project-stage')?.toString() || '';
    const message = data.get('message')?.toString() || '';
    const honeypot = data.get('website')?.toString() || '';
    const manufactureRegion = data.get('manufacture-region')?.toString() || '';

    // Honeypot spam check - if filled, it's a bot
    if (honeypot) {
      // Return success to not alert the bot
      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you for your inquiry! We\'ll be in touch within 24 hours.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic validation
    if (!name || !email || !projectType || !projectStage || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Please fill in all required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation (matches newsletter endpoint's stricter pattern)
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

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || import.meta.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || import.meta.env.SMTP_PORT || '587'),
      secure: (process.env.SMTP_PORT || import.meta.env.SMTP_PORT) === '465',
      auth: {
        user: process.env.SMTP_USER || import.meta.env.SMTP_USER,
        pass: process.env.SMTP_PASS || import.meta.env.SMTP_PASS,
      },
    });

    // Email content (escape all user input to prevent XSS)
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${phone ? escapeHtml(phone) : 'Not provided'}</p>
      <p><strong>Company:</strong> ${company ? escapeHtml(company) : 'Not provided'}</p>
      <p><strong>Target Market:</strong> ${targetMarket ? escapeHtml(targetMarket) : 'Not provided'}</p>
      <p><strong>Manufacture Region:</strong> ${manufactureRegion ? escapeHtml(manufactureRegion) : 'Not provided'}</p>
      <p><strong>Order Quantity:</strong> ${orderQuantity ? escapeHtml(orderQuantity) : 'Not provided'}</p>
      <p><strong>Budget:</strong> ${budget ? escapeHtml(budget) : 'Not provided'}</p>
      <p><strong>Timeline:</strong> ${timeline ? escapeHtml(timeline) : 'Not provided'}</p>
      <p><strong>Project Type:</strong> ${escapeHtml(projectType)}</p>
      <p><strong>Project Stage:</strong> ${escapeHtml(projectStage)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Target Market: ${targetMarket || 'Not provided'}
Manufacture Region: ${manufactureRegion || 'Not provided'}
Order Quantity: ${orderQuantity || 'Not provided'}
Budget: ${budget || 'Not provided'}
Timeline: ${timeline || 'Not provided'}
Project Type: ${projectType}
Project Stage: ${projectStage}

Message:
${message}
    `;

    // Send email
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER || import.meta.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO || import.meta.env.EMAIL_TO || 'hello@nutricraftlabs.com',
      replyTo: email,
      subject: `Contact Form: ${projectType} - ${name}`,
      text: textContent,
      html: htmlContent,
    });

    // Create records in Twenty CRM (non-blocking - don't fail form if CRM fails)
    // Flow: Company (if provided) → Person → Opportunity
    try {
      const formData = {
        name,
        email,
        phone,
        phoneCountryCode,
        company,
        targetMarket,
        manufactureRegion,
        orderQuantity,
        budget,
        timeline,
        projectType,
        projectStage,
        message,
      };

      let companyId: string | undefined;
      let personId: string | undefined;

      // Step 1: Handle Company (if company name provided)
      if (company) {
        // Check if company already exists
        const existingCompanyId = await findCompanyByName(company);

        if (existingCompanyId) {
          companyId = existingCompanyId;
        } else {
          // Create new company
          const companyResult = await createCompanyInTwentyCrm(company);
          if (companyResult.success && companyResult.companyId) {
            companyId = companyResult.companyId;
          } else {
            console.error('Twenty CRM: Failed to create company:', companyResult.error);
          }
        }
      }

      // Step 2: Check if Person already exists by email, create if not
      let isExistingPerson = false;
      const existingPersonId = await findPersonByEmail(email);

      if (existingPersonId) {
        personId = existingPersonId;
        isExistingPerson = true;
        console.log(`Twenty CRM: Found existing person ${personId} for ${email}`);
      } else {
        // Create new Person (linked to company if available)
        const personResult = await createPersonInTwentyCrm(formData, companyId);
        if (personResult.success && personResult.personId) {
          personId = personResult.personId;
        } else {
          console.error('Twenty CRM: Failed to create person:', personResult.error);
        }
      }

      // Step 3: Check if Opportunity exists, create if not
      if (personId) {
        // Only check for existing opportunity if person already existed
        const opportunityExists = isExistingPerson && await hasOpportunityForPerson(personId);

        if (opportunityExists) {
          console.log(`Twenty CRM: Skipping opportunity - one already exists for person ${personId}`);
        } else {
          const opportunityResult = await createOpportunityInTwentyCrm(formData, personId, companyId);
          if (!opportunityResult.success) {
            console.error('Twenty CRM: Failed to create opportunity:', opportunityResult.error);
          }
        }
      } else {
        console.error('Twenty CRM: Skipping opportunity creation - no person ID');
      }

    } catch (crmError) {
      // Log CRM errors but don't fail the form submission
      console.error('Twenty CRM: Error in CRM integration:', crmError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your inquiry! We\'ll be in touch within 24 hours.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send email. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};