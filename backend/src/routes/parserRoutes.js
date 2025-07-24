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
    console.log("Parse request received for scan ID:", scanId);

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
      // Set possible locations where scan files might be stored
      const possibleLocations = [
        // Main scans directory with direct file
        {
          path: path.join(req.dirs.scansDir, `scan_report_${scanId}.json`),
          description: "Main scan directory",
        },
        // Scan ID subdirectory with matching file
        {
          path: path.join(
            req.dirs.scansDir,
            scanId,
            `scan_report_${scanId}.json`
          ),
          description: "Scan ID subdirectory",
        },
        // Output/scans directory with direct file
        {
          path: path.join(
            process.cwd(),
            "output",
            "scans",
            `scan_report_${scanId}.json`
          ),
          description: "Output scans directory",
        },
        // Output/scans with ID subdirectory
        {
          path: path.join(
            process.cwd(),
            "output",
            "scans",
            scanId,
            `scan_report_${scanId}.json`
          ),
          description: "Output scans ID subdirectory",
        },
      ];

      let scanFilePath = null;
      let foundLocation = null;

      // Try each possible location
      for (const location of possibleLocations) {
        console.log(
          `Checking for scan file in ${location.description}: ${location.path}`
        );
        if (fs.existsSync(location.path)) {
          scanFilePath = location.path;
          foundLocation = location.description;
          break;
        }
      }

      // If direct file not found, look in directories for any scan report
      if (!scanFilePath) {
        const possibleDirs = [
          { path: req.dirs.scansDir, description: "Main scans directory" },
          {
            path: path.join(req.dirs.scansDir, scanId),
            description: "Scan ID subdirectory",
          },
          {
            path: path.join(process.cwd(), "output", "scans"),
            description: "Output scans directory",
          },
          {
            path: path.join(process.cwd(), "output", "scans", scanId),
            description: "Output scans ID subdirectory",
          },
        ];

        for (const dir of possibleDirs) {
          if (fs.existsSync(dir.path)) {
            console.log(
              `Searching for scan reports in ${dir.description}: ${dir.path}`
            );
            try {
              const files = fs
                .readdirSync(dir.path)
                .filter(
                  (file) =>
                    file.endsWith(".json") &&
                    (file.startsWith("scan_report_") ||
                      file.startsWith("unified_scan_"))
                );

              if (files.length > 0) {
                scanFilePath = path.join(dir.path, files[0]);
                foundLocation = `${dir.description} (found file: ${files[0]})`;
                break;
              }
            } catch (err) {
              console.warn(`Error reading directory ${dir.path}:`, err.message);
            }
          }
        }
      }

      if (!scanFilePath) {
        return res.status(404).json({
          error: "Scan not found",
          details: `No scan file found for ID ${scanId} in any of the expected locations`,
        });
      }

      console.log(`Found scan file at ${foundLocation}: ${scanFilePath}`);

      // Read the scan results
      try {
        scanResults = JSON.parse(fs.readFileSync(scanFilePath, "utf8"));
        console.log(
          `Successfully read scan file with keys: ${Object.keys(
            scanResults
          ).join(", ")}`
        );
      } catch (readError) {
        console.error(`Error reading scan file ${scanFilePath}:`, readError);
        return res.status(500).json({
          error: "Error reading scan file",
          details: readError.message,
        });
      }
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
    console.log("Parsing scan results...");
    const parsedResults = await parseScanResults(scanResults);
    console.log("Successfully parsed scan results");

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
    console.log("Save request received for scan ID:", scanId);

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
      // Set possible locations where scan files might be stored
      const possibleLocations = [
        // Main scans directory with direct file
        {
          path: path.join(req.dirs.scansDir, `scan_report_${scanId}.json`),
          description: "Main scan directory",
        },
        // Scan ID subdirectory with matching file
        {
          path: path.join(
            req.dirs.scansDir,
            scanId,
            `scan_report_${scanId}.json`
          ),
          description: "Scan ID subdirectory",
        },
        // Output/scans directory with direct file
        {
          path: path.join(
            process.cwd(),
            "output",
            "scans",
            `scan_report_${scanId}.json`
          ),
          description: "Output scans directory",
        },
        // Output/scans with ID subdirectory
        {
          path: path.join(
            process.cwd(),
            "output",
            "scans",
            scanId,
            `scan_report_${scanId}.json`
          ),
          description: "Output scans ID subdirectory",
        },
      ];

      let scanFilePath = null;
      let foundLocation = null;

      // Try each possible location
      for (const location of possibleLocations) {
        if (fs.existsSync(location.path)) {
          scanFilePath = location.path;
          foundLocation = location.description;
          break;
        }
      }

      // If direct file not found, look in directories for any scan report
      if (!scanFilePath) {
        const possibleDirs = [
          { path: req.dirs.scansDir, description: "Main scans directory" },
          {
            path: path.join(req.dirs.scansDir, scanId),
            description: "Scan ID subdirectory",
          },
          {
            path: path.join(process.cwd(), "output", "scans"),
            description: "Output scans directory",
          },
          {
            path: path.join(process.cwd(), "output", "scans", scanId),
            description: "Output scans ID subdirectory",
          },
        ];

        for (const dir of possibleDirs) {
          if (fs.existsSync(dir.path)) {
            try {
              const files = fs
                .readdirSync(dir.path)
                .filter(
                  (file) =>
                    file.endsWith(".json") &&
                    (file.startsWith("scan_report_") ||
                      file.startsWith("unified_scan_"))
                );

              if (files.length > 0) {
                scanFilePath = path.join(dir.path, files[0]);
                foundLocation = `${dir.description} (found file: ${files[0]})`;
                break;
              }
            } catch (err) {
              console.warn(`Error reading directory ${dir.path}:`, err.message);
            }
          }
        }
      }

      if (!scanFilePath) {
        return res.status(404).json({
          error: "Scan not found",
          details: `No scan file found for ID ${scanId} in any of the expected locations`,
        });
      }

      console.log(`Found scan file at ${foundLocation}: ${scanFilePath}`);

      // Read the scan results
      try {
        scanResults = JSON.parse(fs.readFileSync(scanFilePath, "utf8"));
      } catch (readError) {
        console.error(`Error reading scan file ${scanFilePath}:`, readError);
        return res.status(500).json({
          error: "Error reading scan file",
          details: readError.message,
        });
      }
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
    console.log("Parsing scan results...");
    const parsedResults = await parseScanResults(scanResults);
    console.log("Successfully parsed scan results");

    // Save to database
    console.log("Saving scan results to database...");
    const savedAsset = await saveScanResults(parsedResults, assetId);
    console.log("Successfully saved scan results to database");

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
