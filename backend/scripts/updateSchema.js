import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

// Function to update database schema
async function updateSchema() {
  try {
    console.log("Updating database schema with Prisma...");

    // Run Prisma command to push the schema to the database
    const { stdout, stderr } = await execAsync("npx prisma db push");

    if (stderr) {
      console.warn("Prisma warnings:", stderr);
    }

    console.log(stdout);
    console.log("Database schema updated successfully!");
  } catch (error) {
    console.error("Error updating database schema:", error);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

// Run the update
updateSchema();
