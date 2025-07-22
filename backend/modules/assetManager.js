import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSETS_FILE = path.join(__dirname, "../output/assets.json");

// Ensure the output directory exists
fs.ensureDirSync(path.join(__dirname, "../output"));

class AssetManager {
  constructor() {
    this.assets = [];
    this.loadAssets();
  }

  loadAssets() {
    try {
      if (fs.existsSync(ASSETS_FILE)) {
        const data = fs.readFileSync(ASSETS_FILE, "utf8");
        this.assets = JSON.parse(data);
        console.log(`Loaded ${this.assets.length} assets from ${ASSETS_FILE}`);
      } else {
        this.assets = [];
        this.saveAssets();
        console.log(`Created new assets file at ${ASSETS_FILE}`);
      }
    } catch (error) {
      console.error(`Error loading assets: ${error.message}`);
      this.assets = [];
    }
  }

  saveAssets() {
    try {
      fs.writeFileSync(ASSETS_FILE, JSON.stringify(this.assets, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving assets: ${error.message}`);
      return false;
    }
  }

  getAllAssets(filters = {}) {
    let filteredAssets = [...this.assets];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAssets = filteredAssets.filter(
        (asset) =>
          asset.hostname.toLowerCase().includes(searchTerm) ||
          asset.ipAddress.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filteredAssets = filteredAssets.filter((asset) =>
        filters.status.includes(asset.status)
      );
    }

    // Apply OS type filter
    if (filters.osType && filters.osType.length > 0) {
      filteredAssets = filteredAssets.filter((asset) =>
        filters.osType.includes(asset.os.name)
      );
    }

    return filteredAssets;
  }

  getAssetById(id) {
    return this.assets.find((asset) => asset.id === id) || null;
  }

  getAssetByIp(ipAddress) {
    return this.assets.find((asset) => asset.ipAddress === ipAddress) || null;
  }

  getAssetByHostname(hostname) {
    return this.assets.find((asset) => asset.hostname === hostname) || null;
  }

  createAsset(assetData) {
    const newAsset = {
      ...assetData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      lastScan: assetData.lastScan || new Date().toISOString(),
      status: assetData.status || "active",
      services: assetData.services || [],
      applications: assetData.applications || [],
      healthScore: assetData.healthScore || 100,
      issuesCount: assetData.issuesCount || 0,
      labels: assetData.labels || [],
    };

    this.assets.push(newAsset);
    this.saveAssets();
    return newAsset;
  }

  updateAsset(id, assetData) {
    const index = this.assets.findIndex((asset) => asset.id === id);
    if (index === -1) return null;

    // Update the asset with new data while preserving the id and creation date
    const updatedAsset = {
      ...this.assets[index],
      ...assetData,
      id, // Preserve the original ID
      createdAt: this.assets[index].createdAt, // Preserve the creation date
      lastUpdated: new Date().toISOString(), // Add last updated timestamp
    };

    this.assets[index] = updatedAsset;
    this.saveAssets();
    return updatedAsset;
  }

  deleteAsset(id) {
    const initialLength = this.assets.length;
    this.assets = this.assets.filter((asset) => asset.id !== id);

    if (this.assets.length < initialLength) {
      this.saveAssets();
      return true;
    }
    return false;
  }

  updateFromScan(scanData) {
    // Check if asset with this IP already exists
    let asset = this.getAssetByIp(scanData.ipAddress);

    if (!asset) {
      // Check if asset with this hostname exists
      asset = this.getAssetByHostname(scanData.hostname);
    }

    if (asset) {
      // Update existing asset
      return this.updateAsset(asset.id, {
        ...scanData,
        lastScan: new Date().toISOString(),
        // Merge services rather than replacing them
        services: [
          ...scanData.services,
          ...asset.services.filter(
            (existingService) =>
              !scanData.services.some(
                (newService) =>
                  newService.name === existingService.name &&
                  newService.port === existingService.port
              )
          ),
        ],
        // Keep existing applications if not provided in scan data
        applications: scanData.applications?.length
          ? scanData.applications
          : asset.applications,
      });
    } else {
      // Create new asset
      return this.createAsset({
        ...scanData,
        lastScan: new Date().toISOString(),
      });
    }
  }

  getAvailableOsTypes() {
    const osTypes = new Set();
    this.assets.forEach((asset) => {
      if (asset.os && asset.os.name) {
        osTypes.add(asset.os.name);
      }
    });
    return Array.from(osTypes);
  }
}

// Create singleton instance
const assetManager = new AssetManager();
export default assetManager;
