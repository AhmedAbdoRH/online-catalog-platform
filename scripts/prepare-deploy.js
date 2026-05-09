const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const openNextDir = path.join(process.cwd(), '.open-next');
const outputDir = path.join(process.cwd(), '.vercel', 'output');

if (!fs.existsSync(openNextDir)) {
  console.error('.open-next directory not found. Did you run build?');
  process.exit(1);
}

console.log('Preparing deployment directory...');

// Clean output dir
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 1. Copy all contents from .open-next (except assets) to outputDir
fs.readdirSync(openNextDir).forEach(file => {
  if (file === 'assets') return;
  const srcPath = path.join(openNextDir, file);
  const destPath = path.join(outputDir, file);
  copyRecursiveSync(srcPath, destPath);
});

// 2. Flatten assets: Copy contents of .open-next/assets to outputDir root
const assetsDir = path.join(openNextDir, 'assets');
if (fs.existsSync(assetsDir)) {
  console.log('Flattening assets directory...');
  fs.readdirSync(assetsDir).forEach(file => {
    const srcPath = path.join(assetsDir, file);
    const destPath = path.join(outputDir, file);
    copyRecursiveSync(srcPath, destPath);
  });
}

// 3. The main worker entry must be named _worker.js at the root
const workerSrc = path.join(outputDir, 'worker.js');
const workerDest = path.join(outputDir, '_worker.js');
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest);
}

console.log('✅ Successfully prepared .vercel/output for Cloudflare Pages');

