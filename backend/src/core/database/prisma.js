import { PrismaClient } from "@prisma/client";

// Create a singleton instance of the Prisma client
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // For development - prevent multiple instances in hot reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

export default prisma;
