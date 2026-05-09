const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
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

// Copy assets
const assetsDir = path.join(openNextDir, 'assets');
if (fs.existsSync(assetsDir)) {
  copyRecursiveSync(assetsDir, outputDir);
}

// Copy worker
const workerFile = path.join(openNextDir, 'worker.js');
if (fs.existsSync(workerFile)) {
  fs.copyFileSync(workerFile, path.join(outputDir, '_worker.js'));
}

console.log('Successfully prepared .vercel/output for Cloudflare Pages');
