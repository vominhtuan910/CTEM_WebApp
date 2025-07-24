import express from "express";
import path from "path";
import fs from "fs";
import {
  parseScanResults,
  saveScanResults,
} from "../services/parserService/index.js";

const router = express.Router();

// Parse scan results
router.post("/parse", async (req, res) => {
  try {
    const { scanId, scanFile } = req.body;

    // Validate inputs
    if (!scanId && !scanFile) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "Either scanId or scanFile must be provided",
      });
    }

    let scanResults;

    // If scanId is provided, look up the scan results file
    if (scanId) {
      const scanDir = path.join(req.dirs.scansDir, scanId);

      if (!fs.existsSync(scanDir)) {
        return res.status(404).json({
          error: "Scan not found",
          details: `No scan found with ID ${scanId}`,
        });
      }

      // Look for the unified scan results file
      const unifiedScanFile = fs
        .readdirSync(scanDir)
        .find((file) => file.startsWith("unified_scan_"));

      if (!unifiedScanFile) {
        return res.status(404).json({
          error: "Scan file not found",
          details: `No unified scan file found for scan ID ${scanId}`,
        });
      }

      // Read the scan results
      const scanFilePath = path.join(scanDir, unifiedScanFile);
      scanResults = JSON.parse(fs.readFileSync(scanFilePath, "utf8"));
    }
    // If scanFile is provided, read it directly
    else if (scanFile) {
      // Check if file exists
      if (!fs.existsSync(scanFile)) {
        return res.status(404).json({
          error: "File not found",
          details: `File ${scanFile} does not exist`,
        });
      }

      // Read the scan results
      scanResults = JSON.parse(fs.readFileSync(scanFile, "utf8"));
    }

    // Parse the scan results
    const parsedResults = await parseScanResults(scanResults);

    res.json({
      success: true,
      parsedResults,
    });
  } catch (error) {
    console.error("Error parsing scan results:", error);
    res
      .status(500)
      .json({ error: "Failed to parse scan results", details: error.message });
  }
});

// Parse scan results and save to database
router.post("/save", async (req, res) => {
  try {
    const { scanId, scanFile, assetId } = req.body;

    // Validate inputs
    if (!scanId && !scanFile) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "Either scanId or scanFile must be provided",
      });
    }

    let scanResults;

    // If scanId is provided, look up the scan results file
    if (scanId) {
      const scanDir = path.join(req.dirs.scansDir, scanId);

      if (!fs.existsSync(scanDir)) {
        return res.status(404).json({
          error: "Scan not found",
          details: `No scan found with ID ${scanId}`,
        });
      }

      // Look for the unified scan results file
      const unifiedScanFile = fs
        .readdirSync(scanDir)
        .find((file) => file.startsWith("unified_scan_"));

      if (!unifiedScanFile) {
        return res.status(404).json({
          error: "Scan file not found",
          details: `No unified scan file found for scan ID ${scanId}`,
        });
      }

      // Read the scan results
      const scanFilePath = path.join(scanDir, unifiedScanFile);
      scanResults = JSON.parse(fs.readFileSync(scanFilePath, "utf8"));
    }
    // If scanFile is provided, read it directly
    else if (scanFile) {
      // Check if file exists
      if (!fs.existsSync(scanFile)) {
        return res.status(404).json({
          error: "File not found",
          details: `File ${scanFile} does not exist`,
        });
      }

      // Read the scan results
      scanResults = JSON.parse(fs.readFileSync(scanFile, "utf8"));
    }

    // Parse the scan results
    const parsedResults = await parseScanResults(scanResults);

    // Save to database
    const savedAsset = await saveScanResults(parsedResults, assetId);

    res.json({
      success: true,
      message: assetId
        ? "Asset updated with scan results"
        : "New asset created from scan results",
      asset: savedAsset,
    });
  } catch (error) {
    console.error("Error saving scan results to database:", error);
    res.status(500).json({
      error: "Failed to save scan results to database",
      details: error.message,
    });
  }
});

export default router;
