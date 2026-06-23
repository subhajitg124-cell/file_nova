import { db, usersTable } from "../lib/db/src";

async function main() {
  try {
    const users = await db.select().from(usersTable);
    console.log("=== DB Users ===");
    for (const u of users) {
      console.log(`User ID: ${u.id}, Email: ${u.email}, Referral Code: ${u.referralCode}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Failed to query users:", error);
    process.exit(1);
  }
}

main();
