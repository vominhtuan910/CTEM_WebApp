import { exec } from "child_process";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";

// Convert exec to promise-based
const execPromise = util.promisify(exec);

// Get backend directory path (ES module version)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

// Docker container name
const CONTAINER_NAME = "ctem-postgres";
const SERVICE_NAME = "postgres";

/**
 * Check if Docker is installed and running
 * @returns {Promise<boolean>}
 */
const checkDocker = async () => {
  try {
    await execPromise("docker --version");
    return true;
  } catch (error) {
    console.error("Docker is not installed or not running:", error.message);
    return false;
  }
};

/**
 * Check if Docker Compose is installed
 * @returns {Promise<boolean>}
 */
const checkDockerCompose = async () => {
  try {
    await execPromise("docker-compose --version");
    return true;
  } catch (error) {
    console.error("Docker Compose is not installed:", error.message);
    return false;
  }
};

/**
 * Check if PostgreSQL container exists
 * @returns {Promise<boolean>}
 */
const containerExists = async () => {
  try {
    const { stdout } = await execPromise(
      `docker ps -a -f "name=${CONTAINER_NAME}" --format "{{.Names}}"`
    );
    return stdout.trim() === CONTAINER_NAME;
  } catch (error) {
    console.error("Error checking if container exists:", error.message);
    return false;
  }
};

/**
 * Check if PostgreSQL container is running
 * @returns {Promise<boolean>}
 */
const isContainerRunning = async () => {
  try {
    const { stdout } = await execPromise(
      `docker ps -f "name=${CONTAINER_NAME}" --format "{{.Names}}"`
    );
    return stdout.trim() === CONTAINER_NAME;
  } catch (error) {
    console.error("Error checking if container is running:", error.message);
    return false;
  }
};

/**
 * Start the PostgreSQL container using docker-compose
 * @returns {Promise<boolean>}
 */
const startDatabase = async () => {
  try {
    // Check if docker is available
    if (!(await checkDocker())) {
      console.error(
        "Docker is not available. Please install Docker to use the database."
      );
      return false;
    }

    // Check if docker-compose is available
    if (!(await checkDockerCompose())) {
      console.error(
        "Docker Compose is not available. Please install Docker Compose to use the database."
      );
      return false;
    }

    // Check if container is already running
    const running = await isContainerRunning();

    if (running) {
      console.log("PostgreSQL container already running.");
      return true;
    }

    // Start with docker-compose
    console.log("Starting PostgreSQL container with docker-compose...");
    await execPromise(
      `cd "${backendDir}" && docker-compose up -d ${SERVICE_NAME}`
    );

    // Wait a bit to ensure database is ready for connections
    console.log("Waiting for database to initialize...");

    // Wait for the health check to pass
    let healthy = false;
    const maxRetries = 30; // 30 * 2 seconds = 60 seconds max wait
    let retries = 0;

    while (!healthy && retries < maxRetries) {
      try {
        const { stdout } = await execPromise(
          `docker inspect --format="{{.State.Health.Status}}" ${CONTAINER_NAME}`
        );
        if (stdout.trim() === "healthy") {
          healthy = true;
          console.log("PostgreSQL container is healthy and ready.");
        } else {
          console.log(
            `Waiting for PostgreSQL to be ready... Status: ${stdout.trim()}`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds
          retries++;
        }
      } catch (error) {
        console.log("Waiting for container health check...");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds
        retries++;
      }
    }

    if (!healthy) {
      console.warn(
        "PostgreSQL container may not be fully ready, but proceeding anyway."
      );
    }

    return true;
  } catch (error) {
    console.error("Error starting database:", error.message);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
};

/**
 * Stop the PostgreSQL container using docker-compose
 * @returns {Promise<boolean>}
 */
const stopDatabase = async () => {
  try {
    // Check if container is running
    const running = await isContainerRunning();

    if (!running) {
      console.log("PostgreSQL container is not running.");
      return true;
    }

    // Stop with docker-compose
    console.log("Stopping PostgreSQL container with docker-compose...");
    await execPromise(
      `cd "${backendDir}" && docker-compose stop ${SERVICE_NAME}`
    );
    console.log("PostgreSQL container stopped successfully.");

    return true;
  } catch (error) {
    console.error("Error stopping database:", error.message);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
};

export {
  checkDocker,
  checkDockerCompose,
  containerExists,
  isContainerRunning,
  startDatabase,
  stopDatabase,
};
