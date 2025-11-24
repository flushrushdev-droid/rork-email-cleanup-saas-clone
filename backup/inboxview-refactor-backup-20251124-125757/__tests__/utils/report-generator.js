const fs = require('fs');
const path = require('path');

/**
 * Generates a detailed HTML report from Jest test results
 */
function generateHTMLReport(results) {
  const timestamp = new Date().toISOString();
  const totalTests = results.numTotalTests;
  const passedTests = results.numPassedTests;
  const failedTests = results.numFailedTests;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AthenXMail Demo Mode Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { 
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    h1 { font-size: 32px; margin-bottom: 10px; color: #1d1d1f; }
    .timestamp { color: #86868b; font-size: 14px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 14px; color: #86868b; margin-bottom: 10px; text-transform: uppercase; }
    .summary-card .value { font-size: 36px; font-weight: 600; }
    .summary-card.passed .value { color: #34c759; }
    .summary-card.failed .value { color: #ff3b30; }
    .summary-card.total .value { color: #007aff; }
    .summary-card.rate .value { color: #5856d6; }
    .test-suite {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e5e7;
    }
    .suite-name {
      font-size: 20px;
      font-weight: 600;
    }
    .suite-status {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .suite-status.passed { background: #d1f4e0; color: #0a8754; }
    .suite-status.failed { background: #ffd3d0; color: #c41e3a; }
    .test-case {
      padding: 15px;
      border-left: 4px solid #e5e5e7;
      margin-bottom: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .test-case.passed { border-left-color: #34c759; background: #f0fdf4; }
    .test-case.failed { border-left-color: #ff3b30; background: #fef2f2; }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .test-name {
      font-size: 16px;
      font-weight: 500;
      flex: 1;
    }
    .test-name.passed::before { content: "✓ "; color: #34c759; font-weight: 700; }
    .test-name.failed::before { content: "✗ "; color: #ff3b30; font-weight: 700; }
    .test-duration {
      font-size: 12px;
      color: #86868b;
      margin-left: 10px;
    }
    .test-description {
      font-size: 14px;
      color: #6e6e73;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .test-purpose {
      font-size: 13px;
      color: #007aff;
      background: #e3f2fd;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 8px;
      font-weight: 500;
    }
    .test-error {
      background: #fff;
      border: 1px solid #ffd3d0;
      padding: 15px;
      border-radius: 6px;
      margin-top: 10px;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 12px;
      color: #c41e3a;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    .footer {
      text-align: center;
      padding: 30px;
      color: #86868b;
      font-size: 14px;
    }
    .badge { 
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    }
    .badge.demo { background: #e3f2fd; color: #1976d2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 AthenXMail Demo Mode Test Report</h1>
      <p class="timestamp">Generated: ${timestamp}</p>
    </div>

    <div class="summary">
      <div class="summary-card total">
        <h3>Total Tests</h3>
        <div class="value">${totalTests}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="value">${passedTests}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="value">${failedTests}</div>
      </div>
      <div class="summary-card rate">
        <h3>Pass Rate</h3>
        <div class="value">${passRate}%</div>
      </div>
    </div>
`;

  // Process each test suite
  results.testResults.forEach(suite => {
    const suiteName = path.basename(suite.name);
    // Check suite status - use status field if available, otherwise check numFailingTests
    const suiteStatus = (suite.status === 'passed' || suite.numFailingTests === 0) ? 'passed' : 'failed';
    const suiteDuration = ((suite.endTime - suite.startTime) / 1000).toFixed(2);

    html += `
    <div class="test-suite">
      <div class="suite-header">
        <div class="suite-name">${suiteName} <span class="badge demo">DEMO MODE</span></div>
        <div>
          <span class="suite-status ${suiteStatus}">${suiteStatus}</span>
          <span style="color: #86868b; font-size: 12px; margin-left: 10px;">${suiteDuration}s</span>
        </div>
      </div>
`;

    // Process each test case
    suite.assertionResults.forEach(test => {
      const testStatus = test.status === 'passed' ? 'passed' : 'failed';
      const testDuration = test.duration ? `${test.duration}ms` : 'N/A';
      
      // Extract test description and purpose
      const fullPath = test.ancestorTitles.length > 0 
        ? `${test.ancestorTitles.join(' → ')}`
        : '';
      
      // Generate a meaningful description of what the test does
      const testPurpose = generateTestPurpose(test.title, test.ancestorTitles);

      html += `
      <div class="test-case ${testStatus}">
        <div class="test-header">
          <div class="test-name ${testStatus}">${test.title}</div>
          <div class="test-duration">${testDuration}</div>
        </div>
        ${fullPath ? `<div class="test-description">${fullPath}</div>` : ''}
        <div class="test-purpose">📝 ${testPurpose}</div>
`;

      // Add error details if test failed
      if (test.failureMessages && test.failureMessages.length > 0) {
        const errorMessage = test.failureMessages.join('\n\n');
        html += `
        <div class="test-error">${escapeHtml(errorMessage)}</div>
`;
      }

      html += `
      </div>
`;
    });

    html += `
    </div>
`;
  });

  const totalDuration = (results.testResults.reduce((acc, suite) => acc + (suite.endTime - suite.startTime), 0) / 1000).toFixed(2);

  html += `
    <div class="footer">
      <p><strong>AthenXMail Automated Test Suite</strong></p>
      <p>Total Duration: ${totalDuration}s</p>
      <p style="margin-top: 10px;">Tests verify demo mode functionality including data persistence, user interactions, and UI behavior.</p>
    </div>
  </div>
</body>
</html>
`;

  return html;
}

function generateTestPurpose(testTitle, ancestors) {
  // Generate human-readable description of what the test validates
  const category = ancestors[0] || 'General';
  
  // Map test titles to purposes
  const purposeMap = {
    'should check demo mode setup': 'Verifies that demo mode can be enabled and persists in AsyncStorage',
    'should verify demo auth context': 'Validates that authentication context correctly returns demo user data',
    'should display mock emails': 'Ensures mock email data is correctly displayed in the inbox',
    'should archive email with toast and undo': 'Tests the archive functionality with undo option and toast notification',
    'should archive email permanently after timeout': 'Verifies emails are permanently archived after the undo timeout expires',
    'should delete email with toast and undo': 'Tests the delete functionality with undo option and toast notification',
    'should delete email permanently after timeout': 'Verifies emails are permanently deleted after the undo timeout expires',
    'should toggle starred status': 'Tests the ability to star/unstar emails',
    'should filter emails by category': 'Validates email filtering by different categories (inbox, sent, drafts)',
    'should open compose screen': 'Verifies the email compose screen renders correctly',
    'should attach and remove files': 'Tests file attachment functionality in email composition',
    'should validate empty fields': 'Ensures validation prevents sending emails with empty required fields',
    'should save draft': 'Tests the ability to save email drafts',
    'should open folder creation modal': 'Verifies the custom folder creation modal opens and displays correctly',
    'should show red error message for empty fields': 'Tests validation error messages for empty folder fields',
    'should not persist folders after refresh': 'Ensures custom folders are not saved in demo mode',
    'should display empty folder state': 'Validates empty state UI for custom folders',
    'should display mock rules': 'Ensures automation rules are displayed correctly',
    'should create new rule': 'Tests the creation of new automation rules',
    'should edit existing rule': 'Verifies the ability to edit existing automation rules',
    'should show toast on save': 'Tests that save action triggers a toast notification',
    'should validate form fields': 'Ensures form validation works for rule creation',
    'should filter operators by field type': 'Tests that operators are contextually filtered based on field selection',
    'should toggle rule on/off': 'Validates the ability to enable/disable rules',
    'should not persist rules after refresh': 'Ensures automation rules are not saved in demo mode',
    'should display mock notes': 'Verifies mock notes data is displayed correctly',
    'should create new note': 'Tests the ability to create new notes',
    'should edit note': 'Validates note editing functionality',
    'should delete note': 'Tests note deletion with confirmation',
    'should not persist notes after refresh': 'Ensures notes are not saved in demo mode',
    'should create calendar event': 'Tests the creation of calendar events',
    'should not persist events after refresh': 'Ensures calendar events are not saved in demo mode',
    'should show alert when sync is attempted': 'Verifies sync is disabled in demo mode with proper user notification',
    'should not make API calls': 'Ensures no actual API requests are made in demo mode',
  };
  
  return purposeMap[testTitle] || `Tests: ${testTitle} in ${category}`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Main execution
const resultsPath = path.join(__dirname, '../../test-results/jest-results.json');
const outputPath = path.join(__dirname, '../../test-results/demo-qa-report.html');

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read Jest results
if (fs.existsSync(resultsPath)) {
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const html = generateHTMLReport(results);
  fs.writeFileSync(outputPath, html);
  console.log(`\n✅ Test report generated: ${outputPath}\n`);
  console.log(`📊 Results: ${results.numPassedTests}/${results.numTotalTests} tests passed\n`);
} else {
  console.error(`\n❌ Jest results not found at: ${resultsPath}\n`);
  console.log('Run tests with: npm run test:report\n');
  process.exit(1);
}
