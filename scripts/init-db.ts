import { initDatabase } from "../lib/vercel-db";

async function main() {
  console.log("🚀 Initializing FileNova database...");

  try {
    await initDatabase();
    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

main();
