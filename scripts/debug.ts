import * as db from "../lib/vercel-db";
console.log("db.default keys:", Object.keys(db.default));
console.log("initDatabase on db.default:", (db.default as any).initDatabase);
