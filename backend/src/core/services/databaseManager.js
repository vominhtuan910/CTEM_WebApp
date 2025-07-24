import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import util from "util";

const execAsync = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to docker-compose.yml file
const dockerComposePath = path.join(process.cwd(), "docker-compose.yml");

/**
 * Check if Docker is available on the system
 * @returns {Promise<boolean>} True if Docker is available
 */
const checkDocker = async () => {
  try {
    const { stdout } = await execAsync("docker --version");
    console.log("Docker is available:", stdout.trim());
    return true;
  } catch (error) {
    console.log("Docker is not available:", error.message);
    return false;
  }
};

/**
 * Check if Docker Compose is available
 * @returns {Promise<boolean>} True if Docker Compose is available
 */
const checkDockerCompose = async () => {
  try {
    const { stdout } = await execAsync("docker compose version");
    console.log("Docker Compose is available:", stdout.trim());
    return true;
  } catch (error) {
    console.log("Docker Compose is not available:", error.message);
    return false;
  }
};

/**
 * Check if the container exists
 * @returns {Promise<boolean>} True if container exists
 */
const containerExists = async () => {
  try {
    const { stdout } = await execAsync(
      'docker container ls -a --format "{{.Names}}"'
    );
    const containerNames = stdout.split("\n").filter(Boolean);
    return containerNames.includes("ctem-postgres");
  } catch (error) {
    console.log("Error checking if container exists:", error.message);
    return false;
  }
};

/**
 * Check if the container is running
 * @returns {Promise<boolean>} True if container is running
 */
const isContainerRunning = async () => {
  try {
    const { stdout } = await execAsync(
      'docker container ls --format "{{.Names}}"'
    );
    const containerNames = stdout.split("\n").filter(Boolean);
    return containerNames.includes("ctem-postgres");
  } catch (error) {
    console.log("Error checking if container is running:", error.message);
    return false;
  }
};

/**
 * Start the PostgreSQL database container
 * @returns {Promise<boolean>} True if successful
 */
const startDatabase = async () => {
  // Check if Docker is available
  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    console.log("Docker is not available. Cannot start database.");
    return false;
  }

  // Check if Docker Compose is available
  const dockerComposeAvailable = await checkDockerCompose();
  if (!dockerComposeAvailable) {
    console.log("Docker Compose is not available. Cannot start database.");
    return false;
  }

  try {
    // Check if container exists and is running
    const running = await isContainerRunning();
    if (running) {
      console.log("PostgreSQL container is already running.");
      return true;
    }

    const exists = await containerExists();
    if (exists) {
      // Start existing container
      console.log("Starting existing PostgreSQL container...");
      await execAsync("docker container start ctem-postgres");
      console.log("PostgreSQL container started.");
    } else {
      // Check if docker-compose file exists
      if (!fs.existsSync(dockerComposePath)) {
        console.error(`Docker Compose file not found at ${dockerComposePath}`);
        return false;
      }

      // Start container using docker-compose
      console.log("Starting PostgreSQL container using Docker Compose...");
      const dockerComposeDir = path.dirname(dockerComposePath);
      await execAsync(
        `cd ${dockerComposeDir} && docker compose up -d postgres`
      );
      console.log("PostgreSQL container started with Docker Compose.");
    }

    // Wait for container to be ready
    console.log("Waiting for PostgreSQL to be ready...");
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        await execAsync("docker exec ctem-postgres pg_isready -U postgres");
        console.log("PostgreSQL is ready.");
        return true;
      } catch (error) {
        attempts++;
        console.log(
          `Waiting for PostgreSQL to be ready... (${attempts}/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      }
    }

    console.error("PostgreSQL did not become ready in time.");
    return false;
  } catch (error) {
    console.error("Error starting PostgreSQL database:", error.message);
    return false;
  }
};

/**
 * Stop the PostgreSQL database container
 * @returns {Promise<boolean>} True if successful
 */
const stopDatabase = async () => {
  // Check if Docker is available
  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    console.log("Docker is not available. Cannot stop database.");
    return false;
  }

  try {
    // Check if container is running
    const running = await isContainerRunning();
    if (!running) {
      console.log("PostgreSQL container is not running.");
      return true;
    }

    // Stop container
    console.log("Stopping PostgreSQL container...");
    await execAsync("docker container stop ctem-postgres");
    console.log("PostgreSQL container stopped.");
    return true;
  } catch (error) {
    console.error("Error stopping PostgreSQL database:", error.message);
    return false;
  }
};

export {
  startDatabase,
  stopDatabase,
  checkDocker,
  checkDockerCompose,
  containerExists,
  isContainerRunning,
};
