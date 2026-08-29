/**
 * Loads environment files for standalone Node scripts (drizzle-kit, seed).
 *
 * Next.js loads `.env.local` automatically; plain `tsx`/`node` do not. Import
 * this module FIRST in any script that needs env vars. Precedence (first wins):
 *   .env.local  >  .env
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) config({ path, override: false });
}
