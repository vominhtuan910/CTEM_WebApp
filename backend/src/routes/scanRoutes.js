import express from "express";
import path from "path";
import fs from "fs";
import {
  getScanToolsStatus,
  runScan,
  getScanHistory,
  getScanById,
} from "../services/scanService/index.js";

const router = express.Router();

// Get scan tools status
router.get("/tools", async (req, res) => {
  try {
    const status = await getScanToolsStatus();
    res.json(status);
  } catch (error) {
    console.error("Error checking scan tools status:", error);
    res.status(500).json({
      error: "Failed to check scan tools status",
      details: error.message,
    });
  }
});

// Update the start scan route to handle the simplified options
router.post("/start", async (req, res) => {
  try {
    const {
      target,
      runNmap = true,
      runLynis = true,
      runPowerShell,
      scanOptions = {},
    } = req.body;

    // Transform the simplified scan options from frontend to backend options
    let backendScanOptions = {};

    if (scanOptions.systemScan !== undefined) {
      // System scan includes packages and vulnerabilities
      backendScanOptions.scanPackages = scanOptions.systemScan;
      backendScanOptions.scanVulnerabilities = scanOptions.systemScan;
    }

    if (scanOptions.networkScan !== undefined) {
      // Network scan includes network configuration
      backendScanOptions.scanNetworkConfig = scanOptions.networkScan;
    }

    if (scanOptions.servicesScan !== undefined) {
      // Services scan includes running services
      backendScanOptions.scanServices = scanOptions.servicesScan;
    }

    // Update the backend scan options default for packages
    // Set defaults for options not explicitly set
    backendScanOptions = {
      scanPackages: false, // Changed from true to false
      scanServices: true,
      scanVulnerabilities: true,
      scanNetworkConfig: true,
      quickScan: false,
      ...backendScanOptions,
    };

    const scanId = new Date().toISOString().replace(/[:.]/g, "-");
    const outputDir = path.join(req.dirs.scansDir, scanId);

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const scanConfig = {
      target: target || "localhost",
      runNmap,
      runLynis,
      runPowerShell,
      outputDir,
      // Use the transformed backend options
      ...backendScanOptions,
    };

    console.log("Starting scan with options:", scanConfig);

    // Run scan (this can take some time)
    const scanResults = await runScan(scanConfig);

    // Return scan results to client
    res.json({
      success: true,
      scanId: scanId,
      timestamp: scanResults.timestamp,
      target: scanResults.target,
      scanStatus: scanResults.scanStatus,
      reportFile: scanResults.reportFile,
      errors: scanResults.errors || {}, // Include any errors in the response
    });
  } catch (error) {
    console.error("Error running scan:", error);
    res
      .status(500)
      .json({ error: "Failed to run scan", details: error.message });
  }
});

// Get scan history
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scanHistory = await getScanHistory(req.dirs.scansDir, limit);

    res.json(scanHistory);
  } catch (error) {
    console.error("Error retrieving scan history:", error);
    res.status(500).json({
      error: "Failed to retrieve scan history",
      details: error.message,
    });
  }
});

// Get scan results by ID
router.get("/:scanId", async (req, res) => {
  try {
    const scanResults = await getScanById(req.params.scanId, req.dirs.scansDir);
    res.json(scanResults);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "Scan not found", details: error.message });
    } else {
      console.error(`Error retrieving scan ${req.params.scanId}:`, error);
      res.status(500).json({
        error: "Failed to retrieve scan results",
        details: error.message,
      });
    }
  }
});

// Start scan for a specific asset
router.post("/assets/:assetId", async (req, res) => {
  try {
    // This endpoint would:
    // 1. Get the asset details from the database
    // 2. Run a scan with those details (IP address, etc.)
    // 3. Parse the results
    // 4. Update the asset with the findings

    // This is a placeholder implementation
    res.json({
      success: true,
      message: "Asset scan initiated",
      assetId: req.params.assetId,
      // In a real implementation, this would include scan results or a scan job ID
    });
  } catch (error) {
    console.error(`Error scanning asset ${req.params.assetId}:`, error);
    res
      .status(500)
      .json({ error: "Failed to scan asset", details: error.message });
  }
});

export default router;
