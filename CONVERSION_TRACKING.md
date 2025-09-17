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

2. **`calendar_booking`**
   - Fired when cal.com booking is confirmed
   - Contains: `conversion_id`, `value: 1.0`, `currency: CAD`

3. **`form_submit`**
   - Generic form tracking for GA4
   - Contains: `event_category: engagement`, `event_label: contact_form`

4. **`outbound_click`**
   - Tracks clicks on external links
   - Contains: `event_category: outbound`, `event_label: [URL]`

### Contact Form Tracking

**Location**: `/src/pages/contact.astro` (lines 185-198, 226-228)

- Uses custom `gtag_report_conversion` function
- Pushes `contact_form_submission` event to dataLayer
- Only fires after successful API response

### Calendar Booking Tracking

**Locations**:
1. **Global Function**: `/src/layouts/BaseLayout.astro` (lines 246-263)
   - Defines the `gtag_report_conversion` function globally
   - Pushes `calendar_booking` event to dataLayer
   
2. **Popup Calendar Tracking**: `/src/layouts/BaseLayout.astro`
   - Tracks bookings from calendar buttons on index and contact pages
   - Listens for `bookingSuccessful` event from cal.com popup embeds

3. **Inline Calendar Tracking**: `/src/pages/schedule-call.astro` (lines 161-171)
   - Tracks bookings from the embedded calendar on the /schedule-call page
   - Listens for `bookingSuccessful` event from cal.com inline embed

## GTM Configuration Required

### Triggers

1. **Contact Form Conversion Trigger**
   - Trigger Type: Custom Event
   - Event name: `contact_form_submission`

2. **Calendar Booking Trigger**
   - Trigger Type: Custom Event
   - Event name: `calendar_booking`

3. **Form Submit Trigger** (for GA4)
   - Trigger Type: Custom Event
   - Event name: `form_submit`

4. **Outbound Click Trigger** (for GA4)
   - Trigger Type: Custom Event
   - Event name: `outbound_click`

### Tags

1. **Google Ads Conversion - Contact Form**
   - Tag Type: Google Ads Conversion Tracking
   - Conversion ID: `AW-17548601361`
   - Conversion Label: `0UvVCKjSmpgbEJHQ6a9B`
   - Trigger: Contact Form Conversion Trigger

2. **Google Ads Conversion - Calendar Booking**
   - Tag Type: Google Ads Conversion Tracking
   - Conversion ID: `AW-17548601361`
   - Conversion Label: `PLcGCKGKGboZwbEJHQ6a9B`
   - Trigger: Calendar Booking Trigger

## Testing

To verify tracking is working:
1. Open browser developer console
2. Monitor Network tab for GTM requests
3. Use GTM Preview mode to see events firing
4. Check dataLayer in console: `console.log(dataLayer)`

For conversions:
- Contact form: Submit form and check for `contact_form_submission` event
- Calendar: Complete booking and check for `calendar_booking` event

## Notes

- All tracking now goes through GTM (Container ID: `GTM-KDM7H2RL`)
- No direct gtag.js implementation - everything uses dataLayer
- Both conversions use the same currency (CAD) and value (1.0)
- The tracking respects user privacy and only fires after explicit user action
- No personal data is sent with the conversion events