#!/usr/bin/env node
/** GitHub Pages HTML: modules must not be async, or they run before $_TSR. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/fix-pages-html.mjs <html>...");
  process.exit(1);
}

for (const file of files) {
  if (!existsSync(file)) {
    console.error("missing", file);
    process.exit(1);
  }
  let html = readFileSync(file, "utf8");
  html = html.replace(/\sasync(?:=""|=''|=async)?/g, "");
  writeFileSync(file, html);
  console.log("fixed", file);
}
