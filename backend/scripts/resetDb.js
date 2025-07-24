import { exec } from "child_process";
import util from "util";
import prisma from "../utils/prisma.js";

const execAsync = util.promisify(exec);

// Function to reset the database
async function resetDatabase() {
  try {
    console.log("Starting database reset...");

    // Use Prisma's db push with reset flag to reset the database
    const { stdout, stderr } = await execAsync(
      "npx prisma db push --force-reset"
    );

    if (stderr) {
      console.warn("Prisma warnings:", stderr);
    }

    console.log(stdout);
    console.log("Database reset completed successfully!");
    console.log("Run npm run db:seed to populate with initial data");
  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase();
