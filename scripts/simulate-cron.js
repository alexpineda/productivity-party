#!/usr/bin/env node

// scripts/simulate-cron.js
// A development script that simulates a cron job by periodically calling the /api/calcscore endpoint

const http = require("http");

const PRODUCTIVITY_SCORE_UPDATE_INTERVAL = 5;
// Convert minutes to milliseconds
const INTERVAL_MS = PRODUCTIVITY_SCORE_UPDATE_INTERVAL * 60 * 1000;
const API_URL = "http://localhost:3000/api/calcscore";

console.log(`🕒 Starting productivity score cron simulator`);
console.log(
  `🔄 Will fetch ${API_URL} every ${PRODUCTIVITY_SCORE_UPDATE_INTERVAL} minute(s)`
);

// Function to call the API endpoint
async function callScoreEndpoint() {
  console.log(`⏱️ ${new Date().toISOString()} - Calling calcscore endpoint...`);

  const req = http.get(API_URL, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log(
            `✅ Successfully processed ${response.processedBlockCount} blocks`
          );
          if (response.scoreDelta !== 0) {
            console.log(`📊 Score delta: ${response.scoreDelta}`);
          }
        } else {
          console.log(`❌ API error: ${response.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error(`❌ Error parsing response: ${error}`);
      }
    });
  });

  req.on("error", (error) => {
    console.error(`❌ Request failed: ${error.message}`);
  });

  req.end();
}

// Execute once immediately on startup
callScoreEndpoint();

// Then set interval to run periodically
setInterval(callScoreEndpoint, INTERVAL_MS);

console.log(`💡 Press Ctrl+C to stop the simulator`);
