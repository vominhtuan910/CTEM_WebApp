import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import morgan from "morgan";
import dotenv from "dotenv";

// Import database manager (still using for Docker container management)
import { startDatabase, stopDatabase } from "./utils/databaseManager.js";

// Import Prisma client
import prisma from "./utils/prisma.js";

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import asset formatter
import {
  formatAssetForFrontend,
  formatAssetsForFrontend,
} from "./utils/assetFormatter.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure output directory exists
const ensureOutputDir = () => {
  const outputDir = path.join(__dirname, "output");
  fs.ensureDirSync(outputDir);
  return outputDir;
};

// Create output directory
ensureOutputDir();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Import modules
import {
  runUnifiedScan,
  getLatestScanResults,
  checkWSL,
} from "./modules/unifiedScanner.js";
import {
  scanResultsToAsset,
  extractServices,
  extractApplications,
} from "./modules/utils/formatters.js";

// API endpoints for scanning
app.post("/api/scan/start", async (req, res) => {
  try {
    // Always scan localhost/current system
    console.log("Starting scan of local system");

    // Run unified scan
    const scanData = await runUnifiedScan();

    try {
      // Check if asset with this hostname already exists
      const existingAsset = await prisma.asset.findFirst({
        where: {
          hostname: scanData.asset.hostname,
        },
      });

      let asset;

      if (existingAsset) {
        // Update existing asset
        asset = await prisma.asset.update({
          where: { id: existingAsset.id },
          data: {
            name: scanData.asset.name,
            ipAddress: scanData.asset.ipAddress,
            ipAddresses: scanData.asset.ipAddresses,
            status: "active",
            lastScan: scanData.asset.lastScan
              ? new Date(scanData.asset.lastScan)
              : new Date(),
            healthScore: scanData.asset.healthScore,
            issuesCount: scanData.asset.issuesCount,
            labels: scanData.asset.labels,
            osName: scanData.asset.osName,
            osVersion: scanData.asset.osVersion,
            osArchitecture: scanData.asset.osArchitecture,
            osBuildNumber: scanData.asset.osBuildNumber,
            osLastBootTime: scanData.asset.osLastBootTime
              ? new Date(scanData.asset.osLastBootTime)
              : null,
          },
        });

        // Remove existing services for this asset
        await prisma.service.deleteMany({
          where: { assetId: asset.id },
        });

        // Remove existing applications for this asset
        await prisma.application.deleteMany({
          where: { assetId: asset.id },
        });
      } else {
        // Create new asset
        asset = await prisma.asset.create({
          data: {
            hostname: scanData.asset.hostname,
            name: scanData.asset.name,
            ipAddress: scanData.asset.ipAddress,
            ipAddresses: scanData.asset.ipAddresses,
            status: "active",
            lastScan: scanData.asset.lastScan
              ? new Date(scanData.asset.lastScan)
              : new Date(),
            healthScore: scanData.asset.healthScore,
            issuesCount: scanData.asset.issuesCount,
            labels: scanData.asset.labels,
            osName: scanData.asset.osName,
            osVersion: scanData.asset.osVersion,
            osArchitecture: scanData.asset.osArchitecture,
            osBuildNumber: scanData.asset.osBuildNumber,
            osLastBootTime: scanData.asset.osLastBootTime
              ? new Date(scanData.asset.osLastBootTime)
              : null,
            confidentiality: scanData.asset.confidentiality || 1,
            integrity: scanData.asset.integrity || 1,
            availability: scanData.asset.availability || 1,
            department: scanData.asset.department || "",
            location: scanData.asset.location || "",
            owner: scanData.asset.owner || "",
          },
        });
      }

      // Extract services from scan data
      const services = extractServices(
        scanData.scanResults.ports
          ? { openPorts: scanData.scanResults.ports }
          : null,
        scanData.scanResults.detailedScan
      );

      // Add new services
      if (services.length > 0) {
        await Promise.all(
          services.map((service) =>
            prisma.service.create({
              data: {
                ...service,
                assetId: asset.id,
              },
            })
          )
        );
      }

      // Extract applications from scan data
      const applications = extractApplications(
        scanData.scanResults.detailedScan
      );

      // Add new applications
      if (applications.length > 0) {
        await Promise.all(
          applications.map((app) =>
            prisma.application.create({
              data: {
                ...app,
                installDate: app.installDate ? new Date(app.installDate) : null,
                assetId: asset.id,
              },
            })
          )
        );
      }

      // Get the complete asset with associations
      const completeAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
        include: {
          services: true,
          applications: true,
        },
      });

      // Format the asset for the frontend
      const formattedAsset = formatAssetForFrontend(completeAsset);

      res.json({
        success: true,
        message: "Scan completed successfully",
        asset: formattedAsset,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving scan data:", error);
      throw error;
    }
  } catch (error) {
    console.error("Scan error:", error);
    res
      .status(500)
      .json({ error: "Failed to complete scan", details: error.message });
  }
});

