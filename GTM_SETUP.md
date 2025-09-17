# Google Tag Manager Setup Guide

This guide documents the Google Tag Manager (GTM) configuration for Nutricraft Labs.

## Container Information

- **Container ID**: `GTM-KDM7H2RL`
- **Container Name**: Nutricraft Labs

## Implementation

GTM is implemented in `/src/layouts/BaseLayout.astro`:
- GTM script in `<head>` (lines 34-42)
- GTM noscript in `<body>` (lines 237-240)
- DataLayer initialization (lines 33-37)

## Required GTM Configuration

### 1. Variables

Enable these Built-in Variables:
- ✅ Event
- ✅ Page URL
- ✅ Page Path
- ✅ Click URL
- ✅ Click Element

### 2. Triggers

Create these custom event triggers:

#### Contact Form Submission Trigger
- **Trigger Type**: Custom Event
- **Event name**: `contact_form_submission`
- **Use regex matching**: No

#### Calendar Booking Trigger
- **Trigger Type**: Custom Event
- **Event name**: `calendar_booking`
- **Use regex matching**: No

#### Form Submit Trigger (GA4)
- **Trigger Type**: Custom Event
- **Event name**: `form_submit`
- **Use regex matching**: No

#### Outbound Link Click Trigger
- **Trigger Type**: Custom Event
- **Event name**: `outbound_click`
- **Use regex matching**: No

### 3. Tags

#### Google Analytics GA4 Configuration
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: `[Your GA4 Measurement ID]`
- **Trigger**: All Pages

#### GA4 Event - Form Submit
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `form_submit`
- **Event Parameters**:
  - `event_category`: `{{Data Layer Variable - event_category}}`
  - `event_label`: `{{Data Layer Variable - event_label}}`
- **Trigger**: Form Submit Trigger

#### GA4 Event - Outbound Click
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `click`
- **Event Parameters**:
  - `event_category`: `{{Data Layer Variable - event_category}}`
  - `event_label`: `{{Data Layer Variable - event_label}}`
- **Trigger**: Outbound Link Click Trigger

#### Google Ads Conversion - Contact Form
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: `AW-17548601361`
- **Conversion Label**: `0UvVCKjSmpgbEJHQ6a9B`
- **Conversion Value**: `1.0`
- **Conversion Currency**: `CAD`
- **Trigger**: Contact Form Submission Trigger

#### Google Ads Conversion - Calendar Booking
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: `AW-17548601361`
- **Conversion Label**: `PLcGCKGKGboZwbEJHQ6a9B`
- **Conversion Value**: `1.0`
- **Conversion Currency**: `CAD`
- **Trigger**: Calendar Booking Trigger

### 4. Data Layer Variables (Optional)

If the event parameters aren't automatically available, create these Data Layer Variables:

#### event_category Variable
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `event_category`

#### event_label Variable
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `event_label`

#### conversion_id Variable
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `conversion_id`

## Testing

### Using GTM Preview Mode
1. Click "Preview" in GTM
2. Enter your website URL
3. Navigate through the site and perform actions
4. Check that events fire correctly in the preview panel

### Testing Specific Events

#### Contact Form Submission
1. Fill out and submit the contact form
2. Verify `contact_form_submission` event fires
3. Check that Google Ads conversion tag fires

#### Calendar Booking
1. Book a calendar appointment
2. Verify `calendar_booking` event fires
3. Check that Google Ads conversion tag fires

#### Form Tracking (GA4)
1. Submit any form
2. Verify `form_submit` event fires
3. Check GA4 event tag fires

### Console Testing
```javascript
// View all dataLayer events
console.log(dataLayer);

// Test push an event manually
dataLayer.push({
  'event': 'test_event',
  'test_parameter': 'test_value'
});
```

## Debugging Tips

1. **Events not firing?**
   - Check browser console for JavaScript errors
   - Verify dataLayer is initialized before GTM
   - Ensure events are pushed after DOM is ready

2. **Tags not firing?**
   - Check trigger configuration matches event names exactly
   - Verify no trigger exceptions are blocking
   - Use GTM Preview mode to debug

3. **Missing data?**
   - Create Data Layer Variables for custom parameters
   - Check variable names match exactly
   - Ensure data is pushed with the event

## Security Notes

- CSP headers are configured to allow GTM in:
  - `/vercel.json`
  - `/public/_headers`
  - `/src/middleware.js`
- GTM iframe is allowed in frame-src
- Scripts from googletagmanager.com are allowed