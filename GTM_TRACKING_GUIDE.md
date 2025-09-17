# GTM Additional Tracking Setup Guide

This guide covers setting up scroll depth, email clicks, and chat interaction tracking in Google Tag Manager.

## 1. Scroll Depth Tracking

### Enable Built-in Variables
1. Go to **Variables** → **Configure**
2. Under **Scrolling**, enable:
   - ✅ Scroll Depth Threshold
   - ✅ Scroll Depth Units
   - ✅ Scroll Direction

### Create Scroll Depth Trigger
1. **Triggers** → **New**
2. **Name**: "Scroll Depth - 25%, 50%, 75%, 90%"
3. **Trigger Type**: Scroll Depth
4. **Vertical Scroll Depths**: 
   - Check: Percentages
   - Values: `25,50,75,90`
5. **Enable this trigger on**: All Pages

### Create GA4 Scroll Tracking Tag
1. **Tags** → **New**
2. **Name**: "GA4 - Scroll Tracking"
3. **Tag Type**: Google Analytics: GA4 Event
4. **Configuration Tag**: [Your GA4 Config]
5. **Event Name**: `scroll`
6. **Event Parameters**:
   - Parameter Name: `percent_scrolled`
   - Value: `{{Scroll Depth Threshold}}`
7. **Trigger**: Scroll Depth - 25%, 50%, 75%, 90%

## 2. Email Link Click Tracking

### Create Email Click Trigger
1. **Triggers** → **New**
2. **Name**: "Email Link Clicks"
3. **Trigger Type**: Click - Just Links
4. **Enable when**: Page URL → matches RegEx → `.*`
5. **This trigger fires on**: Some Link Clicks
6. **Fire when**: Click URL → starts with → `mailto:`

### Create GA4 Email Click Tag
1. **Tags** → **New**
2. **Name**: "GA4 - Email Click"
3. **Tag Type**: Google Analytics: GA4 Event
4. **Configuration Tag**: [Your GA4 Config]
5. **Event Name**: `email_click`
6. **Event Parameters**:
   - Parameter Name: `link_url`
   - Value: `{{Click URL}}`
   - Parameter Name: `link_text`
   - Value: `{{Click Text}}`
7. **Trigger**: Email Link Clicks

### (Optional) Create Email Click Conversion Tag
1. **Tags** → **New**
2. **Name**: "Google Ads - Email Click Conversion"
3. **Tag Type**: Google Ads Conversion Tracking
4. **Conversion ID**: `AW-17548601361`
5. **Conversion Label**: [Create new label in Google Ads]
6. **Trigger**: Email Link Clicks

## 3. Chat Widget Interaction Tracking

### Implementation Details
The code has been updated to push events to dataLayer:
- `chat_opened` event with `chat_method` parameter
- Methods: `button_click` or `widget_bubble`

### Create Chat Opened Trigger
1. **Triggers** → **New**
2. **Name**: "Chat Opened"
3. **Trigger Type**: Custom Event
4. **Event name**: `chat_opened`
5. **Use regex matching**: No

### Create Data Layer Variable for Chat Method
1. **Variables** → **New**
2. **Name**: "DLV - Chat Method"
3. **Variable Type**: Data Layer Variable
4. **Data Layer Variable Name**: `chat_method`

### Create GA4 Chat Interaction Tag
1. **Tags** → **New**
2. **Name**: "GA4 - Chat Opened"
3. **Tag Type**: Google Analytics: GA4 Event
4. **Configuration Tag**: [Your GA4 Config]
5. **Event Name**: `chat_open`
6. **Event Parameters**:
   - Parameter Name: `method`
   - Value: `{{DLV - Chat Method}}`
7. **Trigger**: Chat Opened

### (Optional) Create Chat Conversion Tag
For high-value chat interactions:
1. **Tags** → **New**
2. **Name**: "Google Ads - Chat Interaction"
3. **Tag Type**: Google Ads Conversion Tracking
4. **Conversion ID**: `AW-17548601361`
5. **Conversion Label**: [Create new label in Google Ads]
6. **Trigger**: Chat Opened

## Testing Your Setup

### Test Scroll Tracking
1. Open GTM Preview Mode
2. Navigate to your site
3. Scroll down the page
4. Verify events fire at 25%, 50%, 75%, 90%

### Test Email Clicks
1. Click the email link on Contact page
2. Verify `email_click` event fires
3. Check that email address is captured

### Test Chat Opens
1. Click "Start Live Chat" button
2. Verify `chat_opened` event with `method: button_click`
3. Close chat and click the floating bubble
4. Verify `chat_opened` event with `method: widget_bubble`

## Debugging Tips

### Check DataLayer
```javascript
// See all events
console.log(dataLayer);

// Filter for specific events
dataLayer.filter(item => item.event === 'chat_opened');
```

### Common Issues
1. **Scroll not tracking**: Ensure scroll trigger is enabled on all pages
2. **Email clicks not tracking**: Check if mailto: links exist
3. **Chat not tracking**: Verify Chatwoot is loaded before testing

## Performance Notes
- Scroll tracking is throttled by GTM
- Email clicks are instant
- Chat tracking depends on Chatwoot loading (may be delayed on first page load)