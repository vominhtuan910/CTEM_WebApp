import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const outputPath = path.join(
  __dirname,
  "..",
  "output",
  "lynis_scan_results.json"
);

/**
 * Check if Lynis is installed
 * @returns {Promise<boolean>} True if Lynis is installed
 */
async function checkLynisInstalled() {
  return new Promise((resolve) => {
    exec("which lynis", (error) => {
      if (error) {
        console.log("Lynis not found");
        resolve(false);
      } else {
        console.log("Lynis is installed");
        resolve(true);
      }
    });
  });
}

/**
 * Run a Lynis scan
 * @returns {Promise<object>} Scan results
 */
async function runLynisScan() {
  console.log("Starting Lynis scan...");

  return new Promise((resolve, reject) => {
    // Run Lynis with output redirection
    exec("lynis audit system --no-colors", (error, stdout, stderr) => {
      if (error && error.code !== 0) {
        console.error("Error during Lynis scan:", error.message);
        reject(error);
        return;
      }

      if (stderr) {
        console.warn("Warnings during Lynis scan:", stderr);
      }

      // Parse the output
      const results = parseLynisOutput(stdout);

      // Save results to file
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

      resolve(results);
    });
  });
}

/**
 * Get the latest Lynis scan results
 * @returns {Promise<object|null>} Latest scan results or null if not available
 */
async function getLynisResults() {
  try {
    if (fs.existsSync(outputPath)) {
      const data = fs.readFileSync(outputPath, "utf8");
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error reading Lynis scan results:", error.message);
    return null;
  }
}

/**
 * Parse Lynis output into a structured object
 * @param {string} output - Raw Lynis output
 * @returns {object} Structured scan results
 */
function parseLynisOutput(output) {
  const lines = output.split("\n");

  // Extract sections
  const results = {
    timestamp: new Date(),
    securityWarnings: [],
    suggestions: [],
    vulnerabilities: [],
    hardening: {
      index: 0,
      tests: 0,
      enabled: 0,
      disabled: 0,
    },
    systemInfo: {},
  };

  // Extract warnings and suggestions
  for (const line of lines) {
    // Security warnings
    if (line.includes("Warning:")) {
      results.securityWarnings.push(
        line.replace(/^\s*\[\s*\!\s*\]\s*Warning:\s*/, "").trim()
      );
    }

    // Suggestions
    if (line.includes("Suggestion:")) {
      results.suggestions.push(
        line.replace(/^\s*\[\s*\-\s*\]\s*Suggestion:\s*/, "").trim()
      );
    }

    // Hardening index
    const hardeningMatch = line.match(/Hardening index\s*:\s*(\d+)/);
    if (hardeningMatch) {
      results.hardening.index = parseInt(hardeningMatch[1], 10);
    }

    // Tests executed
    const testsMatch = line.match(/Tests performed\s*:\s*(\d+)/);
    if (testsMatch) {
      results.hardening.tests = parseInt(testsMatch[1], 10);
    }
  }

  return results;
}

export { checkLynisInstalled, runLynisScan, getLynisResults };