// API endpoint to check scanning tools status
app.get("/api/scan/status", async (req, res) => {
  try {
    // Check if WSL is available (for Windows systems)
    const wslAvailable = await checkWSL();

    // Get system platform
    const platform = process.platform;

    // Check if necessary scan tools are installed
    const { checkNmapInstalled } = await import("./modules/scanPorts.js");
    const nmapInstalled = await checkNmapInstalled();

    let lynisStatus = "not_applicable";
    if (platform !== "win32" || wslAvailable) {
      const { checkLynisInstalled } = await import("./modules/lynisScan.js");
      const lynisInstalled = await checkLynisInstalled();
      lynisStatus = lynisInstalled ? "installed" : "not_installed";
    }

    // For Windows, PowerShell should always be available
    const powershellStatus =
      platform === "win32" ? "available" : "not_applicable";

    // Check if NmapScan module can be used
    let nmapModuleStatus = "available";
    try {
      const { runNmap } = await import("./modules/NmapScan.js");
      // Don't actually run it, just check if module is available
    } catch (error) {
      nmapModuleStatus = "not_available";
    }

    res.json({
      platform,
      scanTools: {
        nmap: nmapInstalled ? "installed" : "not_installed",
        lynis: lynisStatus,
        powershell: powershellStatus,
        wsl: wslAvailable ? "available" : "not_available",
        nmapModule: nmapModuleStatus,
      },
    });
  } catch (error) {
    console.error("Error checking scan tools status:", error);
    res.status(500).json({ error: "Failed to check scan tools status" });
  }
});

// Asset API endpoints - Using Prisma
app.get("/api/assets", async (req, res) => {
  try {
    const { search, status } = req.query;

    // Build where clause based on query parameters
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { hostname: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        services: true,
        applications: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the assets for the frontend
    const formattedAssets = formatAssetsForFrontend(assets);

    res.json(formattedAssets);
  } catch (error) {
    console.error("Error retrieving assets:", error);
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
});

app.get("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        services: true,
        applications: true,
      },
    });

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Format the asset for the frontend
    const formattedAsset = formatAssetForFrontend(asset);

    res.json(formattedAsset);
  } catch (error) {
    console.error("Error retrieving asset:", error);
    res.status(500).json({ error: "Failed to retrieve asset" });
  }
});

