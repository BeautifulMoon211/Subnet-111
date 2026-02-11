#!/usr/bin/env node
/**
 * View Response Logs Utility
 * 
 * View and analyze response logs saved by the response logger
 * 
 * Usage:
 *   node scripts/view-response-logs.js                    # Show today's stats
 *   node scripts/view-response-logs.js --date 2026-02-11  # Show specific date
 *   node scripts/view-response-logs.js --tail 10          # Show last 10 entries
 *   node scripts/view-response-logs.js --cleanup 30       # Delete logs older than 30 days
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import responseLogger from '../modules/response-logger/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  date: null,
  tail: null,
  cleanup: null,
  help: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--date' && args[i + 1]) {
    options.date = args[i + 1];
    i++;
  } else if (args[i] === '--tail' && args[i + 1]) {
    options.tail = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--cleanup' && args[i + 1]) {
    options.cleanup = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    options.help = true;
  }
}

// Show help
if (options.help) {
  console.log(`
Response Logs Viewer

Usage:
  node scripts/view-response-logs.js [options]

Options:
  --date YYYY-MM-DD    Show logs for specific date (default: today)
  --tail N             Show last N log entries
  --cleanup DAYS       Delete logs older than DAYS days
  --help, -h           Show this help message

Examples:
  node scripts/view-response-logs.js
  node scripts/view-response-logs.js --date 2026-02-11
  node scripts/view-response-logs.js --tail 10
  node scripts/view-response-logs.js --cleanup 30
`);
  process.exit(0);
}

/**
 * Display log statistics
 */
async function showStats(date = null) {
  console.log('='.repeat(70));
  console.log('Response Logs Statistics');
  console.log('='.repeat(70));

  const stats = await responseLogger.getLogStats(date);

  if (!stats.exists) {
    console.log(`\nNo logs found for date: ${stats.date}`);
    if (stats.error) {
      console.log(`Error: ${stats.error}`);
    }
    console.log('='.repeat(70));
    return;
  }

  console.log(`\nDate: ${stats.date}`);
  console.log(`Log File: ${stats.logFilePath}`);
  console.log(`\nTotal Requests: ${stats.totalRequests}`);
  console.log(`Total Responses: ${stats.totalResponses}`);
  console.log(`Average Responses per Request: ${(stats.totalResponses / stats.totalRequests).toFixed(2)}`);

  console.log(`\nRequests by Type:`);
  Object.entries(stats.typeIdCounts).forEach(([typeId, count]) => {
    const percentage = ((count / stats.totalRequests) * 100).toFixed(1);
    console.log(`  ${typeId}: ${count} (${percentage}%)`);
  });

  console.log('='.repeat(70));
}

/**
 * Display last N log entries
 */
async function showTail(count, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const logFilePath = path.join(responseLogger.LOG_DIR, `responses-${targetDate}.jsonl`);

  if (!fs.existsSync(logFilePath)) {
    console.log(`No logs found for date: ${targetDate}`);
    return;
  }

  const content = await fs.promises.readFile(logFilePath, 'utf8');
  const lines = content.trim().split('\n').filter(line => line);
  const tailLines = lines.slice(-count);

  console.log('='.repeat(70));
  console.log(`Last ${tailLines.length} Response Log Entries (${targetDate})`);
  console.log('='.repeat(70));

  tailLines.forEach((line, index) => {
    try {
      const entry = JSON.parse(line);
      console.log(`\n[${index + 1}] ${entry.timestamp}`);
      console.log(`  Type ID: ${entry.typeId}`);
      console.log(`  Status: ${entry.status}`);
      console.log(`  Responses: ${entry.responseCount} items (${(entry.responseSizeBytes / 1024).toFixed(2)} KB)`);
      console.log(`  Metadata: ${JSON.stringify(entry.metadata)}`);
      
      if (entry.sampleResponses && entry.sampleResponses.length > 0) {
        console.log(`  Sample Response (first item):`);
        console.log(`    ${JSON.stringify(entry.sampleResponses[0]).substring(0, 100)}...`);
      }
    } catch (e) {
      console.log(`\n[${index + 1}] Invalid log entry`);
    }
  });

  console.log('\n' + '='.repeat(70));
}

/**
 * Cleanup old logs
 */
async function cleanup(daysToKeep) {
  console.log('='.repeat(70));
  console.log(`Cleaning up logs older than ${daysToKeep} days...`);
  console.log('='.repeat(70));

  const deletedCount = await responseLogger.cleanupOldLogs(daysToKeep);

  console.log(`\nCleanup complete: ${deletedCount} old log files deleted`);
  console.log('='.repeat(70));
}

/**
 * Main function
 */
async function main() {
  try {
    if (options.cleanup !== null) {
      await cleanup(options.cleanup);
    } else if (options.tail !== null) {
      await showTail(options.tail, options.date);
    } else {
      await showStats(options.date);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();

