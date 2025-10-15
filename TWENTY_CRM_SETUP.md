# Twenty CRM Integration Setup

This guide walks you through integrating your contact form with Twenty CRM for automatic lead capture and management.

## Why Twenty CRM?

✅ **Open Source** - Full control and transparency
✅ **Modern Interface** - Beautiful, intuitive CRM experience
✅ **Self-Hosted or Cloud** - Deploy anywhere
✅ **GraphQL API** - Flexible, powerful API
✅ **Automatic Lead Capture** - Forms sync directly to CRM
✅ **Contact Management** - Centralized customer data

---

## Prerequisites

Before starting, you need:
- A Twenty CRM instance (self-hosted or cloud)
- Admin access to your Twenty workspace
- Contact form already working (with email notifications)

---

## Step 1: Access Your Twenty CRM Instance

1. Navigate to your Twenty CRM instance
   - Cloud: `https://your-workspace.twenty.com`
   - Self-hosted: Your custom domain (e.g., `https://crm.tangleapps.vip`)
2. Log in with your admin account
3. Make sure you can access the **Settings** menu

---

## Step 2: Generate API Key

1. In Twenty CRM, go to **Settings** (gear icon in top right)
2. Click on **Developers** in the left sidebar
3. Click **"+ Create API Key"** or **"Generate API Key"**
4. Give your API key a descriptive name:
   - Example: `Contact Form Integration` or `Website Form`
