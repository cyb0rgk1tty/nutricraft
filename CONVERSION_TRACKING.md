# Google Ads Conversion Tracking Documentation

This document outlines the Google Ads conversion tracking implementation for Nutricraft Labs.

## Overview

We track conversions through Google Tag Manager (GTM) using dataLayer events. There are two main conversion actions:

1. **Contact Form Submission** - When users submit the contact form
2. **Calendar Booking** - When users book a discovery call through cal.com

## Conversion IDs

- **Google Ads Account ID**: `AW-17548601361`
- **Contact Form Conversion**: `AW-17548601361/0UvVCKjSmpgbEJHQ6a9B`
- **Calendar Booking Conversion**: `AW-17548601361/PLcGCKGKGboZwbEJHQ6a9B`

## Implementation Details

### DataLayer Events

The following events are pushed to the dataLayer:

1. **`contact_form_submission`**
   - Fired when contact form is successfully submitted
   - Contains: `conversion_id`, `value: 1.0`, `currency: CAD`
   - Location: `/src/pages/contact.astro`

2. **`calendar_booking`**
   - Fired when cal.com booking is confirmed
   - Contains: `conversion_id`, `value: 1.0`, `currency: CAD`
   - Location: `/src/layouts/BaseLayout.astro`

3. **`outbound_click`**
   - Tracks clicks on external links
   - Contains: `event_category: outbound`, `event_label: [URL]`
   - Location: `/src/components/Analytics.astro`

4. **`chat_opened`**
   - Tracks when chat widget is opened
   - Contains: `chat_method: button_click` or `widget_bubble`
   - Locations: `/src/pages/contact.astro`, `/src/components/ChatSupport.astro`

### Contact Form Tracking

**Location**: `/src/pages/contact.astro`

- Uses custom `gtag_report_conversion` function
- Pushes `contact_form_submission` event to dataLayer
- Only fires after successful API response (result.success === true)
- Includes conversion ID and value for Google Ads tracking

### Calendar Booking Tracking

**Location**: `/src/layouts/BaseLayout.astro`

- Global `window.gtag_report_conversion` function
- Listens for Cal.com `bookingSuccessful` event
- Works for both popup and inline calendar embeds
- Pushes single event per booking

## GTM Configuration Required

### Triggers

1. **Contact Form Conversion Trigger**
   - Trigger Type: Custom Event
   - Event name: `contact_form_submission`

2. **Calendar Booking Trigger**
   - Trigger Type: Custom Event
   - Event name: `calendar_booking`

3. **Outbound Click Trigger** (for GA4)
   - Trigger Type: Custom Event
   - Event name: `outbound_click`

4. **Chat Opened Trigger** (optional)
   - Trigger Type: Custom Event
   - Event name: `chat_opened`

### Tags

1. **Google Ads Conversion - Contact Form**
   - Tag Type: Google Ads Conversion Tracking
   - Conversion ID: `AW-17548601361`
   - Conversion Label: `0UvVCKjSmpgbEJHQ6a9B`
   - Conversion Value: 1.0
   - Currency Code: CAD
   - Trigger: Contact Form Conversion Trigger

2. **Google Ads Conversion - Calendar Booking**
   - Tag Type: Google Ads Conversion Tracking
   - Conversion ID: `AW-17548601361`
   - Conversion Label: `PLcGCKGKGboZwbEJHQ6a9B`
   - Conversion Value: 1.0
   - Currency Code: CAD
   - Trigger: Calendar Booking Trigger

## Testing

### Using Browser Console

```javascript
// View all dataLayer events
dataLayer.map(item => item.event).filter(Boolean)

// Check specific conversion events
dataLayer.filter(item => item.event === 'contact_form_submission')
dataLayer.filter(item => item.event === 'calendar_booking')
```

### GTM Preview Mode
1. Open GTM and click "Preview"
2. Navigate to your site
3. Perform actions (submit form, book calendar)
4. Check that events appear in preview panel
5. Verify tags fire correctly

### Expected Results
- Contact form submission: 1 `contact_form_submission` event
- Calendar booking: 1 `calendar_booking` event
- No duplicate events

## Notes

- All tracking flows through GTM (Container ID: `GTM-KDM7H2RL`)
- No direct gtag.js implementation - everything uses dataLayer
- Both conversions track with value 1.0 CAD
- Events only fire after successful user actions
- No personal data is sent with conversion events