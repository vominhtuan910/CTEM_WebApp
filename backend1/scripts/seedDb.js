// Import required modules
import prisma from "../utils/prisma.js";

// Define sample assets
const sampleAssets = [
  {
    id: "9b565b40-0d87-4375-b45a-7b3a52e8d5e7",
    hostname: "web-server-01",
    name: "Web Server 01",
    ipAddress: "192.168.1.101",
    ipAddresses: ["192.168.1.101", "10.0.0.101"],
    status: "active",
    lastScan: new Date("2023-09-15T08:30:00Z"),
    healthScore: 92.5,
    issuesCount: 2,
    labels: ["production", "web", "critical"],
    agentStatus: "installed",
    osName: "Ubuntu",
    osVersion: "22.04 LTS",
    osArchitecture: "x64",
    osBuildNumber: "22.04.2",
    osLastBootTime: new Date("2023-09-01T00:00:00Z"),
    confidentiality: 3,
    integrity: 3,
    availability: 3,
    department: "IT",
    location: "Main Datacenter",
    owner: "John Doe",
    services: [
      {
        name: "nginx",
        displayName: "Nginx Web Server",
        status: "running",
        port: 80,
        protocol: "tcp",
        version: "1.18.0",
      },
      {
        name: "ssh",
        displayName: "OpenSSH Server",
        status: "running",
        port: 22,
        protocol: "tcp",
        version: "8.9p1",
      },
    ],
    applications: [
      {
        name: "Nginx",
        version: "1.18.0",
        publisher: "Nginx Inc.",
        installDate: new Date("2023-01-15"),
      },
      {
        name: "OpenSSH",
        version: "8.9p1",
        publisher: "OpenBSD",
        installDate: new Date("2023-01-15"),
      },
    ],
  },
  {
    id: "8c674a39-1d56-4982-a9a3-9b35c9482f89",
    hostname: "db-server-01",
    name: "Database Server 01",
    ipAddress: "192.168.1.102",
    ipAddresses: ["192.168.1.102", "10.0.0.102"],
    status: "active",
    lastScan: new Date("2023-09-14T10:15:00Z"),
    healthScore: 88.7,
    issuesCount: 4,
    labels: ["production", "database", "critical"],
    agentStatus: "installed",
    osName: "CentOS",
    osVersion: "8.5",
    osArchitecture: "x64",
    osBuildNumber: "8.5.2111",
    osLastBootTime: new Date("2023-08-15T00:00:00Z"),
    confidentiality: 3,
    integrity: 3,
    availability: 3,
    department: "IT",
    location: "Main Datacenter",
    owner: "Jane Smith",
    services: [
      {
        name: "postgresql",
        displayName: "PostgreSQL Database",
        status: "running",
        port: 5432,
        protocol: "tcp",
        version: "13.4",
      },
      {
        name: "ssh",
        displayName: "OpenSSH Server",
        status: "running",
        port: 22,
        protocol: "tcp",
        version: "8.0p1",
      },
    ],
    applications: [
      {
        name: "PostgreSQL",
        version: "13.4",
        publisher: "PostgreSQL Global Development Group",
        installDate: new Date("2023-01-10"),
      },
      {
        name: "OpenSSH",
        version: "8.0p1",
        publisher: "OpenBSD",
        installDate: new Date("2023-01-10"),
      },
    ],
  },
  {
    id: "7d563c28-2e45-4a91-b8b2-8a44d8e1f75e",
    hostname: "app-server-01",
    name: "Application Server 01",
    ipAddress: "192.168.1.103",
    ipAddresses: ["192.168.1.103", "10.0.0.103"],
    status: "active",
    lastScan: new Date("2023-09-13T14:45:00Z"),
    healthScore: 96.2,
    issuesCount: 1,
    labels: ["production", "application", "critical"],
    agentStatus: "installed",
    osName: "Windows Server",
    osVersion: "2022",
    osArchitecture: "x64",
    osBuildNumber: "20348.169",
    osLastBootTime: new Date("2023-09-05T00:00:00Z"),
    confidentiality: 3,
    integrity: 3,
    availability: 3,
    department: "IT",
    location: "Main Datacenter",
    owner: "Mike Johnson",
    services: [
      {
        name: "w3svc",
        displayName: "World Wide Web Publishing Service",
        status: "running",
        port: 80,
        protocol: "tcp",
        version: "10.0",
      },
      {
        name: "RpcSs",
        displayName: "Remote Procedure Call",
        status: "running",
        port: null,
        protocol: null,
        version: null,
      },
    ],
    applications: [
      {
        name: "IIS Web Server",
        version: "10.0",
        publisher: "Microsoft Corporation",
        installDate: new Date("2023-02-01"),
      },
      {
        name: ".NET Core Runtime",
        version: "6.0.5",
        publisher: "Microsoft Corporation",
        installDate: new Date("2023-02-01"),
      },
    ],
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data from all tables
    console.log("Clearing existing data...");
    await prisma.applicationVulnerability.deleteMany();
    await prisma.assetVulnerability.deleteMany();
    await prisma.vulnerability.deleteMany();
    await prisma.service.deleteMany();
    await prisma.application.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.defectDojoIntegration.deleteMany();

    // Insert sample assets into database
    for (const assetData of sampleAssets) {
      const { services, applications, ...asset } = assetData;

      console.log(
        `Creating asset: ${asset.hostname || asset.name || "Unknown"}`
      );

      // Create asset with services and applications in a single transaction
      await prisma.asset.create({
        data: {
          ...asset,
          services: {
            create: services.map((service) => ({
              name: service.name,
              displayName: service.displayName,
              status: service.status,
              port: service.port,
              protocol: service.protocol,
              version: service.version,
              description: service.description,
            })),
          },
          applications: {
            create: applications.map((app) => ({
              name: app.name,
              version: app.version,
              publisher: app.publisher,
              installDate: app.installDate || new Date(),
              type: app.type,
              description: app.description,
              path: app.path,
            })),
          },
        },
      });

      console.log(
        `Created asset ${asset.hostname} with services and applications`
      );
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    console.error("Error details:", error.stack);
  } finally {
    // Close Prisma client connection
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase();
