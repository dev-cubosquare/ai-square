/**
 * Google Apps Script for AI Square Forms
 *
 * This script handles multiple form submissions distinguished by the 'action' parameter.
 *
 * Setup Instructions:
 * 1. Create a Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire script
 * 4. Deploy as Web App (Deploy > New deployment)
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and add it to your .env file
 *
 * Sheet Structure:
 * - Create separate sheets for each form type (e.g., "ContactForm", "NewsletterForm")
 * - Headers will be added automatically on first submission
 */

// Configuration: Map actions to sheet names
const SHEET_CONFIG = {
  'ai-square-contact': 'ContactForm',
  // 'newsletter': 'NewsletterForm',
  // 'demo_request': 'DemoRequestForm',
  // Add more form types here as needed
};

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    // Parse the request body
    const data = JSON.parse(e.postData.contents);

    // Validate action parameter
    if (!data.action) {
      return createErrorResponse('Missing required parameter: action');
    }

    // Get the sheet name from configuration
    const sheetName = SHEET_CONFIG[data.action];
    if (!sheetName) {
      return createErrorResponse(`Unknown action: ${data.action}`);
    }

    // Route to appropriate handler
    let result;
    switch (data.action) {
      case 'ai-square-contact':
        result = handleContactForm(data, sheetName);
        break;
      // case 'newsletter':
      //   result = handleNewsletterForm(data, sheetName);
      //   break;
      // case 'demo_request':
      //   result = handleDemoRequestForm(data, sheetName);
      //   break;
      default:
        return createErrorResponse(`No handler for action: ${data.action}`);
    }

    return createSuccessResponse(result);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('Internal server error: ' + error.toString());
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'AI Square Forms API is running',
    version: '1.0',
    availableActions: Object.keys(SHEET_CONFIG),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler for contact form submissions
 */
function handleContactForm(data, sheetName) {
  const sheet = getOrCreateSheet(sheetName);

  // Define headers for contact form
  const headers = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Email',
    'Company',
    'Subject',
    'Message',
    'Status'
  ];

  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    formatHeaderRow(sheet);
  }

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Append data row
  const row = [
    data.timestamp || new Date().toISOString(),
    data.firstName,
    data.lastName,
    data.email,
    data.company || '',
    data.subject,
    data.message,
    'New'
  ];

  sheet.appendRow(row);

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);

  return {
    message: 'Contact form submitted successfully',
    action: 'contact',
    rowNumber: sheet.getLastRow()
  };
}

/**
 * Handler for newsletter form submissions
 */
function handleNewsletterForm(data, sheetName) {
  const sheet = getOrCreateSheet(sheetName);

  const headers = [
    'Timestamp',
    'Email',
    'Name',
    'Status',
    'Source'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    formatHeaderRow(sheet);
  }

  // Validate email
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Invalid email address');
  }

  // Check for duplicates
  const existingEmails = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  const isDuplicate = existingEmails.some(row => row[0] === data.email);

  if (isDuplicate) {
    return {
      message: 'Email already subscribed',
      action: 'newsletter',
      duplicate: true
    };
  }

  const row = [
    data.timestamp || new Date().toISOString(),
    data.email,
    data.name || '',
    'Subscribed',
    data.source || 'Website'
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, headers.length);

  return {
    message: 'Newsletter subscription successful',
    action: 'newsletter',
    rowNumber: sheet.getLastRow()
  };
}

/**
 * Handler for demo request form submissions
 */
function handleDemoRequestForm(data, sheetName) {
  const sheet = getOrCreateSheet(sheetName);

  const headers = [
    'Timestamp',
    'Name',
    'Email',
    'Company',
    'Phone',
    'Product Interest',
    'Message',
    'Status'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    formatHeaderRow(sheet);
  }

  const row = [
    data.timestamp || new Date().toISOString(),
    data.name,
    data.email,
    data.company || '',
    data.phone || '',
    data.productInterest || '',
    data.message || '',
    'Pending'
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, headers.length);

  return {
    message: 'Demo request submitted successfully',
    action: 'demo_request',
    rowNumber: sheet.getLastRow()
  };
}

