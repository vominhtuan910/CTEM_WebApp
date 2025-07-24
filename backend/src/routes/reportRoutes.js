import express from "express";
import path from "path";
import fs from "fs";
import {
  generateJsonReport,
  generateMarkdownReport,
  // generatePdfReport,  // Uncomment if implemented
  listReports,
  deleteReport,
} from "../services/reportService/index.js";

const router = express.Router();

// List available reports
router.get("/", async (req, res) => {
  try {
    const reports = await listReports(req.dirs.reportsDir);
    res.json(reports);
  } catch (error) {
    console.error("Error listing reports:", error);
    res
      .status(500)
      .json({ error: "Failed to list reports", details: error.message });
  }
});

// Generate a new report
router.post("/generate", async (req, res) => {
  try {
    const {
      format = "json",
      assetId,
      vulnerabilityId,
      includeScans = true,
    } = req.body;

    // Validate required parameters
    if (!assetId && !vulnerabilityId && format !== "summary") {
      return res.status(400).json({
        error: "Missing required parameters",
        details:
          'Either assetId or vulnerabilityId is required, or format must be "summary"',
      });
    }

    // Generate the report based on the requested format
    let reportResult;

    const reportOptions = {
      assetId,
      vulnerabilityId,
      includeScans,
      outputDir: req.dirs.reportsDir,
    };

    switch (format.toLowerCase()) {
      case "json":
        reportResult = await generateJsonReport(reportOptions);
        break;

      case "markdown":
      case "md":
        reportResult = await generateMarkdownReport(reportOptions);
        break;

      case "pdf":
        // Uncomment if implemented
        // reportResult = await generatePdfReport(reportOptions);
        return res
          .status(501)
          .json({ error: "PDF report generation not implemented yet" });

      default:
        return res.status(400).json({
          error: "Invalid format",
          details: `Format "${format}" is not supported. Use "json", "markdown", or "pdf"`,
        });
    }

    res.json({
      success: true,
      report: reportResult,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ error: "Failed to generate report", details: error.message });
  }
});

// Download a report
router.get("/download/:fileName", (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(req.dirs.reportsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Report file not found" });
    }

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    const fileExt = path.extname(fileName).toLowerCase();

    if (fileExt === ".json") {
      contentType = "application/json";
    } else if (fileExt === ".md") {
      contentType = "text/markdown";
    } else if (fileExt === ".pdf") {
      contentType = "application/pdf";
    }

    // Set content disposition header
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", contentType);

    // Stream the file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading report:", error);
    res
      .status(500)
      .json({ error: "Failed to download report", details: error.message });
  }
});

// Delete a report
router.delete("/:fileName", async (req, res) => {
  try {
    await deleteReport(req.params.fileName, req.dirs.reportsDir);
    res.json({
      success: true,
      message: `Report ${req.params.fileName} deleted successfully`,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "Report not found" });
    } else {
      console.error("Error deleting report:", error);
      res
        .status(500)
        .json({ error: "Failed to delete report", details: error.message });
    }
  }
});

export default router;
