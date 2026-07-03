import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const { Pool } = pg;

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

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn("⚠️ DATABASE_URL environment variable is not set. Using fallback database connection.");
}

export const forceMockDb = process.env.FORCE_MOCK_DB === "true";

export const pool = new Pool({
  connectionString: dbUrl || "postgresql://postgres:postgres@localhost:5432/postgres",
  allowExitOnIdle: true,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
  statement_timeout: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client in db pool", err);
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
  coupons: new Map(),
  coupon_usages: new Map(),
  file_history: new Map(),
  upi_payments: new Map(),
  ip_usage: new Map(),
  discount_codes: new Map(),
  discount_code_usages: new Map(),
  referrals: new Map(),
  referral_rewards: new Map(),
  notifications: new Map(),
  payment_orders: new Map(),
};

// Pre-seed default super_admin and test user
const defaultAdminId = "00000000-0000-0000-0000-000000000000";
mockDb.users.set(defaultAdminId, {
  id: defaultAdminId,
  email: "subhajitghosh@filenova.in",
  name: "Subhajit Ghosh",
  role: "super_admin",
  premiumTier: "elite",
  premiumEnabled: true,
  passwordHash: hashPasswordAtRuntime("Subhajit@56"),
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
  premiumTier: "elite",
  premiumEnabled: true,
  passwordHash: hashPasswordAtRuntime("Subhajit@56"),
  referralCode: "DEV12345",
  phoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActiveAt: new Date(),
});

// Pre-seed the local_dev user used by the auth middleware for token testing
mockDb.users.set("local_dev", {
  id: "local_dev",
  email: "subhajitgho123@gmail.com",
  name: "Developer Test",
  role: "developer",
  premiumTier: "elite",
  premiumEnabled: true,
  phoneVerified: true,
  referralCode: "FN-DEV",
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

function extractColumnOrder(sql: string): string[] {
  const sqlTrimmed = sql.trim();
  // RETURNING clause: ... RETURNING "col1", "col2", ...
  const returningMatch = sqlTrimmed.match(/returning\s+(.*)/is);
  if (returningMatch) {
    return returningMatch[1].split(",").map(s => s.trim().replace(/^"?(?:\w+\.)?"?|"?$/g, "")).filter(Boolean);
  }
  // SELECT clause: SELECT "col1", "col2", ... FROM  
  const selectMatch = sqlTrimmed.match(/select\s+(.*?)\s+from/is);
  if (selectMatch) {
    const cols = selectMatch[1].split(",").map(s => s.trim().replace(/^"?(?:\w+\.)?"?|"?$/g, "")).filter(Boolean);
    return cols.filter(c => !c.toLowerCase().startsWith("count(") && c !== "*");
  }
  return [];
}

export function simulateSqlQuery(sql: string, params: any[] = [], asArray = false): { rows: any[]; rowCount: number } {
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
    return maybeAsArray({ rows: [{ count: String(countVal) }], rowCount: 1 }, sql, asArray);
  }
  
  if (sqlLower.includes("sum(") || sqlLower.includes("coalesce(sum(")) {
    let sum = 0;
    if (map) {
      for (const item of map.values()) {
        if (item.amount) sum += parseFloat(item.amount);
      }
    }
    return maybeAsArray({ rows: [{ total: String(sum) }], rowCount: 1 }, sql, asArray);
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

    const codeVal = getParamForField(sql, "code", params);
    if (codeVal !== null) {
      results = results.filter(r => String(r.code).toUpperCase() === String(codeVal).toUpperCase());
    }

    const referredEmailVal = getParamForField(sql, "referred_email", params) || getParamForField(sql, "referredEmail", params);
    if (referredEmailVal !== null) {
      results = results.filter(r => String(r.referredEmail || r.referred_email).toLowerCase() === String(referredEmailVal).toLowerCase());
    }

    const referrerUserIdVal = getParamForField(sql, "referrer_user_id", params) || getParamForField(sql, "referrerUserId", params);
    if (referrerUserIdVal !== null) {
      results = results.filter(r => String(r.referrerUserId || r.referrer_user_id) === String(referrerUserIdVal));
    }

    const ipAddressVal = getParamForField(sql, "ip_address", params) || getParamForField(sql, "ipAddress", params);
    if (ipAddressVal !== null) {
      results = results.filter(r => String(r.ipAddress || r.ip_address) === String(ipAddressVal));
    }

    const utrIdVal = getParamForField(sql, "utr_id", params) || getParamForField(sql, "utrId", params);
    if (utrIdVal !== null) {
      results = results.filter(r => String(r.utrId || r.utr_id) === String(utrIdVal));
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
    
    return maybeAsArray({ rows: results, rowCount: results.length }, sql, asArray);
  }
  
  if (sqlLower.startsWith("insert")) {
    if (!map) return { rows: [], rowCount: 0 };
    
    // Normalize function calls (e.g., gen_random_uuid()) to avoid nested paren matching issues
    const normalized = sql.replace(/[a-zA-Z_]\w*\(([^()]*)\)/g, (_, inner) => `FN(${inner})`);
    const colMatch = normalized.match(/insert\s+into\s+"?([a-zA-Z0-9_]+)"?\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
    if (colMatch) {
      const columns = colMatch[2].split(",").map(c => c.trim().replace(/"/g, ""));
      let valuesStr = colMatch[3];
      
      const record: Record<string, any> = {
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const vals = valuesStr.split(",").map(v => v.trim());
      columns.forEach((col, idx) => {
        const valPlaceholder = vals[idx];
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
      return maybeAsArray({ rows: [record], rowCount: 1 }, sql, asArray);
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
    if (!targetId) {
      const orderIdVal = getParamForField(sql, "razorpay_order_id", params) || getParamForField(sql, "razorpayOrderId", params);
      if (orderIdVal) {
        const found = Array.from(map.values()).find(r => String(r.razorpayOrderId || r.razorpay_order_id) === String(orderIdVal));
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
      return maybeAsArray({ rows: [record], rowCount: 1 }, sql, asArray);
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
    
    return maybeAsArray({ rows: [], rowCount: 0 }, sql, asArray);
  }
  
  return maybeAsArray({ rows: [], rowCount: 0 }, sql, asArray);
}

// Helper: normalize JS identifier (table.column -> column, strip quotes)
function cleanColName(name: string): string {
  return name.replace(/^"?(?:\w+\.)?"?|"?$/g, "").trim();
}

// When asArray=true, convert rows from objects to arrays in SQL column order
function maybeAsArray(result: { rows: any[]; rowCount: number }, sql: string, asArray: boolean): { rows: any[]; rowCount: number } {
  if (!asArray || result.rows.length === 0) return result;
  const colOrder = extractColumnOrder(sql);
  if (colOrder.length === 0) return result;
  const rows = result.rows.map((row: any) => {
    return colOrder.map((col) => row[cleanColName(col)]);
  });
  return { rows, rowCount: result.rowCount };
}

// Wrap pool queries & connect requests with fallback
const originalQuery = pool.query;
pool.query = async function (this: any, text: any, params: any) {
  const asArray = typeof text === "object" && text?.rowMode === "array";
  if (forceMockDb) {
    const sqlText = typeof text === "string" ? text : (text?.text || "");
    const sqlValues = typeof text === "string" ? (params as any[]) : ((text?.values || params) as any[]);
    const result = simulateSqlQuery(sqlText || "", sqlValues || [], asArray);
    if (asArray && result.rows.length > 0 && Array.isArray(result.rows[0])) {
      (result as any).fields = result.rows[0].map((_: any, i: number) => ({ name: `col${i}`, dataTypeID: 25 }));
    }
    return result as any;
  }
  try {
    return await (originalQuery as any).apply(this, [text, params]);
  } catch (error: any) {
    const sqlText = typeof text === "string" ? text : (text?.text || "");
    const sqlValues = typeof text === "string" ? (params as any[]) : ((text?.values || params) as any[]);
    console.warn("⚠️ Database query failed. Falling back to in-memory simulation:", error.message);
    const result = simulateSqlQuery(sqlText || "", sqlValues || [], asArray);
    if (asArray && result.rows.length > 0 && Array.isArray(result.rows[0])) {
      (result as any).fields = result.rows[0].map((_: any, i: number) => ({ name: `col${i}`, dataTypeID: 25 }));
    }
    return result as any;
  }
} as any;

const originalConnect = pool.connect;
pool.connect = async function (this: any) {
  if (forceMockDb) {
    return {
      query: async (text: any, params: any) => {
        const asArray2 = typeof text === "object" && text?.rowMode === "array";
        const sqlText = typeof text === "string" ? text : (text?.text || "");
        const sqlValues = typeof text === "string" ? (params as any[]) : ((text?.values || params) as any[]);
        return simulateSqlQuery(sqlText || "", sqlValues || [], asArray2);
      },
      release: () => {},
      on: () => {},
    } as any;
  }
  try {
    return await (originalConnect as any).apply(this);
  } catch (error: any) {
    console.warn("⚠️ Database connection failed. Returning in-memory client simulation:", error.message);
    return {
      query: async (text: any, params: any) => {
        const asArray2 = typeof text === "object" && text?.rowMode === "array";
        const sqlText = typeof text === "string" ? text : (text?.text || "");
        const sqlValues = typeof text === "string" ? (params as any[]) : ((text?.values || params) as any[]);
        return simulateSqlQuery(sqlText || "", sqlValues || [], asArray2);
      },
      release: () => {},
      on: () => {},
    } as any;
  }
} as any;

export const db = drizzle(pool, { schema });

export * from "./schema";


