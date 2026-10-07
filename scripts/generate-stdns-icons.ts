// Writes public/tokens/stdns/<vault id>.svg (the tDNS glyph split 50/50 into the two stock colours, the geometry TokenIcon renders) and <vault id>.json, the metadata the stDNS mint URI points to.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VAULT_STRATEGIES, getStockColor } from "../lib/vaults-data";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const glyph = readFileSync(join(root, "public/tokens/tdns.svg"), "utf8");
const paths = [...glyph.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
if (paths.length !== 2) throw new Error(`expected 2 glyph paths in tdns.svg, found ${paths.length}`);

const outDir = join(root, "public/tokens/stdns");
const SITE = "https://dns.thaler.finance";
mkdirSync(outDir, { recursive: true });

for (const vault of VAULT_STRATEGIES) {
  const left = getStockColor(vault.stock1, "#333333");
  const right = getStockColor(vault.stock2, "#EF0027");
  const svg = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="48" cy="48" r="48" fill="#000000" />
  <circle cx="48" cy="48" r="47" stroke="#262626" stroke-width="1.5" />
  <svg x="24" y="25" width="48" height="39.15" viewBox="835.7 886.2 870.4 709.8" fill="url(#split)">
    <defs>
      <linearGradient id="split" x1="835.7" y1="0" x2="1706.1" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="50%" stop-color="${left}" />
        <stop offset="50%" stop-color="${right}" />
      </linearGradient>
    </defs>
    <path d="${paths[0]}" />
    <path d="${paths[1]}" />
  </svg>
</svg>
`;
  writeFileSync(join(outDir, `${vault.id}.svg`), svg);
  const metadata = {
    name: `stDNS ${vault.stock1}/${vault.stock2}`,
    symbol: `st${vault.stock1.slice(0, -1)}${vault.stock2.slice(0, -1)}`,
    description: `Thaler DNS vault share for the ${vault.stock1}/${vault.stock2} pair.`,
    image: `${SITE}/tokens/stdns/${vault.id}.png`,
  };
  writeFileSync(join(outDir, `${vault.id}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
}

console.log(`wrote ${VAULT_STRATEGIES.length} icons and metadata files to public/tokens/stdns`);
