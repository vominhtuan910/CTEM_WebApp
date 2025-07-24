import os from "os";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

/**
 * Format network interfaces information
 * @param {Object} interfaces - OS network interfaces
 * @returns {Array} Formatted network interfaces
 */
function formatNetworkInterfaces(interfaces) {
  const formattedInterfaces = [];

  // Process each network interface
  Object.keys(interfaces).forEach((ifaceName) => {
    const iface = interfaces[ifaceName];

    // Process each address in the interface
    iface.forEach((address) => {
      formattedInterfaces.push({
        name: ifaceName,
        address: address.address,
        family: address.family,
        internal: address.internal,
        netmask: address.netmask,
        mac: address.mac || null,
        cidr: address.cidr || null,
      });
    });
  });

  return formattedInterfaces;
}

/**
 * Get the primary IP address (non-internal IPv4)
 * @param {Array} interfaces - Formatted network interfaces
 * @returns {String|null} Primary IP address
 */
function getPrimaryIp(interfaces) {
  const nonInternal = interfaces.find(
    (iface) => iface.family === "IPv4" && !iface.internal
  );

  return nonInternal ? nonInternal.address : null;
}

/**
 * Collect system data from OS APIs
 * @returns {Object} Raw system data
 */
async function collectSystemData() {
  // Basic system information from os module
  const hostname = os.hostname();
  const platform = os.platform();
  const release = os.release();
  const type = os.type();
  const arch = os.arch();
  const uptime = os.uptime();
  const loadavg = os.loadavg();
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();

  // Additional platform-specific information
  let osInfo = {
    name: type,
    platform,
    kernelVersion: release,
    fullName: null,
    versionInfo: null,
  };

  try {
    if (platform === "linux") {
      // Linux - Try to get more detailed OS info
      const { stdout: lsbRelease } = await execPromise(
        "lsb_release -a || cat /etc/*release"
      );
      const distroInfo = lsbRelease.toString();

      const nameMatch = distroInfo.match(/PRETTY_NAME="([^"]+)"/);
      const versionMatch = distroInfo.match(/VERSION="([^"]+)"/);

      osInfo.fullName = nameMatch ? nameMatch[1] : null;
      osInfo.versionInfo = versionMatch ? versionMatch[1] : null;
    } else if (platform === "darwin") {
      // macOS
      const { stdout: macOsInfo } = await execPromise("sw_vers");
      const macOsData = macOsInfo.toString();

      const nameMatch = macOsData.match(/ProductName:\s+(.+)/);
      const versionMatch = macOsData.match(/ProductVersion:\s+(.+)/);

      osInfo.fullName = nameMatch ? nameMatch[1] : "macOS";
      osInfo.versionInfo = versionMatch ? versionMatch[1] : null;
    } else if (platform === "win32") {
      // Windows (basic info only - detailed info comes from PowerShell scan)
      osInfo.fullName = "Windows";
      osInfo.versionInfo = release;
    }
  } catch (error) {
    console.warn("Error getting detailed OS info:", error.message);
  }

  // Return collected data
  return {
    hostname,
    osInfo,
    cpuInfo: {
      model: cpus.length > 0 ? cpus[0].model : "Unknown",
      cores: cpus.length,
      speed: cpus.length > 0 ? cpus[0].speed : 0,
    },
    memory: {
      total: totalmem,
      free: freemem,
      usedPercent: Math.round(((totalmem - freemem) / totalmem) * 100),
    },
    uptime,
    loadAverage: loadavg,
    networkInterfaces,
  };
}

/**
 * Scan hostname and IP addresses
 * @param {string} target - Target hostname
 * @param {Object} options - Scan options
 * @param {boolean} options.skipNetworkConfig - Skip detailed network configuration
 * @param {boolean} options.quickScan - Perform a quick scan
 * @returns {Promise<Object>} System information
 */
async function scanHostname_IPs(target, options = {}) {
  const { skipNetworkConfig = false, quickScan = false } = options;

  try {
    console.log(`Collecting system information for ${target}...`);

    // Get raw system data
    const rawData = await collectSystemData();

    // Format the data for a cleaner response
    const result = {
      timestamp: new Date(),
      hostname: rawData.hostname,
      osInfo: {
        name: rawData.osInfo.fullName || rawData.osInfo.name,
        platform: rawData.osInfo.platform,
        kernelVersion: rawData.osInfo.kernelVersion,
        version: rawData.osInfo.versionInfo,
        arch: rawData.arch,
      },
      system: {
        uptime: rawData.uptime,
        cpu: {
          model: rawData.cpuInfo.model,
          cores: rawData.cpuInfo.cores,
        },
        memory: {
          total: rawData.memory.total,
          free: rawData.memory.free,
          usedPercent: rawData.memory.usedPercent,
        },
      },
    };

    // Add network information if not skipped
    if (!skipNetworkConfig) {
      const formattedInterfaces = formatNetworkInterfaces(
        rawData.networkInterfaces
      );
      result.primaryIp = getPrimaryIp(formattedInterfaces);
      result.network = {
        interfaces: formattedInterfaces,
      };
    }

    console.log("System information collected successfully");
    return result;
  } catch (error) {
    console.error("Error scanning system information:", error);
    throw error;
  }
}

export {
  scanHostname_IPs,
  collectSystemData,
  formatNetworkInterfaces,
  getPrimaryIp,
};