5. Click **"Create"** or **"Generate"**
6. **Copy the API key immediately** - you won't be able to see it again!
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
7. Store it securely (you'll add it to `.env` in the next step)

---

## Step 3: Identify Your API Endpoint

Your GraphQL API endpoint follows this pattern:

### For Cloud Instances:
```
https://your-workspace.twenty.com/graphql
```

### For Self-Hosted Instances:
```
https://your-domain.com/graphql
```

**Example**: If your CRM is at `https://crm.tangleapps.vip`, your API endpoint is:
```
https://crm.tangleapps.vip/graphql
```

---

## Step 4: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Twenty CRM Configuration
TWENTY_API_URL=https://your-workspace.twenty.com/graphql
TWENTY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**

1. **TWENTY_API_URL**:
   - Must end with `/graphql`
   - Use `https://` (not `http://`)
   - No trailing slash after `graphql`

2. **TWENTY_API_KEY**:
   - Copy the entire JWT token
   - No quotes needed (unless value contains spaces)
   - Keep this secret - never commit to git!

---

## Step 5: Verify Person Object Exists

The integration creates records in the **Person** object in Twenty CRM. This is a standard object and should exist by default.

To verify:
1. In Twenty CRM, click on **People** in the left sidebar
2. You should see a list view with columns like:
   - Name
   - Email (or Emails)
   - Phone (or Phones)
   - Company (optional relationship field)

If you don't see the People section, contact your Twenty CRM administrator.

---

## Step 6: Test Locally

1. Make sure `.env` is configured correctly with both variables
2. Restart your dev server if it's already running:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
3. Visit your contact form at `http://192.168.50.5:4321/contact`
4. Fill out and submit a test form
5. Check the terminal output for log messages:
   - **Success**: `Twenty CRM: Person created successfully: [ID]`
   - **Failure**: `Twenty CRM: Failed to create person: [error message]`
6. Check your Twenty CRM:
   - Go to **People** section
   - You should see a new person record with the test data
   - Name, email, and phone (if provided) should all be populated

---

## Step 7: Deploy to Production (Vercel)

1. **Important**: DO NOT commit `.env` file to git (it contains secrets)

2. Add environment variables in Vercel Dashboard:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add both variables:
     - `TWENTY_API_URL` = `https://your-workspace.twenty.com/graphql`
     - `TWENTY_API_KEY` = `your_api_key_here`
   - Select all environments (Production, Preview, Development)
   - Click **"Save"**

3. Redeploy your site:
   - Push your code changes to trigger auto-deployment, OR
   - Go to Deployments tab and click **"Redeploy"**

4. Test on production:
   - Visit your live site contact form
   - Submit a test entry
   - Check Twenty CRM for the new person record
   - Check Vercel logs for success/error messages

---

## How It Works

When someone submits your contact form:

1. **Email sent** (primary notification) ✅
2. **Person created in Twenty CRM** automatically with:
   - **Name** (split into firstName/lastName)
   - **Email** (stored in emails.primaryEmail)
   - **Phone** (stored in phones.primaryPhoneNumber, if provided)
3. **Additional lead data** captured in logs:
   - Company name
   - Target market
   - Order quantity
   - Project type
   - Message/inquiry details

The integration is **non-blocking**, meaning:
- If CRM fails, email still sends
- Form submission always succeeds
- CRM errors are logged but don't break the form

---

## Data Mapping

Here's how form fields map to Twenty CRM Person fields:

| Contact Form Field | Twenty CRM Field | Notes |
|-------------------|------------------|-------|
| Name | name.firstName<br>name.lastName | Automatically split |
| Email | emails.primaryEmail | Object structure with primaryEmail |
| Phone | phones.primaryPhoneNumber | Object structure with phone details |
| Company | *(not currently stored)* | Requires companyId relationship |
| Target Market | *(future: note)* | Currently logged |
| Order Quantity | *(future: note)* | Currently logged |
| Project Type | *(future: note)* | Currently logged |
| Message | *(future: note)* | Currently logged |

**Note**: Additional lead qualification data (target market, order quantity, project type, message) is captured in the system logs and can be attached as notes in future updates.

---

## Troubleshooting

### Error: "Twenty CRM: Missing API URL or API Key"

**Solution**: Environment variables not set
- Check `.env` file has both `TWENTY_API_URL` and `TWENTY_API_KEY`
- For Vercel: Check Environment Variables in dashboard
- Restart dev server after changing `.env`

---

### Error: "API returned status 401"

**Solution**: Invalid or expired API key
- Generate a new API key in Twenty CRM Settings → Developers
- Update `TWENTY_API_KEY` in `.env` and/or Vercel
- Make sure you copied the entire key (starts with `eyJ...`)

---

### Error: "API returned status 403" or "Forbidden"

**Solution**: API key doesn't have permission
- Check that the API key was generated correctly
- Verify your Twenty CRM user account has permission to create people
- Try generating a new API key

---

### Error: "Failed to fetch" or "Network error"

**Solution**: Check API URL
- Verify `TWENTY_API_URL` is correct
- Must end with `/graphql`
- Check that your Twenty CRM instance is accessible
- For self-hosted: ensure server is running

---

### Error: "GraphQL error: [some field error]"

**Solution**: Person object field mismatch
- Twenty CRM's Person object may have different field names
- Check Twenty CRM documentation for your version
- The integration uses:
  - `name.firstName`, `name.lastName` (name structure)
  - `emails.primaryEmail`, `emails.additionalEmails` (emails object)
  - `phones.primaryPhoneNumber`, `phones.primaryPhoneCountryCode` (phones object)

---

### Form submits but no person appears in CRM

**Solution**: Check server logs
- **Local dev**: Check terminal output for error messages
- **Vercel**: Go to Deployments → Functions → View logs
- Look for lines starting with `Twenty CRM:`
- The error message will indicate what went wrong

---

### Person created but missing some fields

**Solution**: Optional fields
- Phone is optional - only saved if provided in form
- Company is not currently stored (requires companyId relationship)
- Check that form fields have the correct `name` attributes
- Verify field mapping in `/src/utils/twentyCrm.ts`

---

## Security Best Practices

✅ **DO**:
- Keep API key secret and never commit to git
- Use environment variables for all credentials
- Regularly rotate API keys (recommended every 90 days)
- Use HTTPS for your API endpoint
- Set appropriate permissions for API keys

❌ **DON'T**:
- Commit `.env` file to repository
- Share API keys in chat, email, or screenshots
- Use same API key across multiple environments
- Hardcode credentials in source code
- Make API key public in client-side code

---

## API Rate Limits

Twenty CRM has rate limits on API usage. For contact form submissions:
- **Typical limit**: 100 requests per minute (varies by instance)
- **Contact forms**: Well within limits (a few per minute at most)
- **High traffic**: Integration handles errors gracefully

If you hit rate limits, the form will still work (email sends), but CRM sync may be delayed.

---

## Testing Your Integration

### Test Checklist:

1. ✅ API key generated in Twenty CRM
2. ✅ Environment variables configured
3. ✅ Dev server restarted
4. ✅ Test form submitted locally
5. ✅ Person appears in Twenty CRM People section
6. ✅ All fields populated correctly (name, email, phone)
7. ✅ Console logs show success message
8. ✅ Environment variables added to Vercel
9. ✅ Production deployment successful
10. ✅ Test form submitted on live site
11. ✅ Person created in CRM from production

---

## Future Enhancements

Potential improvements to the integration:

1. **Company Support**: Auto-create/link Company records from company name field
2. **Notes/Activities**: Attach lead qualification data as notes
3. **Custom Fields**: Store target market, order quantity in custom fields
4. **Lead Scoring**: Calculate lead quality based on form data
5. **Webhooks**: Trigger workflows in Twenty when forms submitted
6. **Duplicate Detection**: Check for existing people before creating
7. **Lead Assignment**: Auto-assign to sales reps based on criteria
8. **Country Code Detection**: Auto-detect phone country codes from phone numbers

---

## Monitoring

To monitor your integration:

1. **Development**:
   - Watch terminal output for log messages
   - Look for `Twenty CRM: Person created successfully` or error messages

2. **Production (Vercel)**:
   - Go to Deployments → Functions → View logs
   - Filter for `Twenty CRM:` to see integration messages
   - Set up error monitoring (Sentry, LogRocket, etc.)

3. **Twenty CRM**:
   - Check People section regularly
   - Look for new entries from form submissions
   - Verify data quality and completeness

---

## Support

If you encounter issues:
1. Check this troubleshooting section
2. Review terminal/Vercel logs for error messages
3. Verify environment variables are set correctly
4. Test API endpoint manually using Postman or curl
5. Check Twenty CRM documentation: https://twenty.com/developers
6. Review source code: `src/utils/twentyCrm.ts` and `src/pages/api/contact.ts`

---

## Source Code Files

The integration consists of:

1. **Environment Config**: `.env` (not committed to git)
2. **CRM Utility**: `src/utils/twentyCrm.ts` (GraphQL API calls)
3. **API Endpoint**: `src/pages/api/contact.ts` (form handler with CRM integration)
4. **Example Config**: `.env.example` (template for environment variables)

---

**Setup complete!** Your contact form now automatically creates Person records in Twenty CRM while maintaining email notifications as the primary workflow.
