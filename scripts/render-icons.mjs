// Renders the extension's toolbar icons from the brand SVGs.
// Usage: pnpm dlx --package sharp node scripts/render-icons.mjs
//    or: pnpm add -D -w sharp && node scripts/render-icons.mjs
import { readFileSync } from "node:fs";
import sharp from "sharp";

const logo = new URL("../packages/brand/logo/", import.meta.url);
const out = new URL("../apps/extension/public/icon/", import.meta.url);
const big = readFileSync(new URL("mark.svg", logo));
const small = readFileSync(new URL("mark-small.svg", logo));

for (const size of [16, 32, 48, 128]) {
  await sharp(size <= 32 ? small : big, { density: 600 })
    .resize(size, size)
    .png()
    .toFile(new URL(`${size}.png`, out).pathname);
}
console.log("Rendered icons to apps/extension/public/icon");
