/**
 * Response Logger Module
 * 
 * Logs all responses sent to validators with timestamps for auditing and debugging purposes.
 * Runs in background to avoid slowing down response time.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '#modules/logger/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default log directory
const LOG_DIR = process.env.RESPONSE_LOG_DIR || path.resolve(__dirname, '../../logs/responses');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  logger.info(`[ResponseLogger] Created log directory: ${LOG_DIR}`);
}

/**
 * Get log file path for current date
 * Format: responses-YYYY-MM-DD.jsonl (JSON Lines format)
 */
function getLogFilePath() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOG_DIR, `responses-${dateStr}.jsonl`);
}

/**
 * Log a response to file
 * Runs asynchronously in background to avoid blocking
 * 
 * @param {Object} responseData - The response data to log
 * @param {string} responseData.typeId - The type ID of the request
 * @param {Object} responseData.metadata - The request metadata
 * @param {number} responseData.timeout - The request timeout
 * @param {Array} responseData.responses - The responses array
 * @param {string} responseData.timestamp - The response timestamp
 * @param {string} responseData.status - The response status
 */
async function logResponse(responseData) {
  try {
    const logEntry = {
      timestamp: responseData.timestamp || new Date().toISOString(),
      typeId: responseData.typeId,
      metadata: responseData.metadata,
      timeout: responseData.timeout,
      status: responseData.status,
      responseCount: responseData.responses ? responseData.responses.length : 0,
      // Store first 3 responses for quick inspection (to avoid huge log files)
      sampleResponses: responseData.responses ? responseData.responses.slice(0, 100) : [],
      // Store full response count and size info
      totalResponses: responseData.responses ? responseData.responses.length : 0,
      responseSizeBytes: responseData.responses ? JSON.stringify(responseData.responses).length : 0,
    };

    // Convert to JSON line (one JSON object per line)
    const logLine = JSON.stringify(logEntry) + '\n';

    // Get log file path for today
    const logFilePath = getLogFilePath();

    // Append to log file (async, non-blocking)
    await fs.promises.appendFile(logFilePath, logLine, 'utf8');

    logger.info(`[ResponseLogger] Logged response: ${responseData.typeId} (${logEntry.responseCount} items)`);
  } catch (error) {
    logger.error(`[ResponseLogger] Failed to log response: ${error.message}`);
  }
}

/**
 * Log a response in background (fire and forget)
 * This doesn't block the response from being sent
 * 
 * @param {Object} responseData - The response data to log
 */
function logResponseBackground(responseData) {
  // Run in background, catch errors to prevent crashes
  logResponse(responseData).catch(err => {
    logger.error(`[ResponseLogger] Background logging failed: ${err.message}`);
  });
}

/**
 * Get log statistics for a specific date
 * 
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Promise<Object>} Statistics object
 */
async function getLogStats(date = null) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFilePath = path.join(LOG_DIR, `responses-${targetDate}.jsonl`);

    if (!fs.existsSync(logFilePath)) {
      return {
        date: targetDate,
        exists: false,
        totalRequests: 0,
        totalResponses: 0,
      };
    }

    const content = await fs.promises.readFile(logFilePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line);

    let totalRequests = lines.length;
    let totalResponses = 0;
    let typeIdCounts = {};

    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        totalResponses += entry.responseCount || 0;
        typeIdCounts[entry.typeId] = (typeIdCounts[entry.typeId] || 0) + 1;
      } catch (e) {
        // Skip invalid lines
      }
    });

    return {
      date: targetDate,
      exists: true,
      totalRequests,
      totalResponses,
      typeIdCounts,
      logFilePath,
    };
  } catch (error) {
    logger.error(`[ResponseLogger] Failed to get log stats: ${error.message}`);
    return {
      date: date || new Date().toISOString().split('T')[0],
      exists: false,
      error: error.message,
    };
  }
}

/**
 * Clean up old log files (older than specified days)
 * 
 * @param {number} daysToKeep - Number of days to keep logs (default: 30)
 */
async function cleanupOldLogs(daysToKeep = 30) {
  try {
    const files = await fs.promises.readdir(LOG_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('responses-') || !file.endsWith('.jsonl')) {
        continue;
      }

      const filePath = path.join(LOG_DIR, file);
      const stats = await fs.promises.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        await fs.promises.unlink(filePath);
        deletedCount++;
        logger.info(`[ResponseLogger] Deleted old log file: ${file}`);
      }
    }

    if (deletedCount > 0) {
      logger.info(`[ResponseLogger] Cleanup complete: ${deletedCount} old log files deleted`);
    }

    return deletedCount;
  } catch (error) {
    logger.error(`[ResponseLogger] Failed to cleanup old logs: ${error.message}`);
    return 0;
  }
}

export default {
  logResponse,
  logResponseBackground,
  getLogStats,
  cleanupOldLogs,
  LOG_DIR,
};

