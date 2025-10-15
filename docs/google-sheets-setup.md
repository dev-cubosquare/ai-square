# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for form submissions.

## Overview

The form system supports multiple form types distinguished by an `action` parameter:
- `contact` - Contact form submissions
- `newsletter` - Newsletter subscriptions
- `demo_request` - Demo requests

Each form type is saved to a separate sheet in your Google Spreadsheet.

## Setup Steps

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "AI Square Forms"
4. The sheets for each form will be created automatically on first submission

### 2. Set Up Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-apps-script.js` from this folder
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon) and name your project (e.g., "AI Square Forms Handler")

### 3. Test the Script

Before deploying, test that everything works:

1. In the Apps Script editor, select a test function from the dropdown (e.g., `runAllTests`)
2. Click **Run** (▶️ icon)
3. The first time you run it, you'll need to authorize the script:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** > **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
4. Check the **Execution log** (View > Logs) to see test results
5. Go back to your spreadsheet and verify that test data was added to the sheets

### 4. Deploy as Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the settings icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Production v1" (or whatever you prefer)
   - **Execute as**: **Me** (your-email@gmail.com)
   - **Who has access**: **Anyone** (required for public forms)
5. Click **Deploy**
6. Copy the **Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
7. Click **Done**

### 5. Configure Environment Variable

1. In your project root, create a `.env` file if it doesn't exist:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Apps Script Web App URL:
   ```env
   PUBLIC_GOOGLE_SHEET_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 6. Test the Integration

#### Option 1: Test via Browser
1. Go to your contact page
2. Fill out and submit the form
3. Check your Google Sheet for the new entry

#### Option 2: Test via cURL
```bash
# Test through proxy (same as production)
curl -X POST "https://proxy.zarrx.com/?url=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2FYOUR_DEPLOYMENT_ID%2Fexec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "contact",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Company",
    "subject": "Test Subject",
    "message": "This is a test message",
    "timestamp": "2025-01-15T10:00:00.000Z"
  }'
```

## Supported Form Types

### Contact Form (`action: 'contact'`)
**Required fields:**
- `firstName` - First name
- `lastName` - Last name
- `email` - Email address
- `subject` - Subject line
- `message` - Message content

**Optional fields:**
- `company` - Company name
- `timestamp` - ISO timestamp (auto-generated if not provided)

**Sheet columns:**
- Timestamp
- First Name
- Last Name
- Email
- Company
- Subject
- Message
- Status (always "New")

### Newsletter Form (`action: 'newsletter'`)
**Required fields:**
- `email` - Email address

**Optional fields:**
- `name` - Subscriber name
- `source` - Source of subscription (e.g., "Homepage", "Blog")
- `timestamp` - ISO timestamp

**Sheet columns:**
- Timestamp
- Email
- Name
- Status (always "Subscribed")
- Source

**Special features:**
- Duplicate email detection
- Email validation

### Demo Request Form (`action: 'demo_request'`)
**Fields:**
- `name` - Full name
- `email` - Email address
- `company` - Company name (optional)
- `phone` - Phone number (optional)
- `productInterest` - Product of interest (optional)
- `message` - Additional message (optional)
- `timestamp` - ISO timestamp

**Sheet columns:**
- Timestamp
- Name
- Email
- Company
- Phone
- Product Interest
- Message
- Status (always "Pending")

## Adding New Form Types

To add a new form type:

1. **Update `SHEET_CONFIG` in google-apps-script.js:**
   ```javascript
   const SHEET_CONFIG = {
     'contact': 'ContactForm',
     'newsletter': 'NewsletterForm',
     'demo_request': 'DemoRequestForm',
     'your_new_form': 'YourNewFormSheet', // Add this
   };
   ```

2. **Create a handler function:**
   ```javascript
   function handleYourNewForm(data, sheetName) {
     const sheet = getOrCreateSheet(sheetName);

     // Define headers
     const headers = ['Timestamp', 'Field1', 'Field2', ...];

     // Initialize headers if empty
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(headers);
       formatHeaderRow(sheet);
     }

     // Validate required fields
     if (!data.field1) {
       throw new Error('Missing required field: field1');
     }

     // Append data
     const row = [
       data.timestamp || new Date().toISOString(),
       data.field1,
       data.field2,
       // ... more fields
     ];

     sheet.appendRow(row);
     sheet.autoResizeColumns(1, headers.length);

     return {
       message: 'Form submitted successfully',
       action: 'your_new_form',
       rowNumber: sheet.getLastRow()
     };
   }
   ```

3. **Add to the switch statement in `doPost`:**
   ```javascript
   case 'your_new_form':
     result = handleYourNewForm(data, sheetName);
     break;
   ```

4. **Create a test function:**
   ```javascript
   function testYourNewForm() {
     const testData = {
       action: 'your_new_form',
       field1: 'test value',
       // ... more test data
     };

     try {
       const result = handleYourNewForm(testData, SHEET_CONFIG['your_new_form']);
       Logger.log('✅ Your New Form Test Passed');
       Logger.log(JSON.stringify(result, null, 2));
       return result;
     } catch (error) {
       Logger.log('❌ Your New Form Test Failed: ' + error.toString());
       throw error;
     }
   }
   ```

5. **Deploy the updated script:**
   - In Apps Script: **Deploy > Manage deployments**
   - Click ✏️ (edit) on your deployment
   - Set **New version**
   - Click **Deploy**

## Troubleshooting

### Forms not submitting
1. Check browser console for errors
2. Verify `PUBLIC_GOOGLE_SHEET_URL` is set correctly in `.env`
3. Ensure dev server was restarted after changing `.env`
4. Test the Google Apps Script URL directly

### Apps Script errors
1. Check **Executions** in Apps Script editor for error logs
2. Run test functions to identify issues
3. Verify all required fields are being sent

### CORS issues
- The proxy (`https://proxy.zarrx.com`) handles CORS
- If you're not using the proxy, you'll need to handle CORS in your backend

### Data not appearing in sheets
1. Check Apps Script execution log for errors
2. Verify the `action` parameter matches your `SHEET_CONFIG`
3. Test using the test functions in Apps Script editor

## Security Considerations

1. **Input Validation**: The script validates required fields and email format
2. **Duplicate Prevention**: Newsletter form checks for duplicate emails
3. **Access Control**: Deployed as "Anyone" but only accepts POST requests
4. **Data Privacy**: Data is stored in your personal Google Sheet
5. **Proxy Usage**: Using `proxy.zarrx.com` - ensure you trust this service

## Monitoring

Monitor your form submissions by:

1. **Google Sheet**: Check for new rows in real-time
2. **Apps Script Executions**: View > Executions to see all script runs
3. **Email Notifications**: Set up Google Sheets notifications (Tools > Notification rules)

## Backup

To backup your form data:

1. **Export as CSV**: File > Download > Comma-separated values
2. **Copy to Another Sheet**: Right-click sheet tab > Copy to > Existing spreadsheet
3. **Google Takeout**: Include Drive data in your Google Takeout

## Next Steps

1. Set up email notifications in Google Sheets
2. Create a dashboard to visualize form submissions
3. Add data validation rules to sheet columns
4. Set up automated responses using Gmail integration
5. Implement webhook notifications to your backend

## Support

For issues with:
- **Google Apps Script**: Check the [Apps Script documentation](https://developers.google.com/apps-script)
- **This integration**: Review execution logs in Apps Script editor
- **Proxy service**: Contact the proxy service provider

## License

This integration script is part of the AI Square project.
