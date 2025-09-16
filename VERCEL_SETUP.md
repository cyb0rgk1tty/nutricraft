# Vercel Deployment Setup

This project is configured to deploy on Vercel with server-side contact form functionality.

## Build Settings

When importing your project to Vercel:
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: (leave default)
- **Framework Preset**: Astro (auto-detected)

## Environment Variables

Add the following environment variables in your Vercel project dashboard:

1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_TO=your-email@example.com
```

## Features

- **Astro Hybrid Rendering**: Static pages with API routes for dynamic functionality
- **Contact Form**: Server-side email sending via SMTP
- **Google Ads Conversion Tracking**: Integrated tracking on form submission
- **Optimized Build**: Tailwind CSS with minimal bundle size

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contact Form Implementation

- **API Endpoint**: `/api/contact`
- **Email Service**: nodemailer with SMTP
- **Validation**: Client and server-side
- **Success Tracking**: Google Ads conversion event

## Deployment

1. Push code to your Git repository
2. Import project to Vercel
3. Add environment variables
4. Deploy!

The contact form will work immediately after adding the SMTP credentials in Vercel's environment variables.