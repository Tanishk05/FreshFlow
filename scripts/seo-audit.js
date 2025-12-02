#!/usr/bin/env node

/**
 * SEO Audit Script for FreshFlow
 * Run this script to check SEO implementation status
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 FreshFlow SEO Audit\n");
console.log("═══════════════════════════════════════\n");

const checks = [];
let passed = 0;
let failed = 0;

// Check if file exists
function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);

  checks.push({
    description,
    status: exists ? "✅" : "❌",
    passed: exists,
  });

  if (exists) passed++;
  else failed++;

  return exists;
}

// Check if content exists in file
function checkContent(filePath, searchString, description) {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    const content = fs.readFileSync(fullPath, "utf8");
    const exists = content.includes(searchString);

    checks.push({
      description,
      status: exists ? "✅" : "❌",
      passed: exists,
    });

    if (exists) passed++;
    else failed++;

    return exists;
  } catch (error) {
    checks.push({
      description,
      status: "❌",
      passed: false,
    });
    failed++;
    return false;
  }
}

// Run checks
console.log("📋 Essential Files\n");
checkFile("src/app/robots.ts", "robots.txt configuration");
checkFile("src/app/sitemap.ts", "Sitemap generation");
checkFile("public/manifest.json", "PWA manifest");
checkFile(".env.example", "Environment variables template");

console.log("\n📊 SEO Components\n");
checkFile(
  "src/components/seo/StructuredData.tsx",
  "Structured data components"
);
checkContent("src/app/layout.tsx", "openGraph", "Open Graph metadata");
checkContent("src/app/layout.tsx", "twitter", "Twitter Card metadata");
checkContent("src/app/layout.tsx", "keywords", "Meta keywords");

console.log("\n⚡ Performance\n");
checkContent("src/app/layout.tsx", "Analytics", "Analytics integration");
checkContent("src/app/layout.tsx", "SpeedInsights", "Speed Insights");
checkContent("next.config.ts", "compress", "Compression enabled");
checkContent("next.config.ts", "headers", "Security headers");

console.log("\n🖼️ Required Assets\n");
checkFile("public/icon-192x192.png", "App icon 192x192");
checkFile("public/icon-512x512.png", "App icon 512x512");
checkFile("public/og-image.png", "Open Graph image");
checkFile("public/favicon.ico", "Favicon");

console.log("\n📱 PWA Features\n");
checkContent("public/manifest.json", "icons", "Manifest icons configured");
checkContent("public/manifest.json", "start_url", "Start URL defined");
checkContent("src/app/layout.tsx", "manifest", "Manifest linked in layout");

console.log("\n═══════════════════════════════════════\n");
console.log("📊 Audit Results\n");

// Print all checks
checks.forEach((check) => {
  console.log(`${check.status} ${check.description}`);
});

console.log("\n═══════════════════════════════════════\n");
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Score: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

if (failed > 0) {
  console.log("⚠️  Some SEO optimizations are missing.");
  console.log("📖 Check SEO_IMPLEMENTATION_GUIDE.md for details.\n");
  process.exit(1);
} else {
  console.log("🎉 All SEO optimizations are in place!\n");
  process.exit(0);
}
