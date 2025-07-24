import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";
import { checkWSL } from "./wslTools.js";

const execPromise = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if Lynis is installed
 * @returns {Promise<boolean>} True if Lynis is installed
 */
async function checkLynisInstalled() {
  const cmd = process.platform === "win32" ? "wsl which lynis" : "which lynis";

  return new Promise((resolve) => {
    exec(cmd, (error) => {
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
 * Run a Lynis scan on Linux or via WSL
 * @param {Object} options - Options for the scan
 * @param {boolean} options.useWSL - Whether to use WSL (auto-detected if not specified)
 * @returns {Promise<Object>} Scan results
 */
async function runLynisScan(options = {}) {
  console.log("Starting Lynis scan...");
  const isWindows = process.platform === "win32";

  // Check if we should use WSL
  const useWSL =
    options.useWSL !== undefined
      ? options.useWSL
      : isWindows && (await checkWSL());

  if (isWindows && !useWSL) {
    throw new Error("Lynis scan requires WSL on Windows");
  }

  const command = useWSL
    ? "wsl sudo lynis audit system --no-colors"
    : "sudo lynis audit system --no-colors";

  return new Promise((resolve, reject) => {
    // Run Lynis with output redirection
    exec(command, (error, stdout, stderr) => {
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

      resolve(results);
    });
  });
}

/**
 * Parse Lynis output into a structured object
 * @param {string} output - Raw Lynis output
 * @returns {Object} Structured scan results
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

    // Extract vulnerability findings
    if (line.includes("Vulnerability")) {
      const vulnMatch = line.match(/\[(.+)\]\s+(.+)/);
      if (vulnMatch) {
        results.vulnerabilities.push({
          category: vulnMatch[1].trim(),
          description: vulnMatch[2].trim(),
        });
      }
    }
  }

  return results;
}

/**
 * Get severity level for Lynis findings
 * @param {string} finding - The finding text
 * @returns {string} Severity level (Critical, High, Medium, Low)
 */
function getSeverityLevel(finding) {
  const lowercaseFinding = finding.toLowerCase();

  if (
    lowercaseFinding.includes("critical") ||
    lowercaseFinding.includes("severe vulnerability") ||
    lowercaseFinding.includes("remote code execution")
  ) {
    return "Critical";
  }

  if (
    lowercaseFinding.includes("high risk") ||
    lowercaseFinding.includes("vulnerability") ||
    lowercaseFinding.includes("unsafe")
  ) {
    return "High";
  }

  if (
    lowercaseFinding.includes("medium") ||
    lowercaseFinding.includes("consider") ||
    lowercaseFinding.includes("recommended")
  ) {
    return "Medium";
  }

  return "Low";
}

export {
  checkLynisInstalled,
  runLynisScan,
  parseLynisOutput,
  getSeverityLevel,
};
