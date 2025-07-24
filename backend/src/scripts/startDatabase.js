import { startDatabase } from "../utils/databaseManager.js";

// Function to start the database standalone
async function startDatabaseStandalone() {
  try {
    console.log("Starting PostgreSQL database...");
    const result = await startDatabase();

    if (result) {
      console.log("Database started successfully!");
    } else {
      console.error("Failed to start database.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error starting database:", error);
    process.exit(1);
  }
}

// Run the function
startDatabaseStandalone();
