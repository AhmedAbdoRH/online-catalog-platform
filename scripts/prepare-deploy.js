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

// Clean output dir
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy everything from .open-next into .vercel/output
copyRecursiveSync(openNextDir, outputDir);

// The main worker entry must be named _worker.js at the root
const workerSrc = path.join(outputDir, 'worker.js');
const workerDest = path.join(outputDir, '_worker.js');
if (fs.existsSync(workerSrc) && !fs.existsSync(workerDest)) {
  fs.copyFileSync(workerSrc, workerDest);
}

console.log('✅ Successfully prepared .vercel/output for Cloudflare Pages');
