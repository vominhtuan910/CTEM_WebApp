import express from "express";
import {
  getDefectDojoConfig,
  createDefectDojoConfig,
  updateDefectDojoConfig,
  testDefectDojoConnection,
  getDefectDojoProducts,
  getDefectDojoEngagements,
  createDefectDojoProduct,
  createDefectDojoEngagement,
  importScanToDefectDojo,
  getAssetFindingsFromDefectDojo,
  syncVulnerabilitiesFromDefectDojo,
} from "../services/defectDojoService/index.js";

const router = express.Router();

// Get DefectDojo configuration
router.get("/config", async (req, res) => {
  try {
    const config = await getDefectDojoConfig();

    // Remove sensitive data (API key)
    const safeConfig = {
      ...config,
      apiKey: "********", // Hide actual API key
    };

    res.json(safeConfig);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "DefectDojo configuration not found" });
    } else {
      console.error("Error retrieving DefectDojo configuration:", error);
      res
        .status(500)
        .json({
          error: "Failed to retrieve DefectDojo configuration",
          details: error.message,
        });
    }
  }
});

// Create DefectDojo configuration
router.post("/config", async (req, res) => {
  try {
    const config = await createDefectDojoConfig(req.body);

    // Remove sensitive data (API key)
    const safeConfig = {
      ...config,
      apiKey: "********", // Hide actual API key
    };

    res.status(201).json(safeConfig);
  } catch (error) {
    console.error("Error creating DefectDojo configuration:", error);
    res
      .status(500)
      .json({
        error: "Failed to create DefectDojo configuration",
        details: error.message,
      });
  }
});

// Update DefectDojo configuration
router.put("/config/:id", async (req, res) => {
  try {
    const config = await updateDefectDojoConfig(req.params.id, req.body);

    // Remove sensitive data (API key)
    const safeConfig = {
      ...config,
      apiKey: "********", // Hide actual API key
    };

    res.json(safeConfig);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "DefectDojo configuration not found" });
    } else {
      console.error("Error updating DefectDojo configuration:", error);
      res
        .status(500)
        .json({
          error: "Failed to update DefectDojo configuration",
          details: error.message,
        });
    }
  }
});

// Test DefectDojo connection
router.post("/test-connection", async (req, res) => {
  try {
    // Use provided config or get from database
    const config = req.body.config;
    const result = await testDefectDojoConnection(config);

    res.json(result);
  } catch (error) {
    console.error("Error testing DefectDojo connection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test DefectDojo connection",
      details: error.message,
    });
  }
});

// Get DefectDojo products
router.get("/products", async (req, res) => {
  try {
    const products = await getDefectDojoProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching DefectDojo products:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch DefectDojo products",
        details: error.message,
      });
  }
});

// Get DefectDojo engagements for a product
router.get("/engagements", async (req, res) => {
  try {
    const productId = req.query.productId;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const engagements = await getDefectDojoEngagements(productId);
    res.json(engagements);
  } catch (error) {
    console.error("Error fetching DefectDojo engagements:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch DefectDojo engagements",
        details: error.message,
      });
  }
});

// Create DefectDojo product
router.post("/products", async (req, res) => {
  try {
    const product = await createDefectDojoProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating DefectDojo product:", error);
    res
      .status(500)
      .json({
        error: "Failed to create DefectDojo product",
        details: error.message,
      });
  }
});

// Create DefectDojo engagement
router.post("/engagements", async (req, res) => {
  try {
    const engagement = await createDefectDojoEngagement(req.body);
    res.status(201).json(engagement);
  } catch (error) {
    console.error("Error creating DefectDojo engagement:", error);
    res
      .status(500)
      .json({
        error: "Failed to create DefectDojo engagement",
        details: error.message,
      });
  }
});

// Import scan results to DefectDojo
router.post("/import-scan", async (req, res) => {
  try {
    const importData = req.body;

    if (!importData.engagementId) {
      return res.status(400).json({ error: "Engagement ID is required" });
    }

    if (!importData.assetId && !importData.scanFile) {
      return res
        .status(400)
        .json({ error: "Either assetId or scanFile is required" });
    }

    const result = await importScanToDefectDojo(importData);
    res.json(result);
  } catch (error) {
    console.error("Error importing scan to DefectDojo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to import scan to DefectDojo",
      details: error.message,
    });
  }
});

// Get findings from DefectDojo for an asset
router.get("/assets/:assetId/findings", async (req, res) => {
  try {
    const findings = await getAssetFindingsFromDefectDojo(req.params.assetId);
    res.json(findings);
  } catch (error) {
    console.error("Error fetching DefectDojo findings for asset:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch DefectDojo findings",
        details: error.message,
      });
  }
});

// Sync vulnerabilities from DefectDojo
router.post("/assets/:assetId/sync", async (req, res) => {
  try {
    const result = await syncVulnerabilitiesFromDefectDojo(req.params.assetId);
    res.json(result);
  } catch (error) {
    console.error("Error syncing vulnerabilities from DefectDojo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync vulnerabilities from DefectDojo",
      details: error.message,
    });
  }
});

export default router;
