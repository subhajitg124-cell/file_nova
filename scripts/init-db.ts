import * as vercelDb from "../lib/vercel-db";

const initDatabase = vercelDb.initDatabase || (vercelDb as any).default?.initDatabase;

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
