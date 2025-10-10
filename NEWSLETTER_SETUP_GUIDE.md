# Newsletter Setup Guide - Google Sheets

This guide explains how to use the Google Sheets-based newsletter subscription feature.

## Overview

The newsletter system uses **Google Sheets** as your subscriber database, providing:

- ✅ **Works on Vercel** - No file system limitations
- ✅ **Free** - Google Sheets API is free for reasonable usage
- ✅ **Easy to view** - Familiar spreadsheet interface
- ✅ **Real-time updates** - See new subscribers instantly
- ✅ **Easy export** - Built-in CSV download + API endpoint
- ✅ **No database setup** - Simple configuration

---

## Quick Start

### 1. Complete Google Cloud Setup

Follow the detailed instructions in **`GOOGLE_SHEETS_SETUP.md`**:
- Create Google Cloud project
- Enable Google Sheets API
- Create service account
- Download JSON credentials
- Create Google Sheet with headers
- Share sheet with service account

### 2. Configure Environment Variables

Add to your `.env` file (see `.env.example` for template):

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=newsletter-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_from_url
NEWSLETTER_EXPORT_TOKEN=optional-random-token-for-security
```

### 3. Test Locally

```bash
npm run dev
# Visit http://192.168.50.5:4321
# Scroll to footer and test the signup form
# Check your Google Sheet for the new entry
```

### 4. Deploy to Vercel

1. Push code to GitHub
2. Add environment variables in Vercel Dashboard:
   - Settings → Environment Variables
   - Add all three Google Sheets variables
3. Redeploy
4. Test on production

---

## How It Works

### Newsletter Signup Form

The newsletter form appears in the footer of every page:
- User enters email address
- Client-side validation
- Submits to `/api/newsletter` endpoint
- API adds row to Google Sheet
- User receives instant feedback

### Google Sheets Storage

Your subscribers are stored in Google Sheets with columns:
- **email** - Subscriber email (unique)
- **subscribed_at** - ISO timestamp
- **source** - Where they subscribed (e.g., "footer", "blog")
- **status** - Subscription status (e.g., "active")

### Duplicate Prevention

The API automatically checks for duplicate emails:
- Reads all existing rows
- Compares email (case-insensitive)
- Returns friendly message if already subscribed

---

## API Endpoints

### Subscribe: `POST /api/newsletter`

**Request:**
```json
{
  "email": "user@example.com",
  "source": "footer"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thanks for subscribing! We'll keep you updated with supplement industry insights."
}
```

**Response (Already Subscribed):**
```json
{
  "success": true,
  "message": "You're already subscribed to our newsletter!",
  "alreadySubscribed": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Please provide a valid email address"
}
```

### Export: `GET /api/newsletter-export?token=TOKEN`

Downloads all subscribers as CSV file.

**Usage:**
```bash
# Without token (if not configured)
curl http://localhost:4321/api/newsletter-export -o subscribers.csv

# With token (production)
curl "https://nutricraftlabs.com/api/newsletter-export?token=YOUR_TOKEN" -o subscribers.csv
```

**Optional Security:** Set `NEWSLETTER_EXPORT_TOKEN` in `.env` to require authentication.

---

## Viewing Your Subscribers

### Option 1: Google Sheets UI (Recommended)
- Open your Google Sheet directly
- All subscribers visible in real-time
- Use built-in filters, sorting, charts
- Collaborate with team members

### Option 2: API Export Endpoint
```bash
curl "https://nutricraftlabs.com/api/newsletter-export?token=YOUR_TOKEN" > subscribers.csv
```

### Option 3: Google Sheets Download
- File → Download → CSV or Excel
- Choose your preferred format

---

## Customization

### Change Form Location

The form is currently in the footer. To move it:

```astro
---
import NewsletterSignup from '../components/NewsletterSignup.astro';
---

<!-- Place it anywhere in your layout -->
<NewsletterSignup />
```

### Update Form Styling

Edit `/src/components/NewsletterSignup.astro`:

```astro
<!-- Current: Horizontal layout on desktop -->
<form class="flex flex-col sm:flex-row gap-3">

