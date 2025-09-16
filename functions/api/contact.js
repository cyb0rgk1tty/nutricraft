export async function onRequestPost(context) {
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  try {
    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const phone = formData.get('phone') || '';
    const company = formData.get('company') || '';
    const projectType = formData.get('project-type') || '';
    const message = formData.get('message') || '';

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

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587'),
      secure: env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // Email content
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Company:</strong> ${company || 'Not provided'}</p>
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
Project Type: ${projectType}

Message:
${message}
    `;

    // Send email
    await transporter.sendMail({
      from: `"${name}" <${env.SMTP_USER}>`,
      to: env.EMAIL_TO || 'hello@nutricraftlabs.com',
      replyTo: email,
      subject: `Contact Form: ${projectType} - ${name}`,
      text: textContent,
      html: htmlContent,
    });

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
}