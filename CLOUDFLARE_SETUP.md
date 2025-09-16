# Cloudflare Pages Setup for Contact Form

This project uses Cloudflare Pages for hosting and Cloudflare Functions for the contact form email functionality.

## Environment Variables

You need to configure the following environment variables in your Cloudflare Pages dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment variables
3. Add the following variables:

```
SMTP_HOST=mx1.clickclicksend.com
SMTP_PORT=587
SMTP_USER=info@nutricraftlabs.com
SMTP_PASS=[your-smtp-password]
EMAIL_TO=contact@nutricraftlabs.com
```

⚠️ **IMPORTANT**: Add these as encrypted environment variables in Cloudflare, NOT in the .env file!

## Contact Form Implementation

- **Static Site**: Built with Astro in static mode
- **Form Handler**: Cloudflare Function at `/functions/api/contact.js`
- **Email Service**: Uses nodemailer with your SMTP credentials
- **Conversion Tracking**: Google Ads conversion tracking implemented

## Features

1. **Form Validation**: Client and server-side validation
2. **Loading States**: Shows "Sending..." while processing
3. **Success Message**: Replaces form with success confirmation
4. **Error Handling**: User-friendly error messages
5. **Google Ads Tracking**: Tracks successful submissions as conversions

## Testing Locally

Cloudflare Functions cannot be tested with `npm run dev`. To test:
1. Deploy to Cloudflare Pages
2. Test on the live site
3. Check Cloudflare Functions logs for debugging

## Deployment

The site will automatically deploy when you push to your connected Git repository. The Cloudflare Function will be deployed alongside your static files.