<!-- Alternative: Always vertical -->
<form class="flex flex-col gap-3">
```

### Add Custom Fields

To collect more than just email:

1. **Add column to Google Sheet:**
   - Add header: `first_name`, `company`, etc.

2. **Update form component:**
   - Add input fields in NewsletterSignup.astro

3. **Update API endpoint:**
   ```typescript
   const { email, first_name, company, source = 'footer' } = await request.json();

   await sheet.addRow({
     email: normalizedEmail,
     first_name: first_name || '',
     company: company || '',
     subscribed_at: timestamp,
     source: source,
     status: 'active'
   });
   ```

### Change Success Message

In `/src/components/NewsletterSignup.astro`:

```typescript
newsletterMessage.textContent = result.message;
// Change API message in /src/pages/api/newsletter.ts:
message: 'Your custom success message here!'
```

---

## Analytics Tracking

Newsletter signups automatically push events to Google Tag Manager:

```javascript
window.dataLayer.push({
  event: 'newsletter_signup',
  newsletter_source: 'footer'
});
```

Set up conversion tracking in Google Analytics or Google Ads using this event.

---

## Exporting for Newsletter Platforms

When you're ready to start sending newsletters:

### Step 1: Export Subscribers

**Via API:**
```bash
curl "https://nutricraftlabs.com/api/newsletter-export?token=YOUR_TOKEN" -o subscribers.csv
```

**Via Google Sheets:**
- File → Download → Comma Separated Values (.csv)

### Step 2: Import to Newsletter Platform

All major newsletter platforms accept CSV imports:

**Mailchimp:**
- Audience → Import contacts → CSV

**ConvertKit:**
- Subscribers → Import → Upload CSV

**Beehiiv:**
- Subscribers → Import → Upload CSV

**Buttondown:**
- Subscribers → Import → CSV file

**Resend:**
- Use Audiences API to import programmatically

### Step 3: Optional - Update Form

After importing, you can:
- **Keep current setup:** Continue collecting in Google Sheets
- **Switch to platform API:** Update `/src/pages/api/newsletter.ts` to post directly to newsletter service
- **Use both:** Sync to both Google Sheets and newsletter platform

---

## Troubleshooting

### "Server configuration error"

**Cause:** Missing or invalid environment variables

**Solution:**
- Check `.env` has all three Google Sheets variables
- Verify `GOOGLE_PRIVATE_KEY` includes quotes and `\n` characters
- Ensure `GOOGLE_SHEET_ID` matches your spreadsheet URL

### "The caller does not have permission"

**Cause:** Sheet not shared with service account

**Solution:**
- Open Google Sheet → Share button
- Add service account email (from JSON credentials)
- Set role to "Editor"
- Click "Share"

### "Google Sheet not found"

**Cause:** Invalid spreadsheet ID

**Solution:**
- Check `GOOGLE_SHEET_ID` in `.env`
- Copy ID from sheet URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- It's the long alphanumeric string between `/d/` and `/edit`

### "Invalid key format"

**Cause:** `GOOGLE_PRIVATE_KEY` formatting issue

**Solution:**
- Ensure it's wrapped in quotes
- Keep `\n` as literal backslash-n (not actual newlines)
- Format: `"-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"`

### Vercel deployment fails

**Cause:** Environment variables not set in Vercel

**Solution:**
- Vercel Dashboard → Project → Settings → Environment Variables
- Add all three Google Sheets variables
- Click "Save"
- Redeploy from Deployments tab

### Duplicate entries appearing

**Cause:** Unlikely - API checks for duplicates

**Solution:**
- Verify Google Sheet has only one sheet tab
- Check that email column is labeled exactly "email" (lowercase)

---

## Security Best Practices

✅ **DO:**
- Keep service account JSON file secure (never commit to git)
- Use environment variables for all sensitive data
- Share sheet only with service account email
- Regularly review sheet permissions
- Use `NEWSLETTER_EXPORT_TOKEN` for production export endpoint

❌ **DON'T:**
- Commit credentials JSON to repository
- Make Google Sheet publicly accessible
- Share service account credentials
- Use same service account across multiple projects

---

## Google Sheets API Limits

**Free quota:**
- 300 requests per minute per project
- 60 requests per minute per user

**For newsletter signup:**
- Each subscription = 1-2 API calls
- Easily handles high traffic
- Well within free limits

**If you exceed limits:**
- Implement client-side rate limiting
- Use caching for duplicate checks
- Request quota increase (usually not needed)

---

## Performance Optimization

### Current Implementation
- Loads all rows to check duplicates
- Fine for < 10,000 subscribers
- Response time: ~1-2 seconds

### If you have 10,000+ subscribers:

**Option 1: Use Sheet Query**
```typescript
// Instead of loading all rows, query for specific email
const rows = await sheet.getRows({
  offset: 0,
  limit: 1,
  // Note: google-spreadsheet doesn't support WHERE clauses
  // You'd need to use googleapis directly for this
});
```

**Option 2: Switch to Database**
- Use Supabase, PlanetScale, or Vercel Postgres
- Much faster for large datasets

---

## Migration Path

If you want to switch from Google Sheets to another solution:

### To Database (Supabase, etc.)
1. Export subscribers from Google Sheets
2. Import CSV to database
3. Update API endpoints to use database
4. Keep Google Sheet as backup

### To Newsletter Service (Mailchimp, etc.)
1. Export subscribers from Google Sheets
2. Import to newsletter service
3. Update form to post directly to their API
4. Archive Google Sheet

---

## Cost Analysis

**Google Sheets API:**
- ✅ Free for up to 300 requests/min
- ✅ No credit card required
- ✅ Unlimited storage (within Google Drive limits)

**Alternative Solutions:**
- Supabase: Free tier (500MB, 50K monthly active users)
- Mailchimp: Free up to 500 contacts
- ConvertKit: Free up to 1,000 subscribers
- Buttondown: Free up to 100 subscribers

**Recommendation:** Start with Google Sheets (free), migrate when you have 1,000+ subscribers.

---

## Support & Resources

**Documentation:**
- `GOOGLE_SHEETS_SETUP.md` - Detailed setup guide
- `.env.example` - Environment variable template

**Troubleshooting:**
- Check Google Cloud Console for API errors
- View Vercel logs for deployment issues
- Inspect browser console for client errors

**External Resources:**
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [google-spreadsheet npm package](https://www.npmjs.com/package/google-spreadsheet)

---

## Next Steps

1. ✅ Complete Google Sheets setup (see `GOOGLE_SHEETS_SETUP.md`)
2. ✅ Configure environment variables
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. ✅ Test on production
6. 📊 Monitor subscriber growth
7. 📧 When ready, choose newsletter platform
8. 📤 Export subscribers and start sending campaigns!

---

**Setup complete!** Your newsletter is now collecting emails in Google Sheets and works perfectly on Vercel with zero file system limitations.
