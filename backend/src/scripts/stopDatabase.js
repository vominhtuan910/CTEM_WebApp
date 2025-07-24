import { stopDatabase } from "../utils/databaseManager.js";

// Function to stop the database standalone
async function stopDatabaseStandalone() {
  try {
    console.log("Stopping PostgreSQL database...");
    const result = await stopDatabase();

    if (result) {
      console.log("Database stopped successfully!");
    } else {
      console.error("Failed to stop database.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error stopping database:", error);
    process.exit(1);
  }
}

// Run the function
stopDatabaseStandalone();
