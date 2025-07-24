const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Path to asset store
const assetsFilePath = path.join(__dirname, "..", "output", "assets.json");

// Initialize assets array
let assets = [];

// Load assets from file if exists
try {
  if (fs.existsSync(assetsFilePath)) {
    const data = fs.readFileSync(assetsFilePath, "utf8");
    assets = JSON.parse(data);
  }
} catch (error) {
  console.error("Error loading assets file:", error.message);
}

// Save assets to file
function saveAssets() {
  try {
    fs.writeFileSync(assetsFilePath, JSON.stringify(assets, null, 2));
  } catch (error) {
    console.error("Error saving assets file:", error.message);
  }
}

// Get all assets
function getAllAssets() {
  return assets;
}

// Get asset by ID
function getAssetById(id) {
  return assets.find((asset) => asset.id === id);
}

// Create new asset
function createAsset(assetData) {
  const newAsset = {
    id: assetData.id || uuidv4(),
    ...assetData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assets.push(newAsset);
  saveAssets();

  return newAsset;
}

// Update asset
function updateAsset(id, assetData) {
  const index = assets.findIndex((asset) => asset.id === id);

  if (index === -1) {
    throw new Error(`Asset with ID ${id} not found`);
  }

  assets[index] = {
    ...assets[index],
    ...assetData,
    updatedAt: new Date(),
  };

  saveAssets();

  return assets[index];
}

// Delete asset
function deleteAsset(id) {
  const index = assets.findIndex((asset) => asset.id === id);

  if (index === -1) {
    throw new Error(`Asset with ID ${id} not found`);
  }

  assets.splice(index, 1);
  saveAssets();

  return { success: true };
}

// Update or create asset from scan results
function updateFromScan(scanData) {
  const { hostname, ipAddress } = scanData;

  // Try to find existing asset by hostname or IP
  let asset = assets.find(
    (a) => a.hostname === hostname || a.ipAddress === ipAddress
  );

  if (asset) {
    // Update existing asset
    return updateAsset(asset.id, {
      ...scanData,
      lastScan: new Date(),
    });
  } else {
    // Create new asset
    return createAsset({
      ...scanData,
      lastScan: new Date(),
    });
  }
}

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateFromScan,
};
