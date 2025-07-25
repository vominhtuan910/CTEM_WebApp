import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Import database manager
import { startDatabase, stopDatabase } from "./services/databaseManager.js";

// Import Prisma client
import prisma from "./database/prisma.js";

// Import routes
import assetRoutes from "../routes/assetRoutes.js";
import scanRoutes from "../routes/scanRoutes.js";
import parserRoutes from "../routes/parserRoutes.js";
import reportRoutes from "../routes/reportRoutes.js";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure necessary directories exist
const ensureDirectories = () => {
  const outputDir = path.join(process.cwd(), "output");
  const reportsDir = path.join(outputDir, "reports");
  const scansDir = path.join(outputDir, "scans");

  fs.ensureDirSync(outputDir);
  fs.ensureDirSync(reportsDir);
  fs.ensureDirSync(scansDir);

  return { outputDir, reportsDir, scansDir };
};

// Create required directories
const { outputDir, reportsDir, scansDir } = ensureDirectories();

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

// Make output directories available to routes
app.use((req, res, next) => {
  req.dirs = { outputDir, reportsDir, scansDir };
  next();
});

// API Routes
app.use("/api/assets", assetRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/parser", parserRoutes);
app.use("/api/reports", reportRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date(),
  });
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

// Start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default app;
