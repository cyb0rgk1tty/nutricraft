# Google Sheets API Setup for Newsletter

This guide walks you through setting up Google Sheets as your newsletter subscriber database.

## Why Google Sheets?

✅ **Free** - No cost for reasonable usage
✅ **Works on Vercel** - No file system limitations
✅ **Easy to view** - Familiar spreadsheet interface
✅ **Easy to export** - Built-in CSV export
✅ **No database needed** - Simple setup

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** dropdown at the top
3. Click **"New Project"**
4. Enter project name: `Nutricraft Newsletter` (or any name)
5. Click **"Create"**
6. Wait for project creation (about 30 seconds)
7. Make sure your new project is selected in the dropdown

---

## Step 2: Enable Google Sheets API

1. In Google Cloud Console, go to **"APIs & Services"** > **"Library"**
   - Or visit: https://console.cloud.google.com/apis/library
2. Search for: `Google Sheets API`
3. Click on **"Google Sheets API"**
4. Click **"Enable"** button
5. Wait for API to be enabled (~10 seconds)

---

## Step 3: Create a Service Account

1. Go to **"APIs & Services"** > **"Credentials"**
   - Or visit: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"Service account"**
4. Fill in the form:
   - **Service account name**: `newsletter-service`
   - **Service account ID**: (auto-filled, leave as-is)
   - **Description**: `Service account for newsletter subscriptions`
5. Click **"Create and Continue"**
6. **Grant access** (Optional):
   - Skip this step, click **"Continue"**
7. **Grant users access** (Optional):
   - Skip this step, click **"Done"**

---

## Step 4: Create and Download Service Account Key

1. In **"Credentials"** page, find your service account under **"Service Accounts"**
2. Click on the service account email (looks like: `newsletter-service@your-project.iam.gserviceaccount.com`)
3. Go to **"Keys"** tab
4. Click **"Add Key"** > **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will download automatically
   - **IMPORTANT**: Keep this file secure! It contains credentials.
   - Filename: `your-project-xxxxx-yyyyyyy.json`

---

## Step 5: Extract Credentials from JSON

Open the downloaded JSON file and find these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "newsletter-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

You'll need:
- `client_email` → This becomes `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → This becomes `GOOGLE_PRIVATE_KEY`

**⚠️ IMPORTANT**: The `private_key` contains `\n` characters. Keep them as-is.

---

## Step 6: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it: `Newsletter Subscribers`
4. In the first row (headers), enter:
   - **A1**: `email`
   - **B1**: `subscribed_at`
   - **C1**: `source`
   - **D1**: `status`
5. Format the header row (optional):
   - Select row 1
   - Make it **bold**
   - Add background color
6. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   The ID is the long string between `/d/` and `/edit`

---

## Step 7: Share Sheet with Service Account

**This is critical!** The service account needs permission to access your sheet.

1. In your Google Sheet, click the **"Share"** button (top right)
2. Paste your service account email:
   - `newsletter-service@your-project.iam.gserviceaccount.com`
   - (Use the `client_email` from your JSON file)
3. Select role: **Editor**
4. **Uncheck** "Notify people"
5. Click **"Share"** or **"Send"**

Without this step, you'll get "Permission denied" errors!

---

## Step 8: Configure Environment Variables

Add these to your `.env` file:

```env
# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=newsletter-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_here
```

**Important Notes:**

1. **GOOGLE_PRIVATE_KEY**:
   - Must be wrapped in quotes
   - Keep the `\n` characters (they represent newlines)
   - Copy the entire value from the JSON file

2. **For Vercel Deployment**:
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all three variables
   - For `GOOGLE_PRIVATE_KEY`:
     - Paste the value WITH quotes
     - Make sure `\n` characters are preserved
   - Click "Save"

**Alternative format for GOOGLE_PRIVATE_KEY** (if you have issues):
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_MULTILINE_KEY_HERE
-----END PRIVATE KEY-----
"
```

---

## Step 9: Test Locally

1. Make sure `.env` is configured correctly
2. Start your dev server:
   ```bash
   npm run dev
   ```
3. Visit your site at `http://192.168.50.5:4321`
4. Scroll to footer and submit the newsletter form
5. Check your Google Sheet - you should see a new row!

---

## Step 10: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Google Sheets newsletter integration"
   git push
   ```

2. In Vercel Dashboard:
   - Go to **Settings** > **Environment Variables**
   - Add the three Google Sheets variables:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `GOOGLE_SHEET_ID`
   - Click **"Save"**

3. Redeploy:
   - Vercel will auto-deploy on push, OR
   - Go to **Deployments** and click **"Redeploy"**

4. Test on production:
   - Visit your live site
   - Try the newsletter signup
   - Check Google Sheet for new entry

---

## Troubleshooting

### Error: "The caller does not have permission"

**Solution**: Share your Google Sheet with the service account email
- Go to Sheet → Share button
- Add service account email as Editor

### Error: "Invalid grant: account not found"

**Solution**: Check your `GOOGLE_SERVICE_ACCOUNT_EMAIL` is correct
- It should match `client_email` from JSON file
- Format: `name@project-id.iam.gserviceaccount.com`

### Error: "Invalid key format"

**Solution**: Check your `GOOGLE_PRIVATE_KEY` formatting
- Must include quotes around the value
- Must include `\n` characters
- Must start with `-----BEGIN PRIVATE KEY-----`
- Must end with `-----END PRIVATE KEY-----`

### Error: "Spreadsheet not found"

**Solution**: Check your `GOOGLE_SHEET_ID`
- Copy from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- Should be a long alphanumeric string

### Vercel deployment works but can't write to sheet

**Solution**: Environment variables not set correctly
- Double-check all three variables in Vercel Dashboard
- Make sure you saved them
- Try redeploying after saving

### Private key not recognized in Vercel

**Solution**: Try this format for `GOOGLE_PRIVATE_KEY` in Vercel:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n
```
The `\n` should be literal backslash-n, NOT actual newlines.

---

## Security Best Practices

✅ **DO**:
- Keep JSON credentials file secure and never commit to git
- Use environment variables for all sensitive data
- Share sheet only with service account (not public)
- Regularly rotate service account keys (every 90 days)

❌ **DON'T**:
- Commit credentials JSON file to repository
- Share service account email publicly
- Give service account more permissions than needed
- Use same service account for multiple projects

---

## Viewing Your Subscribers

### Option 1: Google Sheets UI
- Open your Google Sheet
- All subscribers are visible in real-time
- Use built-in filters, sorting, charts

### Option 2: API Export Endpoint
```bash
curl "https://nutricraftlabs.com/api/newsletter-export?token=YOUR_TOKEN" -o subscribers.csv
```

### Option 3: Google Sheets Download
- File → Download → CSV or Excel

---

## Cost

Google Sheets API is **free** for most use cases:
- **Free quota**: 300 requests per minute per project
- **Free quota**: 60 requests per minute per user

For a newsletter signup form, this is more than sufficient. Even at high traffic, you won't exceed these limits.

---

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Test locally
3. ✅ Deploy to Vercel with environment variables
4. ✅ Test on production
5. 📊 Monitor subscriber growth
6. 📧 When ready, export subscribers and set up newsletter campaigns

---

## Support

If you encounter issues:
1. Check this troubleshooting section
2. Verify all environment variables are correct
3. Check Google Cloud Console for API quotas/errors
4. View server logs in Vercel Dashboard

---

**Setup complete!** Your newsletter is now collecting emails in Google Sheets and works perfectly on Vercel.
