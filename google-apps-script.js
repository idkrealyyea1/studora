/**
 * ════════════════════════════════════════════════
 *  STUDORA — GOOGLE APPS SCRIPT
 *  Receives form submissions and saves to Google Sheets
 * ════════════════════════════════════════════════
 *
 * HOW TO SET UP (Step-by-step):
 * ─────────────────────────────
 * 1. Go to https://sheets.google.com
 * 2. Create a new spreadsheet named "Studora Applications"
 * 3. Add these headers in Row 1:
 *    A: Timestamp | B: Name | C: Phone | D: Email
 *    E: Service   | F: Price | G: Notes | H: Status | I: Service ID
 *
 * 4. Click "Extensions" → "Apps Script"
 * 5. Delete any existing code
 * 6. Paste ALL of THIS file's code
 * 7. Click "Save" (Ctrl+S)
 * 8. Click "Deploy" → "New Deployment"
 * 9. Select type: "Web App"
 * 10. Set: Execute as → "Me"
 * 11. Set: Who has access → "Anyone"
 * 12. Click "Deploy" → copy the Web App URL
 * 13. Open studora/assets/js/main.js
 * 14. Paste the URL in: CONFIG.GOOGLE_SCRIPT_URL = "paste here"
 * ════════════════════════════════════════════════
 */

// ── YOUR SPREADSHEET NAME (must match exactly) ──
const SHEET_NAME = "Applications";

/**
 * Handle POST requests from the website
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveToSheet(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Application saved." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing connectivity)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Studora Apps Script is running ✓" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Save form data to the Google Sheet
 */
function saveToSheet(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  // Auto-create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "Timestamp", "Name", "Phone", "Email",
      "Service", "Price", "Notes", "Status", "Service ID"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e1442");
    headerRange.setFontColor("#c9a84c");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  // Format timestamp nicely
  const timestamp = data.timestamp
    ? new Date(data.timestamp).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" })
    : new Date().toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" });

  // Append the new row
  sheet.appendRow([
    timestamp,
    data.name      || "",
    data.phone     || "",
    data.email     || "",
    data.service   || "",
    data.price     || "",
    data.notes     || "",
    data.status    || "New",
    data.serviceId || "",
  ]);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 9);

  // Optional: Send email notification
  // sendEmailNotification(data);
}

/**
 * Optional: Get email notification when a new application comes in
 * Uncomment and fill in your email to enable
 */
/*
function sendEmailNotification(data) {
  const adminEmail = "YOUR_EMAIL@gmail.com";
  const subject    = `New Studora Application — ${data.name}`;
  const body       = `
New application received on Studora!

Name:    ${data.name}
Phone:   ${data.phone}
Email:   ${data.email || "Not provided"}
Service: ${data.service}
Price:   ${data.price}
Notes:   ${data.notes}

Submitted: ${data.timestamp}
  `.trim();

  GmailApp.sendEmail(adminEmail, subject, body);
}
*/

/**
 * Test function — run this manually to verify the sheet works
 */
function testSubmission() {
  const testData = {
    name:      "Test Student",
    phone:     "+970 59 123 4567",
    email:     "test@example.com",
    service:   "Essay Writing — From $10",
    serviceId: "s001",
    price:     "From $10",
    notes:     "This is a test submission to verify the Apps Script is working correctly.",
    timestamp: new Date().toISOString(),
    status:    "New",
  };
  saveToSheet(testData);
  Logger.log("✅ Test submission saved to sheet successfully.");
}
