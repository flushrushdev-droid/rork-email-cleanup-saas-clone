import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  suite: string;
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  stackTrace?: string;
  timestamp: string;
  screenshot?: string;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    timestamp: string;
  };
  suites: TestSuite[];
  environment: {
    platform: string;
    version: string;
    nodeVersion: string;
  };
}

/**
 * Generates HTML report from test results
 */
export function generateHTMLReport(report: TestReport, outputPath: string): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Mode QA Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .summary-card.passed {
            border-left-color: #27ae60;
        }
        .summary-card.failed {
            border-left-color: #e74c3c;
        }
        .summary-card.skipped {
            border-left-color: #f39c12;
        }
        .summary-card h3 {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .value {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
        }
        .suite {
            margin: 40px 0;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-header h2 {
            font-size: 18px;
        }
        .suite-stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
        }
        .test-item {
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-item.passed {
            background: #d4edda;
        }
        .test-item.failed {
            background: #f8d7da;
        }
        .test-item.skipped {
            background: #fff3cd;
        }
        .test-name {
            font-weight: 500;
            flex: 1;
        }
        .test-status {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .test-status.passed {
            background: #27ae60;
            color: white;
        }
        .test-status.failed {
            background: #e74c3c;
            color: white;
        }
        .test-status.skipped {
            background: #f39c12;
            color: white;
        }
        .test-duration {
            color: #7f8c8d;
            font-size: 12px;
            margin-left: 15px;
        }
        .error-details {
            margin-top: 10px;
            padding: 15px;
            background: #fff;
            border-left: 4px solid #e74c3c;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .environment {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .environment h3 {
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .environment-item {
            margin: 5px 0;
            color: #7f8c8d;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            margin-top: 30px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Demo Mode QA Test Report</h1>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div class="value">${report.summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div class="value">${report.summary.failed}</div>
            </div>
            <div class="summary-card skipped">
                <h3>Skipped</h3>
                <div class="value">${report.summary.skipped}</div>
            </div>
        </div>

        ${report.suites.map(suite => `
            <div class="suite">
                <div class="suite-header">
                    <h2>${suite.name}</h2>
                    <div class="suite-stats">
                        <span>Total: ${suite.total}</span>
                        <span style="color: #27ae60;">Passed: ${suite.passed}</span>
                        <span style="color: #e74c3c;">Failed: ${suite.failed}</span>
                        <span style="color: #f39c12;">Skipped: ${suite.skipped}</span>
                        <span>Duration: ${(suite.duration / 1000).toFixed(2)}s</span>
                    </div>
                </div>
                ${suite.tests.map(test => `
                    <div class="test-item ${test.status}">
                        <div style="flex: 1;">
                            <div class="test-name">${test.test}</div>
                            ${test.error ? `
                                <div class="error-details">
                                    <strong>Error:</strong><br/>
                                    ${escapeHtml(test.error)}
                                    ${test.stackTrace ? `<br/><br/><strong>Stack Trace:</strong><br/>${escapeHtml(test.stackTrace)}` : ''}
                                </div>
                            ` : ''}
                        </div>
                        <span class="test-status ${test.status}">${test.status}</span>
                        <span class="test-duration">${(test.duration / 1000).toFixed(2)}s</span>
                    </div>
                `).join('')}
            </div>
        `).join('')}

        <div class="environment">
            <h3>Test Environment</h3>
            <div class="environment-item"><strong>Platform:</strong> ${report.environment.platform}</div>
            <div class="environment-item"><strong>Version:</strong> ${report.environment.version}</div>
            <div class="environment-item"><strong>Node Version:</strong> ${report.environment.nodeVersion}</div>
        </div>

        <div class="timestamp">
            Report generated at: ${report.summary.timestamp}
        </div>
    </div>
</body>
</html>
  `;

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html, 'utf-8');
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Collects test results and generates report
 */
export function collectTestResults(
  results: TestResult[],
  outputPath: string = 'test-results/demo-qa-report.html'
): void {
  const suites = new Map<string, TestResult[]>();

  // Group tests by suite
  results.forEach(result => {
    if (!suites.has(result.suite)) {
      suites.set(result.suite, []);
    }
    suites.get(result.suite)!.push(result);
  });

  // Build test suites
  const testSuites: TestSuite[] = Array.from(suites.entries()).map(([name, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const duration = tests.reduce((sum, t) => sum + t.duration, 0);

    return {
      name,
      tests,
      total: tests.length,
      passed,
      failed,
      skipped,
      duration,
    };
  });

  // Build summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    duration: results.reduce((sum, r) => sum + r.duration, 0),
    timestamp: new Date().toISOString(),
  };

  const report: TestReport = {
    summary,
    suites: testSuites,
    environment: {
      platform: process.platform,
      version: process.version,
      nodeVersion: process.version,
    },
  };

  generateHTMLReport(report, outputPath);
}

