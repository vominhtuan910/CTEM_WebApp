import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import util from "util";
import { fileURLToPath } from "url";

const execPromise = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output file path
const outputPath = path.join(__dirname, "..", "output", "system_info.json");

/**
 * Get more detailed system information beyond what Node.js os module provides
 * @returns {Promise<Object>} Enhanced system information
 */
async function getEnhancedSystemInfo() {
  const sysInfo = {
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    arch: os.arch(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
  };

  try {
    // Enhanced detection based on platform
    if (os.platform() === "win32") {
      // Windows: Use systeminfo
      const { stdout } = await execPromise("systeminfo");

      // Extract OS name
      const osNameMatch = stdout.match(/OS Name:\s*(.*)/i);
      if (osNameMatch) {
        sysInfo.osFullName = osNameMatch[1].trim();
      }

      // Extract OS Version
      const osVersionMatch = stdout.match(/OS Version:\s*(.*)/i);
      if (osVersionMatch) {
        sysInfo.osVersionFull = osVersionMatch[1].trim();
      }

      // Extract system model
      const sysModelMatch = stdout.match(/System Model:\s*(.*)/i);
      if (sysModelMatch) {
        sysInfo.systemModel = sysModelMatch[1].trim();
      }

      // Extract system manufacturer
      const sysManufacturerMatch = stdout.match(/System Manufacturer:\s*(.*)/i);
      if (sysManufacturerMatch) {
        sysInfo.systemManufacturer = sysManufacturerMatch[1].trim();
      }
    } else if (os.platform() === "darwin") {
      // macOS: Use system_profiler
      const { stdout: swStdout } = await execPromise(
        "system_profiler SPSoftwareDataType"
      );
      const { stdout: hwStdout } = await execPromise(
        "system_profiler SPHardwareDataType"
      );

      // Extract OS version
      const osVersionMatch = swStdout.match(/System Version: (.*)/i);
      if (osVersionMatch) {
        sysInfo.osFullName = osVersionMatch[1].trim();
      }

      // Extract model
      const modelMatch = hwStdout.match(/Model Name: (.*)/i);
      if (modelMatch) {
        sysInfo.systemModel = modelMatch[1].trim();
      }

      // Extract model identifier
      const modelIdMatch = hwStdout.match(/Model Identifier: (.*)/i);
      if (modelIdMatch) {
        sysInfo.systemModelId = modelIdMatch[1].trim();
      }
    } else {
      // Linux: Use lsb_release if available
      try {
        const { stdout } = await execPromise("lsb_release -a");

        const distMatch = stdout.match(/Distributor ID:\s*(.*)/);
        if (distMatch) {
          sysInfo.distribution = distMatch[1].trim();
        }

        const descMatch = stdout.match(/Description:\s*(.*)/);
        if (descMatch) {
          sysInfo.osFullName = descMatch[1].trim();
        }

        const releaseMatch = stdout.match(/Release:\s*(.*)/);
        if (releaseMatch) {
          sysInfo.distributionRelease = releaseMatch[1].trim();
        }
      } catch (error) {
        console.log("lsb_release not available, using /etc/os-release");

        try {
          // Try /etc/os-release as fallback
          const { stdout } = await execPromise("cat /etc/os-release");

          const nameMatch = stdout.match(/PRETTY_NAME="(.*)"/);
          if (nameMatch) {
            sysInfo.osFullName = nameMatch[1].trim();
          }

          const idMatch = stdout.match(/ID="?([^"]*)"?/);
          if (idMatch) {
            sysInfo.distribution = idMatch[1].trim();
          }

          const versionMatch = stdout.match(/VERSION_ID="?([^"]*)"?/);
          if (versionMatch) {
            sysInfo.distributionRelease = versionMatch[1].trim();
          }
        } catch (err) {
          console.log("Could not read os-release file");
        }
      }

      // Try to get hardware model for Linux
      try {
        const { stdout } = await execPromise(
          "cat /sys/devices/virtual/dmi/id/product_name"
        );
        if (stdout.trim()) {
          sysInfo.systemModel = stdout.trim();

          // Get manufacturer if available
          const { stdout: vendorOutput } = await execPromise(
            "cat /sys/devices/virtual/dmi/id/sys_vendor"
          );
          if (vendorOutput.trim()) {
            sysInfo.systemManufacturer = vendorOutput.trim();
          }
        }
      } catch (error) {
        console.log("Could not read hardware information");
      }
    }
  } catch (error) {
    console.log("Error getting enhanced system info:", error.message);
  }

  return sysInfo;
}

/**
 * Function to get hostname and IP information
 * @param {string} target - Optional target (default: localhost)
 * @returns {Promise<object>} System information
 */
async function scanHostname_IPs(target = "localhost") {
  return new Promise(async (resolve, reject) => {
    console.log(`Gathering system information for ${target}`);

    try {
      // Get basic system information from os module
      const hostname = os.hostname();
      const interfaces = os.networkInterfaces();
      const platform = os.platform();
      const release = os.release();
      const type = os.type();
      const arch = os.arch();
      const uptime = os.uptime();
      const loadAvg = os.loadavg();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const cpus = os.cpus();

      // Format IP addresses
      const ipAddresses = [];
      Object.keys(interfaces).forEach((interfaceName) => {
        interfaces[interfaceName].forEach((iface) => {
          // Include all addresses, but mark internal ones
          ipAddresses.push({
            interface: interfaceName,
            address: iface.address,
            netmask: iface.netmask,
            family: iface.family,
            mac: iface.mac,
            internal: iface.internal,
          });
        });
      });

      // Get enhanced system information
      const enhancedInfo = await getEnhancedSystemInfo();

      // Prepare the result
      const result = {
        timestamp: new Date(),
        hostname,
        platform,
        release,
        type,
        arch,
        uptime,
        loadAvg,
        totalMem,
        freeMem,
        cpus: cpus.map((cpu) => ({
          model: cpu.model,
          speed: cpu.speed,
          times: cpu.times,
        })),
        ipAddresses,
        ...enhancedInfo,
      };

      // Save to file
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

      resolve(result);
    } catch (error) {
      console.error("Error gathering system information:", error);
      reject(error);
    }
  });
}

export { scanHostname_IPs, getEnhancedSystemInfo };
