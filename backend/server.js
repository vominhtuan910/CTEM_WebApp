import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure output directory exists
const ensureOutputDir = () => {
  const outputDir = join(__dirname, "output");
  fs.ensureDirSync(outputDir);
  return outputDir;
};

// Create output directory
ensureOutputDir();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Import modules
import { scanPorts } from "./modules/scanPorts.js";
import { scanSocket } from "./modules/scanSocket.js";
import { scanHostname_IPs } from "./modules/hostnameAndIP.js";
import {
  runUnifiedScan,
  getLatestScanResults,
} from "./modules/unifiedScanner.js";
import assetManager from "./modules/assetManager.js";

// Basic scan endpoints (legacy)
app.get("/api/scan/ports", async (req, res) => {
  try {
    const data = await fs.readFile(
      join(__dirname, "output", "ports_output.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading port scan data:", error);
    res.status(500).json({ error: "Failed to retrieve port scan data" });
  }
});

app.get("/api/scan/sockets", async (req, res) => {
  try {
    const data = await fs.readFile(
      join(__dirname, "output", "sockets_output.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading socket data:", error);
    res.status(500).json({ error: "Failed to retrieve socket data" });
  }
});

app.get("/api/scan/system", async (req, res) => {
  try {
    const data = await fs.readFile(
      join(__dirname, "output", "kali_info.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading system info data:", error);
    res.status(500).json({ error: "Failed to retrieve system information" });
  }
});

// API endpoints for scanning
app.post("/api/scan/start", async (req, res) => {
  const { target = "127.0.0.1" } = req.body;

  try {
    // Run unified scan
    const assetData = await runUnifiedScan(target);

    // Update or create asset in the asset manager
    const asset = assetManager.updateFromScan(assetData);

    res.json({
      success: true,
      message: "Scan completed successfully",
      target: target,
      asset: asset,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Scan error:", error);
    res
      .status(500)
      .json({ error: "Failed to complete scan: " + error.message });
  }
});

// Get latest scan results
app.get("/api/scan/latest", async (req, res) => {
  try {
    const scanResults = await getLatestScanResults();

    if (!scanResults) {
      return res.status(404).json({ error: "No scan results found" });
    }

    res.json(scanResults);
  } catch (error) {
    console.error("Error retrieving latest scan results:", error);
    res.status(500).json({ error: "Failed to retrieve latest scan results" });
  }
});

// Asset API endpoints
app.get("/api/assets", (req, res) => {
  try {
    // Extract filter parameters
    const { search, status, osType } = req.query;

    // Build filter object
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = Array.isArray(status) ? status : [status];
    if (osType) filters.osType = Array.isArray(osType) ? osType : [osType];

    // Get assets with filters
    const assets = assetManager.getAllAssets(filters);

    res.json(assets);
  } catch (error) {
    console.error("Error retrieving assets:", error);
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
});

app.get("/api/assets/os-types", (req, res) => {
  try {
    const osTypes = assetManager.getAvailableOsTypes();
    res.json(osTypes);
  } catch (error) {
    console.error("Error retrieving OS types:", error);
    res.status(500).json({ error: "Failed to retrieve OS types" });
  }
});

app.get("/api/assets/:id", (req, res) => {
  try {
    const asset = assetManager.getAssetById(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(asset);
  } catch (error) {
    console.error("Error retrieving asset:", error);
    res.status(500).json({ error: "Failed to retrieve asset" });
  }
});

app.post("/api/assets", (req, res) => {
  try {
    const newAsset = assetManager.createAsset(req.body);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

app.put("/api/assets/:id", (req, res) => {
  try {
    const updatedAsset = assetManager.updateAsset(req.params.id, req.body);

    if (!updatedAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

app.delete("/api/assets/:id", (req, res) => {
  try {
    const deleted = assetManager.deleteAsset(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
