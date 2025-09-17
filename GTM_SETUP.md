# Google Tag Manager Setup Guide

This guide documents the Google Tag Manager (GTM) configuration for Nutricraft Labs.

## Container Information

- **Container ID**: `GTM-KDM7H2RL`
- **Container Name**: Nutricraft Labs

## Implementation

GTM is implemented in `/src/layouts/BaseLayout.astro`:
- DataLayer initialization (line 35)
- GTM script in `<head>` (lines 38-42)
- GTM noscript in `<body>` (lines 237-240)

## Current Tracking Events

The following events are pushed to dataLayer:

1. **`contact_form_submission`** - Contact form conversions
2. **`calendar_booking`** - Calendar appointment conversions  
3. **`outbound_click`** - External link clicks
4. **`chat_opened`** - Chat widget interactions

## Required GTM Configuration

### 1. Variables

#### Built-in Variables to Enable:
- ✅ Event
- ✅ Page URL
- ✅ Page Path  
- ✅ Click URL
- ✅ Click Element

#### Data Layer Variables to Create:

**DLV - Chat Method**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `chat_method`

**DLV - Event Category** 
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `event_category`

**DLV - Event Label**
- Variable Type: Data Layer Variable  
- Data Layer Variable Name: `event_label`

### 2. Triggers

#### Contact Form Conversion Trigger
- **Trigger Type**: Custom Event
- **Event name**: `contact_form_submission`
- **Use regex matching**: No

#### Calendar Booking Trigger
- **Trigger Type**: Custom Event
- **Event name**: `calendar_booking`
- **Use regex matching**: No

#### Outbound Link Click Trigger
- **Trigger Type**: Custom Event
- **Event name**: `outbound_click`
- **Use regex matching**: No

#### Chat Opened Trigger (Optional)
- **Trigger Type**: Custom Event
- **Event name**: `chat_opened`
- **Use regex matching**: No

### 3. Tags

#### Google Analytics GA4 Configuration
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: `[Your GA4 Measurement ID]`
- **Trigger**: All Pages

#### GA4 Event - Outbound Click
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `click`
- **Event Parameters**:
  - `event_category`: `{{DLV - Event Category}}`
  - `event_label`: `{{DLV - Event Label}}`
- **Trigger**: Outbound Link Click Trigger

#### GA4 Event - Chat Interaction (Optional)
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `chat_open`
- **Event Parameters**:
  - `method`: `{{DLV - Chat Method}}`
- **Trigger**: Chat Opened Trigger

#### Google Ads Conversion - Contact Form
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: `AW-17548601361`
- **Conversion Label**: `0UvVCKjSmpgbEJHQ6a9B`
- **Conversion Value**: `1.0`
- **Conversion Currency**: `CAD`
- **Trigger**: Contact Form Conversion Trigger

#### Google Ads Conversion - Calendar Booking
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: `AW-17548601361`
- **Conversion Label**: `PLcGCKGKGboZwbEJHQ6a9B`
- **Conversion Value**: `1.0`
- **Conversion Currency**: `CAD`
- **Trigger**: Calendar Booking Trigger

## Testing

### Using GTM Preview Mode
1. Click "Preview" in GTM
2. Enter your website URL
3. Navigate through the site and perform actions:
   - Submit contact form
   - Book calendar appointment
   - Click external links
   - Open chat widget
4. Verify events appear in preview panel
5. Check that appropriate tags fire

### Console Testing
```javascript
// View all dataLayer events
dataLayer.map(item => item.event).filter(Boolean)

// Test specific events
dataLayer.filter(item => item.event === 'contact_form_submission')
dataLayer.filter(item => item.event === 'calendar_booking')
dataLayer.filter(item => item.event === 'outbound_click')
dataLayer.filter(item => item.event === 'chat_opened')
```

## Debugging Tips

### Events Not Firing?
1. Check browser console for JavaScript errors
2. Verify dataLayer exists: `typeof dataLayer`
3. Ensure GTM container is loading (check Network tab)
4. Clear cache and try incognito mode

### Tags Not Firing?
1. Check trigger configuration matches event names exactly
2. Verify no trigger exceptions are set
3. Use GTM Debug mode to see why tags aren't firing
4. Check tag sequencing and dependencies

### Conversions Not Tracking?
1. Verify conversion IDs match your Google Ads account
2. Check that conversion actions exist in Google Ads
3. Allow 24-48 hours for data to appear
4. Test with Google Ads Tag Assistant

## Security Configuration

CSP headers are configured to allow GTM in:
- `/vercel.json`
- `/public/_headers`  
- `/src/middleware.js`

Required CSP allowances:
- `script-src`: googletagmanager.com, google-analytics.com, googleadservices.com
- `connect-src`: googletagmanager.com, google.com, google-analytics.com
- `frame-src`: googletagmanager.com
- `style-src`: googletagmanager.com