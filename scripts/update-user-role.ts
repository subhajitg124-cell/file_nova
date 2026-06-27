import * as vercelDb from "../lib/vercel-db";

async function main() {
  try {
    const email = "subhajitgho123@gmail.com";
    const pool = (vercelDb as any).pool || (vercelDb as any).default?.pool || (vercelDb as any).default || vercelDb;
    
    if (!pool || typeof pool.connect !== "function") {
      // Fallback: try using getPool function
      const getPool = (vercelDb as any).getPool || (vercelDb as any).default?.getPool;
      if (getPool) {
        const activePool = await getPool();
        const client = await activePool.connect();
        await runUpdate(client, email);
      } else {
        throw new Error("Could not locate db pool object in vercel-db module.");
      }
    } else {
      const client = await pool.connect();
      await runUpdate(client, email);
    }
    process.exit(0);
  } catch (error: any) {
    console.error("Failed to update user role:", error.message || error);
    process.exit(1);
  }
}

async function runUpdate(client: any, email: string) {
  try {
    // Check if user exists
    const checkRes = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkRes.rows.length > 0) {
      await client.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
      console.log(`Successfully updated existing user ${email} to admin role in PostgreSQL.`);
    } else {
      await client.query(
        "INSERT INTO users (email, password_hash, name, role, tier) VALUES ($1, $2, $3, $4, $5)",
        [email, "dummy_hash", "Subhajit Developer", "admin", "elite"]
      );
      console.log(`Successfully created new user ${email} as admin in PostgreSQL.`);
    }
  } finally {
    if (client.release) client.release();
  }
}

main();
