#!/usr/bin/env node

/**
 * Performance Audit Script for sayso
 *
 * Checks common performance issues and provides recommendations
 * Run with: node scripts/performance-audit.js
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 sayso Performance Audit\n");
console.log("=".repeat(50));

// Check 1: Loading states
console.log("\n📊 Checking for loading.tsx files...");
const routes = [
  "src/app/home",
  "src/app/profile",
  "src/app/login",
  "src/app/register",
  "src/app/interests",
  "src/app/subcategories",
  "src/app/saved",
  "src/app/leaderboard",
];

let missingLoading = [];
routes.forEach((route) => {
  const loadingPath = path.join(process.cwd(), route, "loading.tsx");
  if (!fs.existsSync(loadingPath)) {
    missingLoading.push(route);
  }
});

if (missingLoading.length > 0) {
  console.log("⚠️  Missing loading.tsx in:");
  missingLoading.forEach((r) => console.log(`   - ${r}`));
  console.log("\n💡 Recommendation: Add loading.tsx for better perceived performance");
} else {
  console.log("✅ All routes have loading states");
}

// Check 2: Dynamic imports in layout
console.log("\n📦 Checking layout.tsx optimizations...");
const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf8");

if (layoutContent.includes("import dynamic")) {
  console.log("✅ Layout uses dynamic imports");
} else {
  console.log("⚠️  Layout does not use dynamic imports");
  console.log("💡 Consider lazy loading non-critical providers");
}

// Check 3: Framer Motion usage
console.log("\n🎨 Checking framer-motion usage...");
const findFiles = (dir, pattern, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes("node_modules") && !filePath.includes(".next")) {
        findFiles(filePath, pattern, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(filePath, "utf8");
      if (content.match(pattern)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
};

const framerFiles = findFiles(path.join(process.cwd(), "src"), /from ['"]framer-motion['"]/);

if (framerFiles.length > 0) {
  console.log(`⚠️  Found ${framerFiles.length} files importing framer-motion directly`);
  console.log("💡 Consider using lazy-loaded motion from lib/lazy-motion.ts");
  console.log("   Files:");
  framerFiles.slice(0, 5).forEach((f) => {
    console.log(`   - ${f.replace(process.cwd(), "")}`);
  });
  if (framerFiles.length > 5) {
    console.log(`   ... and ${framerFiles.length - 5} more`);
  }
} else {
  console.log("✅ No direct framer-motion imports found");
}

// Check 4: Image optimization
console.log("\n🖼️  Checking image usage...");
const imgFiles = findFiles(path.join(process.cwd(), "src"), /<img\s/);

if (imgFiles.length > 0) {
  console.log(`⚠️  Found ${imgFiles.length} files using <img> tag`);
  console.log("💡 Use Next.js Image component for optimization");
} else {
  console.log("✅ No unoptimized <img> tags found");
}

// Check 5: Console.log statements
console.log("\n🔍 Checking for console.log statements...");
const consoleFiles = findFiles(path.join(process.cwd(), "src"), /console\.(log|warn|error)/);

if (consoleFiles.length > 0) {
  console.log(`⚠️  Found ${consoleFiles.length} files with console statements`);
  console.log("💡 These will be removed in production build");
} else {
  console.log("✅ No console statements found");
}

// Check 6: Bundle size (if .next exists)
console.log("\n📦 Checking bundle information...");
const nextDir = path.join(process.cwd(), ".next");
if (fs.existsSync(nextDir)) {
  console.log("✅ Production build exists");
  console.log("💡 Run: npm run build:analyze for detailed bundle analysis");
} else {
  console.log("⚠️  No production build found");
  console.log("💡 Run: npm run build to check production bundle");
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("\n📋 Summary & Recommendations:\n");

const recommendations = [];

if (missingLoading.length > 0) {
  recommendations.push("Add loading.tsx files to routes without them");
}

if (framerFiles.length > 5) {
  recommendations.push("Migrate to lazy-loaded motion components");
}

if (imgFiles.length > 0) {
  recommendations.push("Replace <img> tags with Next.js Image component");
}

if (!fs.existsSync(nextDir)) {
  recommendations.push("Run production build to analyze bundle size");
}

if (recommendations.length > 0) {
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
} else {
  console.log("🎉 All major optimizations look good!");
}

console.log("\n💡 For detailed analysis, run:");
console.log("   npm run build:analyze");
console.log("\n🚀 Performance guide: PERFORMANCE_OPTIMIZATION_GUIDE.md\n");
