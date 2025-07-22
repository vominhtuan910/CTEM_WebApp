import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../output");
const LYNIS_OUTPUT_FILE = path.join(OUTPUT_DIR, "lynis_output.json");

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Checks if Lynis is installed on the system
 * @returns {Promise<boolean>} True if Lynis is installed
 */
export function checkLynisInstalled() {
  return new Promise((resolve) => {
    exec("which lynis", (error) => {
      if (error) {
        console.log("Lynis is not installed");
        resolve(false);
      } else {
        console.log("Lynis is installed");
        resolve(true);
      }
    });
  });
}

/**
 * Runs Lynis audit on the local system
 * @returns {Promise<object>} Lynis scan results
 */
export function runLynisScan() {
  return new Promise(async (resolve, reject) => {
    // Check if Lynis is installed
    const isInstalled = await checkLynisInstalled();
    if (!isInstalled) {
      return reject(new Error("Lynis is not installed on this system"));
    }

    console.log("Starting Lynis scan...");

    // Run Lynis with sudo and capture output
    exec(
      "sudo lynis audit system --quick --no-colors",
      async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running Lynis: ${error.message}`);
          return reject(error);
        }

        if (stderr) {
          console.warn(`Lynis stderr: ${stderr}`);
        }

        try {
          // Parse the Lynis output
          const results = parseLynisOutput(stdout);

          // Save results to file
          await fs.writeJson(LYNIS_OUTPUT_FILE, results, { spaces: 2 });

          console.log("Lynis scan completed and results saved");
          resolve(results);
        } catch (parseError) {
          console.error(`Error parsing Lynis output: ${parseError.message}`);
          reject(parseError);
        }
      }
    );
  });
}

/**
 * Parse Lynis output text into structured data
 * @param {string} output - Raw Lynis output
 * @returns {object} Structured Lynis data
 */
function parseLynisOutput(output) {
  const lines = output.split("\n");
  const result = {
    hardening_index: 0,
    tests_performed: 0,
    suggestions: [],
    warnings: [],
    installed_packages: [],
    services: [],
    system_info: {
      hostname: "",
      os_name: "",
      os_version: "",
      kernel_version: "",
    },
  };

  // Extract system information
  for (const line of lines) {
    // Extract hardening index
    const hardeningMatch = line.match(/Hardening index\s*:\s*(\d+)/);
    if (hardeningMatch) {
      result.hardening_index = parseInt(hardeningMatch[1], 10);
    }

    // Extract tests performed
    const testsMatch = line.match(/Tests performed\s*:\s*(\d+)/);
    if (testsMatch) {
      result.tests_performed = parseInt(testsMatch[1], 10);
    }

    // Extract suggestions
    if (line.includes("Suggestion")) {
      const suggestionMatch = line.match(/\[\s*\!\s*\]\s*(.*)/);
      if (suggestionMatch) {
        result.suggestions.push(suggestionMatch[1].trim());
      }
    }

    // Extract warnings
    if (line.includes("Warning")) {
      const warningMatch = line.match(/\[\s*-\s*\]\s*(.*)/);
      if (warningMatch) {
        result.warnings.push(warningMatch[1].trim());
      }
    }

    // Extract OS information
    const osMatch = line.match(/OS\s*:\s*(.*)/);
    if (osMatch) {
      result.system_info.os_name = osMatch[1].trim();
    }

    // Extract kernel version
    const kernelMatch = line.match(/Kernel\s*:\s*(.*)/);
    if (kernelMatch) {
      result.system_info.kernel_version = kernelMatch[1].trim();
    }

    // Extract hostname
    const hostnameMatch = line.match(/Hostname\s*:\s*(.*)/);
    if (hostnameMatch) {
      result.system_info.hostname = hostnameMatch[1].trim();
    }
  }

  // Get installed packages separately
  try {
    const packageList = getInstalledPackages();
    result.installed_packages = packageList;
  } catch (error) {
    console.error("Error getting installed packages:", error);
  }

  // Get running services separately
  try {
    const services = getRunningServices();
    result.services = services;
  } catch (error) {
    console.error("Error getting running services:", error);
  }

  return result;
}

/**
 * Get list of installed packages on the system
 * @returns {Array} List of installed packages
 */
function getInstalledPackages() {
  // This is a synchronous function for simplicity
  // In a production environment, you might want to make this async
  try {
    // Different commands for different package managers
    let packageList = [];

    // Try apt (Debian/Ubuntu)
    try {
      const aptOutput = require("child_process").execSync(
        'dpkg -l | grep "^ii" | awk \'{print $2 " " $3}\'',
        { encoding: "utf8" }
      );
      if (aptOutput) {
        packageList = aptOutput
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const [name, version] = line.split(" ");
            return { name, version };
          });
        return packageList;
      }
    } catch (e) {
      // Not a Debian/Ubuntu system or dpkg failed
    }

    // Try rpm (RHEL/CentOS/Fedora)
    try {
      const rpmOutput = require("child_process").execSync(
        'rpm -qa --qf "%{NAME} %{VERSION}\\n"',
        { encoding: "utf8" }
      );
      if (rpmOutput) {
        packageList = rpmOutput
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const [name, version] = line.split(" ");
            return { name, version };
          });
        return packageList;
      }
    } catch (e) {
      // Not a RPM-based system or rpm failed
    }

    return packageList;
  } catch (error) {
    console.error("Error getting installed packages:", error);
    return [];
  }
}

/**
 * Get list of running services on the system
 * @returns {Array} List of running services
 */
function getRunningServices() {
  // This is a synchronous function for simplicity
  try {
    // Try systemctl for systemd systems
    try {
      const systemctlOutput = require("child_process").execSync(
        "systemctl list-units --type=service --state=running --no-pager --plain --no-legend",
        { encoding: "utf8" }
      );
      if (systemctlOutput) {
        return systemctlOutput
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            const name = parts[0].replace(".service", "");
            return {
              name,
              status: "running",
              description: parts.slice(4).join(" "),
            };
          });
      }
    } catch (e) {
      // Not a systemd system or systemctl failed
    }

    // Try service command for init.d systems
    try {
      const serviceOutput = require("child_process").execSync(
        "service --status-all 2>&1",
        { encoding: "utf8" }
      );
      if (serviceOutput) {
        return serviceOutput
          .split("\n")
          .filter((line) => line.includes("[ + ]"))
          .map((line) => {
            const match = line.match(/\[\s\+\s\]\s+(\S+)/);
            return match
              ? {
                  name: match[1],
                  status: "running",
                  description: "",
                }
              : null;
          })
          .filter(Boolean);
      }
    } catch (e) {
      // service command failed
    }

    return [];
  } catch (error) {
    console.error("Error getting running services:", error);
    return [];
  }
}

/**
 * Gets the latest Lynis scan results from file
 * @returns {Promise<object>} Lynis scan results
 */
export async function getLynisResults() {
  try {
    if (await fs.pathExists(LYNIS_OUTPUT_FILE)) {
      return await fs.readJson(LYNIS_OUTPUT_FILE);
    }
    return null;
  } catch (error) {
    console.error(`Error reading Lynis results: ${error.message}`);
    return null;
  }
}

export default {
  checkLynisInstalled,
  runLynisScan,
  getLynisResults,
};
