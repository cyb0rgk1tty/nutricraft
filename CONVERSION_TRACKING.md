# Google Ads Conversion Tracking Documentation

This document outlines the Google Ads conversion tracking implementation for Nutricraft Labs.

## Overview

We track two main conversion actions:
1. **Contact Form Submission** - When users submit the contact form
2. **Calendar Booking** - When users book a discovery call through cal.com

## Conversion IDs

- **Google Ads Account ID**: `AW-17548601361`
- **Contact Form Conversion**: `AW-17548601361/0UvVCKjSmpgbEJHQ6a9B`
- **Calendar Booking Conversion**: `AW-17548601361/PLcGCKGKGboZwbEJHQ6a9B`

## Implementation Details

### Contact Form Tracking

**Location**: `/src/pages/contact.astro` (lines 185-198, 224-225)

- Fires when the contact form is successfully submitted
- Tracks with a value of 1.0 CAD
- Only fires after successful API response

### Calendar Booking Tracking

**Locations**:
1. **Global Function**: `/src/layouts/BaseLayout.astro` (lines 229-246)
   - Defines the `gtag_report_conversion` function globally
   
2. **Popup Calendar Tracking**: `/src/layouts/BaseLayout.astro` (lines 299-307, 322-330)
   - Tracks bookings from calendar buttons on index and contact pages
   - Listens for `bookingSuccessful` event from cal.com popup embeds

3. **Inline Calendar Tracking**: `/src/pages/schedule-call.astro` (lines 161-171)
   - Tracks bookings from the embedded calendar on the /schedule-call page
   - Listens for `bookingSuccessful` event from cal.com inline embed

## How It Works

1. User completes a booking in cal.com (either popup or inline)
2. Cal.com fires the `bookingSuccessful` event
3. Our event listener catches this event
4. `gtag_report_conversion()` is called
5. Google Ads records the conversion with value 1.0 CAD

## Testing

To verify tracking is working:
1. Open browser developer console
2. Complete a test booking
3. Look for console log: "Booking successful (popup/inline): {details}"
4. Check Network tab for Google Analytics/Ads requests

## Notes

- Both conversions use the same currency (CAD) and value (1.0)
- The tracking respects user privacy and only fires after explicit user action
- No personal data is sent with the conversion events