/**
 * Get or create a sheet by name
 */
function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

/**
 * Format the header row
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create success response
 */
function createSuccessResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: data,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create error response
 */
function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: message,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// TEST FUNCTIONS
// Run these from the Apps Script editor to test functionality
// ============================================================================

/**
 * Test Contact Form Handler
 */
function testContactForm() {
  const testData = {
    action: 'ai-square-contact',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Test Company',
    subject: 'Test Subject',
    message: 'This is a test message from the Apps Script editor.',
    timestamp: new Date().toISOString()
  };

  try {
    const result = handleContactForm(testData, SHEET_CONFIG['ai-square-contact']);
    Logger.log('✅ Contact Form Test Passed');
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log('❌ Contact Form Test Failed: ' + error.toString());
    throw error;
  }
}

/**
 * Test Newsletter Form Handler
 */
function testNewsletterForm() {
  const testData = {
    action: 'newsletter',
    email: 'test' + Date.now() + '@example.com', // Unique email for testing
    name: 'Test User',
    source: 'Test',
    timestamp: new Date().toISOString()
  };

  try {
    const result = handleNewsletterForm(testData, SHEET_CONFIG['newsletter']);
    Logger.log('✅ Newsletter Form Test Passed');
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log('❌ Newsletter Form Test Failed: ' + error.toString());
    throw error;
  }
}

/**
 * Test Demo Request Form Handler
 */
function testDemoRequestForm() {
  const testData = {
    action: 'demo_request',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    company: 'Demo Corp',
    phone: '+1234567890',
    productInterest: 'AI Assistant',
    message: 'I would like to see a demo of your product.',
    timestamp: new Date().toISOString()
  };

  try {
    const result = handleDemoRequestForm(testData, SHEET_CONFIG['demo_request']);
    Logger.log('✅ Demo Request Form Test Passed');
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log('❌ Demo Request Form Test Failed: ' + error.toString());
    throw error;
  }
}

/**
 * Test doPost function (simulates HTTP POST request)
 */
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'ai-square-contact',
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        company: 'Test Inc',
        subject: 'Testing doPost',
        message: 'This tests the complete doPost flow.',
        timestamp: new Date().toISOString()
      })
    }
  };

  try {
    const response = doPost(mockEvent);
    const responseText = response.getContent();
    const responseData = JSON.parse(responseText);

    Logger.log('✅ doPost Test Passed');
    Logger.log(JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    Logger.log('❌ doPost Test Failed: ' + error.toString());
    throw error;
  }
}

/**
 * Test invalid action
 */
function testInvalidAction() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'invalid_action',
        someData: 'test'
      })
    }
  };

  try {
    const response = doPost(mockEvent);
    const responseText = response.getContent();
    const responseData = JSON.parse(responseText);

    if (responseData.status === 'error') {
      Logger.log('✅ Invalid Action Test Passed - Error handled correctly');
      Logger.log(JSON.stringify(responseData, null, 2));
    } else {
      Logger.log('❌ Invalid Action Test Failed - Should have returned error');
    }
    return responseData;
  } catch (error) {
    Logger.log('❌ Invalid Action Test Failed: ' + error.toString());
    throw error;
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log('==========================================');
  Logger.log('Running All Tests...');
  Logger.log('==========================================\n');

  try {
    testContactForm();
    Logger.log('');

    testNewsletterForm();
    Logger.log('');

    testDemoRequestForm();
    Logger.log('');

    testDoPost();
    Logger.log('');

    testInvalidAction();
    Logger.log('');

    Logger.log('==========================================');
    Logger.log('✅ All Tests Completed Successfully!');
    Logger.log('==========================================');
  } catch (error) {
    Logger.log('==========================================');
    Logger.log('❌ Tests Failed: ' + error.toString());
    Logger.log('==========================================');
  }
}