app.post("/api/assets", async (req, res) => {
  try {
    const assetData = req.body;

    // Convert date strings to Date objects
    if (assetData.lastScan) {
      assetData.lastScan = new Date(assetData.lastScan);
    }
    if (assetData.osLastBootTime) {
      assetData.osLastBootTime = new Date(assetData.osLastBootTime);
    }

    // Create asset with nested services and applications
    const asset = await prisma.asset.create({
      data: {
        hostname: assetData.hostname,
        name: assetData.name,
        ipAddress: assetData.ipAddress,
        ipAddresses: assetData.ipAddresses || [],
        status: assetData.status || "active",
        lastScan: assetData.lastScan,
        healthScore: assetData.healthScore,
        issuesCount: assetData.issuesCount || 0,
        labels: assetData.labels || [],
        agentStatus: assetData.agentStatus || "not_installed",
        osName: assetData.osName,
        osVersion: assetData.osVersion,
        osArchitecture: assetData.osArchitecture,
        osBuildNumber: assetData.osBuildNumber,
        osLastBootTime: assetData.osLastBootTime,
        confidentiality: assetData.confidentiality || 1,
        integrity: assetData.integrity || 1,
        availability: assetData.availability || 1,
        department: assetData.department || "",
        location: assetData.location || "",
        owner: assetData.owner || "",
        services: {
          create:
            assetData.services?.map((service) => ({
              name: service.name,
              displayName: service.displayName,
              status: service.status,
              port: service.port,
              protocol: service.protocol,
              version: service.version,
              description: service.description,
            })) || [],
        },
        applications: {
          create:
            assetData.applications?.map((app) => ({
              name: app.name,
              version: app.version,
              publisher: app.publisher,
              installDate: app.installDate ? new Date(app.installDate) : null,
              type: app.type,
              description: app.description,
              path: app.path,
            })) || [],
        },
      },
      include: {
        services: true,
        applications: true,
      },
    });

    // Format the asset for the frontend
    const formattedAsset = formatAssetForFrontend(asset);

    res.status(201).json(formattedAsset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res
      .status(500)
      .json({ error: "Failed to create asset", details: error.message });
  }
});

app.put("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assetData = req.body;

    // Convert date strings to Date objects
    if (assetData.lastScan) {
      assetData.lastScan = new Date(assetData.lastScan);
    }
    if (assetData.osLastBootTime) {
      assetData.osLastBootTime = new Date(assetData.osLastBootTime);
    }

    // Update the asset (without nested relations for now)
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        hostname: assetData.hostname,
        name: assetData.name,
        ipAddress: assetData.ipAddress,
        ipAddresses: assetData.ipAddresses || [],
        status: assetData.status,
        lastScan: assetData.lastScan,
        healthScore: assetData.healthScore,
        issuesCount: assetData.issuesCount,
        labels: assetData.labels,
        agentStatus: assetData.agentStatus,
        osName: assetData.osName,
        osVersion: assetData.osVersion,
        osArchitecture: assetData.osArchitecture,
        osBuildNumber: assetData.osBuildNumber,
        osLastBootTime: assetData.osLastBootTime,
        confidentiality: assetData.confidentiality,
        integrity: assetData.integrity,
        availability: assetData.availability,
        department: assetData.department,
        location: assetData.location,
        owner: assetData.owner,
      },
      include: {
        services: true,
        applications: true,
      },
    });

    // Handle services updates if provided
    if (assetData.services) {
      // Delete existing services
      await prisma.service.deleteMany({
        where: { assetId: id },
      });

      // Create new services
      if (assetData.services.length > 0) {
        await Promise.all(
          assetData.services.map((service) =>
            prisma.service.create({
              data: {
                name: service.name,
                displayName: service.displayName,
                status: service.status,
                port: service.port,
                protocol: service.protocol,
                version: service.version,
                description: service.description,
                assetId: id,
              },
            })
          )
        );
      }
    }

    // Handle applications updates if provided
    if (assetData.applications) {
      // Delete existing applications
      await prisma.application.deleteMany({
        where: { assetId: id },
      });

      // Create new applications
      if (assetData.applications.length > 0) {
        await Promise.all(
          assetData.applications.map((app) =>
            prisma.application.create({
              data: {
                name: app.name,
                version: app.version,
                publisher: app.publisher,
                installDate: app.installDate ? new Date(app.installDate) : null,
                type: app.type,
                description: app.description,
                path: app.path,
                assetId: id,
              },
            })
          )
        );
      }
    }

    // Fetch the updated asset with the new relations
    const refreshedAsset = await prisma.asset.findUnique({
      where: { id },
      include: {
        services: true,
        applications: true,
      },
    });

    // Format the asset for the frontend
    const formattedAsset = formatAssetForFrontend(refreshedAsset);

    res.json(formattedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    res
      .status(500)
      .json({ error: "Failed to update asset", details: error.message });
  }
});

app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the asset (related services/applications will be cascade deleted)
    await prisma.asset.delete({
      where: { id },
    });

    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// DefectDojo integration endpoints
app.get("/api/defectdojo/config", async (req, res) => {
  try {
    const config = await prisma.defectDojoIntegration.findFirst({
      where: { active: true },
    });

    res.json(config || { active: false });
  } catch (error) {
    console.error("Error retrieving DefectDojo configuration:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve DefectDojo configuration" });
  }
});

app.post("/api/defectdojo/config", async (req, res) => {
  try {
    const config = await prisma.defectDojoIntegration.create({
      data: req.body,
    });
    res.status(201).json(config);
  } catch (error) {
    console.error("Error creating DefectDojo configuration:", error);
    res
      .status(500)
      .json({ error: "Failed to create DefectDojo configuration" });
  }
});

app.put("/api/defectdojo/config/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await prisma.defectDojoIntegration.updateMany({
      where: { id },
      data: req.body,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: "DefectDojo configuration not found" });
    }

    const updatedConfig = await prisma.defectDojoIntegration.findUnique({
      where: { id },
    });
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating DefectDojo configuration:", error);
    res
      .status(500)
      .json({ error: "Failed to update DefectDojo configuration" });
  }
});

// Start the server with database connection
const startServer = async () => {
  try {
    // Start the database container (Docker)
    await startDatabase();

    // Verify Prisma connection
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL database via Prisma");

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Handle graceful shutdown
    const handleShutdown = async () => {
      console.log("🛑 Shutting down server...");
      server.close(() => {
        console.log("Express server closed.");
      });

      try {
        // Disconnect Prisma client
        await prisma.$disconnect();
        console.log("Prisma client disconnected.");

        // Stop the database container
        await stopDatabase();
        console.log("Database container stopped.");

        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    // Listen for shutdown signals
    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);

    return server;
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Start the server
startServer();
