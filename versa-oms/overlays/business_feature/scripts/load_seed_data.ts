import fs from "node:fs";
import path from "node:path";

const seedDir = path.join(process.cwd(), "seed");
const loadOrderPath = path.join(process.cwd(), "LOAD_ORDER.json");

if (!fs.existsSync(seedDir)) {
  console.log("No seed directory found.");
  process.exit(0);
}

const loadOrder = fs.existsSync(loadOrderPath)
  ? JSON.parse(fs.readFileSync(loadOrderPath, "utf8")).load_order
  : fs.readdirSync(seedDir).filter((file) => file.endsWith(".json")).map((file) => `seed/${file}`);

for (const file of loadOrder) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Missing seed file: ${file}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  console.log(`Loaded ${file}: ${Array.isArray(data) ? data.length : 1} records`);
}
