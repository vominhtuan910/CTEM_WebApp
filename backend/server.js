import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes
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

// Import modules
import { scanPorts } from "./modules/scanPorts.js";
import { scanSocket } from "./modules/scanSocket.js";
import { scanHostname_IPs } from "./modules/hostnameAndIP.js";

// API endpoints for scanning
app.post("/api/scan/start", async (req, res) => {
  const { target } = req.body;

  if (!target) {
    return res.status(400).json({ error: "Target IP or hostname is required" });
  }

  try {
    // Run all scans in parallel
    const scanPromises = [scanPorts(target), scanSocket(), scanHostname_IPs()];

    // Wait for all scans to complete
    await Promise.all(scanPromises);

    res.json({
      success: true,
      message: "All scans completed successfully",
      target: target,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: "Failed to complete scan" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
