import express from "express";
import {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../services/assetService/index.js";

const router = express.Router();

// Get all assets
router.get("/", async (req, res) => {
  try {
    const options = {
      search: req.query.search,
      status: req.query.status,
      labels: req.query.labels ? req.query.labels.split(",") : undefined,
    };

    const assets = await getAllAssets(options);
    res.json(assets);
  } catch (error) {
    console.error("Error retrieving assets:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve assets", details: error.message });
  }
});

// Get asset by ID
router.get("/:id", async (req, res) => {
  try {
    const asset = await getAssetById(req.params.id);
    res.json(asset);
  } catch (error) {
    if (error.message.includes("not found")) {
      res
        .status(404)
        .json({ error: "Asset not found", details: error.message });
    } else {
      console.error(`Error retrieving asset ${req.params.id}:`, error);
      res
        .status(500)
        .json({ error: "Failed to retrieve asset", details: error.message });
    }
  }
});

// Create new asset
router.post("/", async (req, res) => {
  try {
    const asset = await createAsset(req.body);
    res.status(201).json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res
      .status(500)
      .json({ error: "Failed to create asset", details: error.message });
  }
});

// Update asset
router.put("/:id", async (req, res) => {
  try {
    const asset = await updateAsset(req.params.id, req.body);
    res.json(asset);
  } catch (error) {
    if (error.message.includes("not found")) {
      res
        .status(404)
        .json({ error: "Asset not found", details: error.message });
    } else {
      console.error(`Error updating asset ${req.params.id}:`, error);
      res
        .status(500)
        .json({ error: "Failed to update asset", details: error.message });
    }
  }
});

// Delete asset
router.delete("/:id", async (req, res) => {
  try {
    await deleteAsset(req.params.id);
    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) {
      res
        .status(404)
        .json({ error: "Asset not found", details: error.message });
    } else {
      console.error(`Error deleting asset ${req.params.id}:`, error);
      res
        .status(500)
        .json({ error: "Failed to delete asset", details: error.message });
    }
  }
});

export default router;
