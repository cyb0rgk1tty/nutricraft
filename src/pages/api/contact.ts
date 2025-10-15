export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { createPersonInTwentyCrm } from '../../utils/twentyCrm';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse form data
    const data = await request.formData();
    const name = data.get('name')?.toString() || '';
    const email = data.get('email')?.toString() || '';
    const phone = data.get('phone')?.toString() || '';
    const phoneCountryCode = data.get('phoneCountryCode')?.toString() || '';
    const company = data.get('company')?.toString() || '';
    const targetMarket = data.get('target-market')?.toString() || '';
    const orderQuantity = data.get('order-quantity')?.toString() || '';
    const budget = data.get('budget')?.toString() || '';
    const projectType = data.get('project-type')?.toString() || '';
    const message = data.get('message')?.toString() || '';

    // Basic validation
    if (!name || !email || !projectType || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Please fill in all required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    // Email content
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Company:</strong> ${company || 'Not provided'}</p>
      <p><strong>Target Market:</strong> ${targetMarket || 'Not provided'}</p>
      <p><strong>Order Quantity:</strong> ${orderQuantity || 'Not provided'}</p>
      <p><strong>Budget:</strong> ${budget || 'Not provided'}</p>
      <p><strong>Project Type:</strong> ${projectType}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Target Market: ${targetMarket || 'Not provided'}
Order Quantity: ${orderQuantity || 'Not provided'}
Budget: ${budget || 'Not provided'}
Project Type: ${projectType}

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

    // Create person in Twenty CRM (non-blocking - don't fail form if CRM fails)
    try {
      const crmResult = await createPersonInTwentyCrm({
        name,
        email,
        phone,
        phoneCountryCode,
        company,
        targetMarket,
        orderQuantity,
        budget,
        projectType,
        message,
      });

      if (crmResult.success) {
        console.log('Twenty CRM: Person created successfully:', crmResult.personId);
      } else {
        console.error('Twenty CRM: Failed to create person:', crmResult.error);
      }
    } catch (crmError) {
      // Log CRM errors but don't fail the form submission
      console.error('Twenty CRM: Error creating person:', crmError);
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