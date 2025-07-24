import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

/**
 * Check if WSL is available for use
 * @returns {Promise<boolean>} True if WSL is available
 */
async function checkWSL() {
  if (process.platform !== "win32") {
    return false; // WSL is only available on Windows
  }

  try {
    const { stdout } = await execPromise("wsl --status");
    return true;
  } catch (error) {
    console.log("WSL is not available:", error.message);
    return false;
  }
}

/**
 * Execute command in WSL
 * @param {string} command - Command to execute in WSL
 * @returns {Promise<{stdout: string, stderr: string}>} Command output
 */
async function execInWSL(command) {
  if (!(await checkWSL())) {
    throw new Error("WSL is not available");
  }

  try {
    return await execPromise(`wsl ${command}`);
  } catch (error) {
    console.error("Error executing in WSL:", error.message);
    throw error;
  }
}

/**
 * Check if a package is installed in WSL
 * @param {string} packageName - Name of the package to check
 * @returns {Promise<boolean>} True if package is installed
 */
async function isPackageInstalledInWSL(packageName) {
  try {
    const { stdout } = await execInWSL(
      `which ${packageName} || echo "not_installed"`
    );
    return stdout.trim() !== "not_installed";
  } catch (error) {
    console.error(
      `Error checking if ${packageName} is installed in WSL:`,
      error.message
    );
    return false;
  }
}

/**
 * Get WSL distribution information
 * @returns {Promise<Object>} Distribution info
 */
async function getWSLInfo() {
  try {
    const { stdout } = await execInWSL("cat /etc/os-release");

    const info = {
      name: null,
      version: null,
      id: null,
    };

    // Parse os-release file
    const lines = stdout.split("\n");
    for (const line of lines) {
      if (line.startsWith("NAME=")) {
        info.name = line.split("=")[1].replace(/"/g, "").trim();
      }
      if (line.startsWith("VERSION=")) {
        info.version = line.split("=")[1].replace(/"/g, "").trim();
      }
      if (line.startsWith("ID=")) {
        info.id = line.split("=")[1].replace(/"/g, "").trim();
      }
    }

    return info;
  } catch (error) {
    console.error("Error getting WSL info:", error.message);
    return {
      name: "Unknown",
      version: "Unknown",
      id: "unknown",
    };
  }
}

export { checkWSL, execInWSL, isPackageInstalledInWSL, getWSLInfo };
