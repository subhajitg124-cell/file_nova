import { Pool } from "pg";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ── Load Environment Variables Manually ──────────────────────────────────────
const possibleEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../../../.env"),
];

for (const envPath of possibleEnvPaths) {
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const index = trimmed.indexOf("=");
          if (index !== -1) {
            const key = trimmed.substring(0, index).trim();
            const val = trimmed.substring(index + 1).trim();
            if (key && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      break;
    }
  } catch (e) {
    // Ignore errors
  }
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ POSTGRES_URL or DATABASE_URL environment variables are not set. Database connections will fail.");
}

export const pool = new Pool({
  connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/postgres",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client", err);
});

// ── In-Memory Database Fallback Simulator ────────────────────────────────────

function hashPasswordAtRuntime(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

const mockDb: Record<string, Map<string, any>> = {
  users: new Map(),
  sessions: new Map(),
  subscriptions: new Map(),
  files: new Map(),
  ip_usage: new Map(),
  notifications: new Map(),
};

// Pre-seed default super_admin and test user
const defaultAdminId = "00000000-0000-0000-0000-000000000000";
mockDb.users.set(defaultAdminId, {
  id: defaultAdminId,
  email: "subhajitghosh@filenova.in",
  name: "Subhajit Ghosh",
  role: "super_admin",
  tier: "elite",
  premiumTier: "elite",
  premiumEnabled: true,
  password_hash: hashPasswordAtRuntime("Subhajit@56"),
  referralCode: "REF12345",
  phoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActiveAt: new Date(),
});

const devUserId = "11111111-1111-1111-1111-111111111111";
mockDb.users.set(devUserId, {
  id: devUserId,
  email: "subhajitgho123@gmail.com",
  name: "Subhajit Developer",
  role: "developer",
  tier: "elite",
  premiumTier: "elite",
  premiumEnabled: true,
  password_hash: hashPasswordAtRuntime("Subhajit@56"),
  referralCode: "DEV12345",
  phoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActiveAt: new Date(),
});

function getParamForField(sql: string, fieldName: string, params: any[]): any {
  const pattern = `(?:\\"[a-zA-Z0-9_]+\\"\\.)?\\"${fieldName}\\"\\s*=\\s*\\$(\\d+)`;
  const regex = new RegExp(pattern, "i");
  const match = sql.match(regex);
  if (match) {
    const idx = parseInt(match[1]) - 1;
    return params[idx];
  }
  
  const patternNoQuotes = `(?:[a-zA-Z0-9_]+\\.)?${fieldName}\\s*=\\s*\\$(\\d+)`;
  const regexNoQuotes = new RegExp(patternNoQuotes, "i");
  const matchNoQuotes = sql.match(regexNoQuotes);
  if (matchNoQuotes) {
    const idx = parseInt(matchNoQuotes[1]) - 1;
    return params[idx];
  }
  return null;
}

export function simulateSqlQuery(sql: string, params: any[] = []): { rows: any[]; rowCount: number } {
  const sqlLower = sql.toLowerCase();
  
  let tableName = "";
  const fromMatch = sql.match(/from\s+"?([a-zA-Z0-9_]+)"?/i);
  const intoMatch = sql.match(/into\s+"?([a-zA-Z0-9_]+)"?/i);
  const updateMatch = sql.match(/update\s+"?([a-zA-Z0-9_]+)"?/i);
  const deleteMatch = sql.match(/delete\s+from\s+"?([a-zA-Z0-9_]+)"?/i);
  
  if (fromMatch) tableName = fromMatch[1];
  else if (intoMatch) tableName = intoMatch[1];
  else if (updateMatch) tableName = updateMatch[1];
  else if (deleteMatch) tableName = deleteMatch[1];
  
  const map = mockDb[tableName];
  
  if (sqlLower.includes("count(*)")) {
    const countVal = map ? map.size : 0;
    return { rows: [{ count: String(countVal) }], rowCount: 1 };
  }
  
  if (sqlLower.includes("sum(") || sqlLower.includes("coalesce(sum(")) {
    let sum = 0;
    if (map) {
      for (const item of map.values()) {
        if (item.amount) sum += parseFloat(item.amount);
      }
    }
    return { rows: [{ total: String(sum) }], rowCount: 1 };
  }
  
  if (sqlLower.startsWith("select")) {
    if (!map) return { rows: [], rowCount: 0 };
    let results = Array.from(map.values());
    
    const emailVal = getParamForField(sql, "email", params);
    if (emailVal !== null) {
      results = results.filter(r => String(r.email).toLowerCase() === String(emailVal).toLowerCase());
    }
    
    const idVal = getParamForField(sql, "id", params);
    if (idVal !== null) {
      results = results.filter(r => String(r.id) === String(idVal));
    }
    
    const tokenVal = getParamForField(sql, "token", params);
    if (tokenVal !== null) {
      results = results.filter(r => String(r.token) === String(tokenVal));
    }
    
    const userIdVal = getParamForField(sql, "user_id", params) || getParamForField(sql, "userId", params);
    if (userIdVal !== null) {
      results = results.filter(r => String(r.userId || r.user_id) === String(userIdVal));
    }

    const refCodeVal = getParamForField(sql, "referral_code", params);
    if (refCodeVal !== null) {
      results = results.filter(r => String(r.referralCode) === String(refCodeVal));
    }
    
    if (sqlLower.includes("order by") && sqlLower.includes("created_at") && sqlLower.includes("desc")) {
      results.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }

    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      results = results.slice(0, limit);
    }
    
    return { rows: results, rowCount: results.length };
  }
  
  if (sqlLower.startsWith("insert")) {
    if (!map) return { rows: [], rowCount: 0 };
    
    const colMatch = sql.match(/insert\s+into\s+"?([a-zA-Z0-9_]+)"?\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
    if (colMatch) {
      const columns = colMatch[2].split(",").map(c => c.trim().replace(/"/g, ""));
      const valuesStr = colMatch[3];
      
      const record: Record<string, any> = {
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      columns.forEach((col, idx) => {
        const valPlaceholder = valuesStr.split(",")[idx]?.trim();
        const numMatch = valPlaceholder?.match(/\$(\d+)/);
        if (numMatch) {
          const paramIdx = parseInt(numMatch[1]) - 1;
          record[col] = params[paramIdx];
        }
      });
      
      if (!record.id) {
        record.id = crypto.randomUUID();
      }
      
      map.set(record.id, record);
      return { rows: [record], rowCount: 1 };
    }
  }
  
  if (sqlLower.startsWith("update")) {
    if (!map) return { rows: [], rowCount: 0 };
    
    let targetId = getParamForField(sql, "id", params);
    if (!targetId) {
      const userIdVal = getParamForField(sql, "user_id", params) || getParamForField(sql, "userId", params);
      if (userIdVal) {
        const found = Array.from(map.values()).find(r => String(r.userId || r.user_id) === String(userIdVal));
        if (found) targetId = found.id;
      }
    }
    
    if (targetId && map.has(targetId)) {
      const record = map.get(targetId);
      
      const setMatch = sql.match(/set\s+(.*?)\s+(?:where|$)/i);
      if (setMatch) {
        const setClauses = setMatch[1].split(",");
        setClauses.forEach(clause => {
          const match = clause.match(/"?([a-zA-Z0-9_]+)"?\s*=\s*\$(\d+)/);
          if (match) {
            const col = match[1];
            const paramIdx = parseInt(match[2]) - 1;
            record[col] = params[paramIdx];
          }
        });
      }
      
      record.updatedAt = new Date();
      map.set(targetId, record);
      return { rows: [record], rowCount: 1 };
    }
  }
  
  if (sqlLower.startsWith("delete")) {
    if (!map) return { rows: [], rowCount: 0 };
    
    const tokenVal = getParamForField(sql, "token", params);
    if (tokenVal) {
      for (const [id, item] of map.entries()) {
        if (item.token === tokenVal) {
          map.delete(id);
        }
      }
    }
    
    const idVal = getParamForField(sql, "id", params);
    if (idVal && map.has(idVal)) {
      map.delete(idVal);
    }
    
    return { rows: [], rowCount: 0 };
  }
  
  return { rows: [], rowCount: 0 };
}

// Wrap pool queries & connect requests with fallback
const originalQuery = pool.query;
pool.query = async function (this: any, text: any, params: any) {
  try {
    return await (originalQuery as any).apply(this, [text, params]);
  } catch (error: any) {
    const sqlText = typeof text === "string" ? text : text?.text;
    const sqlValues = typeof text === "string" ? params : text?.values;
    console.warn("⚠️ Vercel database query failed. Falling back to in-memory simulation:", error.message);
    return simulateSqlQuery(sqlText || "", sqlValues || []) as any;
  }
} as any;

const originalConnect = pool.connect;
pool.connect = async function (this: any) {
  try {
    return await (originalConnect as any).apply(this);
  } catch (error: any) {
    console.warn("⚠️ Vercel database connection failed. Returning in-memory client simulation:", error.message);
    return {
      query: async (text: any, params: any) => {
        const sqlText = typeof text === "string" ? text : text?.text;
        const sqlValues = typeof text === "string" ? params : text?.values;
        return simulateSqlQuery(sqlText || "", sqlValues || []);
      },
      release: () => {},
      on: () => {},
    } as any;
  }
} as any;

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.warn("⚠️ Database query function failed. Falling back to in-memory simulation:", error.message);
    return simulateSqlQuery(text, params || []);
  }
}

export async function getPool() {
  return pool;
}


export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        tier VARCHAR(50) DEFAULT 'FREE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Files table
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        size INTEGER,
        mime_type VARCHAR(100),
        storage_url TEXT,
        status VARCHAR(50) DEFAULT 'uploaded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        plan VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        payment_id VARCHAR(255)
      )
    `);

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables initialized");
  } finally {
    client.release();
  }
}

export default pool;
