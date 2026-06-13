export type BackgroundRemovalSource = File | Blob | string;

/** Max longest side before matting — smaller = faster inference (output still goes through product compression). */
export const BG_REMOVAL_MAX_INPUT_SIDE = 640;

type RemoveBgConfig = {
  model?: 'isnet' | 'isnet_fp16' | 'isnet_quint8';
  output?: { format?: 'image/png' | 'image/jpeg' | 'image/webp'; quality?: number };
  progress?: (key: string, current: number, total: number) => void;
  device?: 'cpu' | 'gpu';
  proxyToWorker?: boolean;
  publicPath?: string;
};

// ============================================================================
// CANVAS FAST-PATH ALGORITHMS (PORTED FROM RTS)
// ============================================================================

type PreparedImageSource = {
  blob: Blob;
  dataUrl: string;
};

type PixelSample = {
  r: number;
  g: number;
  b: number;
  alpha: number;
  brightness: number;
  chroma: number;
};

type BackgroundModel = {
  r: number;
  g: number;
  b: number;
  whiteLikely: boolean;
  minBrightness: number;
  maxChroma: number;
  seedThreshold: number;
  growThreshold: number;
  edgeBlendThreshold: number;
};

type FastPathDecision = {
  preferCanvas: boolean;
  backgroundCoverage: number;
  whiteLikely: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function prepareImageSourceFromAny(imageInput: File | string): Promise<PreparedImageSource> {
  if (imageInput instanceof File) {
    return {
      blob: imageInput,
      dataUrl: await readBlobAsDataUrl(imageInput),
    };
  }

  try {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    return {
      blob,
      dataUrl: await readBlobAsDataUrl(blob),
    };
  } catch (error) {
    throw new Error(`فشل في تحميل الصورة: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.round((sorted.length - 1) * ratio), 0, sorted.length - 1);
  return sorted[index];
}

function getPixelOffset(pixelIndex: number): number {
  return pixelIndex * 4;
}

function getBrightness(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function getChroma(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function getPixelSample(data: Uint8ClampedArray, pixelIndex: number): PixelSample {
  const offset = getPixelOffset(pixelIndex);
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const alpha = data[offset + 3];

  return {
    r,
    g,
    b,
    alpha,
    brightness: getBrightness(r, g, b),
    chroma: getChroma(r, g, b),
  };
}

function colorDistance(r: number, g: number, b: number, targetR: number, targetG: number, targetB: number): number {
  const deltaR = r - targetR;
  const deltaG = g - targetG;
  const deltaB = b - targetB;

  return Math.sqrt(deltaR * deltaR * 0.3 + deltaG * deltaG * 0.59 + deltaB * deltaB * 0.11);
}

function neighborDelta(data: Uint8ClampedArray, firstPixelIndex: number, secondPixelIndex: number): number {
  const firstOffset = getPixelOffset(firstPixelIndex);
  const secondOffset = getPixelOffset(secondPixelIndex);

  const deltaR = data[firstOffset] - data[secondOffset];
  const deltaG = data[firstOffset + 1] - data[secondOffset + 1];
  const deltaB = data[firstOffset + 2] - data[secondOffset + 2];

  return Math.sqrt(deltaR * deltaR * 0.3 + deltaG * deltaG * 0.59 + deltaB * deltaB * 0.11);
}

function collectBorderPixelIndices(width: number, height: number, thickness: number): number[] {
  const indices = new Set<number>();
  const lastX = width - 1;
  const lastY = height - 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < thickness || y < thickness || x > lastX - thickness || y > lastY - thickness) {
        indices.add(y * width + x);
      }
    }
  }

  return Array.from(indices);
}

function buildBackgroundModel(data: Uint8ClampedArray, width: number, height: number): BackgroundModel {
  const borderThickness = clamp(Math.round(Math.min(width, height) * 0.06), 4, 24);
  const borderIndices = collectBorderPixelIndices(width, height, borderThickness);
  const borderSamples = borderIndices
    .map((pixelIndex) => getPixelSample(data, pixelIndex))
    .filter((sample) => sample.alpha > 0);

  if (borderSamples.length === 0) {
    return {
      r: 255,
      g: 255,
      b: 255,
      whiteLikely: true,
      minBrightness: 220,
      maxChroma: 24,
      seedThreshold: 36,
      growThreshold: 56,
      edgeBlendThreshold: 76,
    };
  }

  const medianR = median(borderSamples.map((sample) => sample.r));
  const medianG = median(borderSamples.map((sample) => sample.g));
  const medianB = median(borderSamples.map((sample) => sample.b));
  const distances = borderSamples.map((sample) =>
    colorDistance(sample.r, sample.g, sample.b, medianR, medianG, medianB)
  );

  const medianDistance = median(distances);
  const brightNeutralRatio =
    borderSamples.filter((sample) => sample.brightness > 212 && sample.chroma < 28).length / borderSamples.length;

  let filteredSamples = borderSamples.filter((sample, index) => {
    const allowedDistance = clamp(medianDistance * 1.8 + 10, 12, 54);
    return distances[index] <= allowedDistance;
  });

  const whiteCandidateSamples = borderSamples.filter((sample) => sample.brightness > 198 && sample.chroma < 42);
  const whiteLikely =
    brightNeutralRatio > 0.28 ||
    (mean(borderSamples.map((sample) => sample.brightness)) > 215 &&
      percentile(borderSamples.map((sample) => sample.chroma), 0.75) < 36);

  if (whiteLikely && whiteCandidateSamples.length >= Math.max(24, borderSamples.length * 0.18)) {
    filteredSamples = whiteCandidateSamples;
  }

  if (filteredSamples.length < Math.max(12, borderSamples.length * 0.08)) {
    filteredSamples = borderSamples;
  }

  const avgR = mean(filteredSamples.map((sample) => sample.r));
  const avgG = mean(filteredSamples.map((sample) => sample.g));
  const avgB = mean(filteredSamples.map((sample) => sample.b));
  const spreads = filteredSamples.map((sample) => colorDistance(sample.r, sample.g, sample.b, avgR, avgG, avgB));
  const spread = percentile(spreads, 0.75);
  const brightnessValues = filteredSamples.map((sample) => sample.brightness);
  const chromaValues = filteredSamples.map((sample) => sample.chroma);

  return {
    r: avgR,
    g: avgG,
    b: avgB,
    whiteLikely,
    minBrightness: percentile(brightnessValues, 0.2),
    maxChroma: percentile(chromaValues, 0.8),
    seedThreshold: whiteLikely ? clamp(spread * 2.7 + 18, 24, 90) : clamp(spread * 2.2 + 14, 18, 68),
    growThreshold: whiteLikely ? clamp(spread * 3.4 + 24, 30, 118) : clamp(spread * 2.8 + 20, 24, 88),
    edgeBlendThreshold: whiteLikely ? clamp(spread * 4 + 28, 36, 140) : clamp(spread * 3.2 + 24, 32, 108),
  };
}

function isBackgroundPixel(
  data: Uint8ClampedArray,
  pixelIndex: number,
  model: BackgroundModel,
  threshold: number,
  allowWhiteRelaxation: boolean
): boolean {
  const sample = getPixelSample(data, pixelIndex);

  if (sample.alpha === 0) {
    return true;
  }

  const distance = colorDistance(sample.r, sample.g, sample.b, model.r, model.g, model.b);
  if (distance <= threshold) {
    return true;
  }

  if (!allowWhiteRelaxation || !model.whiteLikely) {
    return false;
  }

  return sample.brightness >= model.minBrightness - 18 &&
    sample.chroma <= model.maxChroma + 16 &&
    distance <= threshold + 24;
}

function canGrowIntoPixel(
  data: Uint8ClampedArray,
  currentPixelIndex: number,
  nextPixelIndex: number,
  model: BackgroundModel
): boolean {
  const nextSample = getPixelSample(data, nextPixelIndex);
  if (nextSample.alpha === 0) {
    return true;
  }

  const distance = colorDistance(nextSample.r, nextSample.g, nextSample.b, model.r, model.g, model.b);
  if (distance <= model.growThreshold) {
    return true;
  }

  const localDelta = neighborDelta(data, currentPixelIndex, nextPixelIndex);
  if (distance <= model.edgeBlendThreshold && localDelta <= (model.whiteLikely ? 58 : 42)) {
    return true;
  }

  if (!model.whiteLikely) {
    return false;
  }

  return nextSample.brightness >= model.minBrightness - 22 &&
    nextSample.chroma <= model.maxChroma + 20 &&
    distance <= model.edgeBlendThreshold &&
    localDelta <= 72;
}

function buildBackgroundMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  model: BackgroundModel
): Uint8Array {
  const pixelCount = width * height;
  const mask = new Uint8Array(pixelCount);
  const queue: number[] = [];
  let head = 0;

  const borderSeeds = collectBorderPixelIndices(width, height, 1);
  for (const pixelIndex of borderSeeds) {
    if (mask[pixelIndex]) continue;

    if (isBackgroundPixel(data, pixelIndex, model, model.seedThreshold, false)) {
      mask[pixelIndex] = 1;
      queue.push(pixelIndex);
    }
  }

  if (queue.length === 0) {
    for (const pixelIndex of borderSeeds) {
      if (mask[pixelIndex]) continue;

      if (isBackgroundPixel(data, pixelIndex, model, model.growThreshold, true)) {
        mask[pixelIndex] = 1;
        queue.push(pixelIndex);
      }
    }
  }

  while (head < queue.length) {
    const currentPixelIndex = queue[head];
    head += 1;

    const x = currentPixelIndex % width;
    const y = Math.floor(currentPixelIndex / width);

    for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
      for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
        if (deltaX === 0 && deltaY === 0) continue;

        const nextX = x + deltaX;
        const nextY = y + deltaY;
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;

        const nextPixelIndex = nextY * width + nextX;
        if (mask[nextPixelIndex]) continue;

        if (canGrowIntoPixel(data, currentPixelIndex, nextPixelIndex, model)) {
          mask[nextPixelIndex] = 1;
          queue.push(nextPixelIndex);
        }
      }
    }
  }

  return mask;
}

function countNeighborPixels(
  mask: Uint8Array,
  width: number,
  height: number,
  pixelIndex: number,
  wantBackground: boolean
): number {
  let count = 0;
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
    for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
      if (deltaX === 0 && deltaY === 0) continue;

      const nextX = x + deltaX;
      const nextY = y + deltaY;
      if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;

      const isBackground = mask[nextY * width + nextX] === 1;
      if (isBackground === wantBackground) {
        count += 1;
      }
    }
  }

  return count;
}

function applyMaskToImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  mask: Uint8Array,
  model: BackgroundModel
): Uint8ClampedArray {
  const processed = new Uint8ClampedArray(data);
  const pixelCount = width * height;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const offset = getPixelOffset(pixelIndex);
    const sample = getPixelSample(data, pixelIndex);
    const distance = colorDistance(sample.r, sample.g, sample.b, model.r, model.g, model.b);

    if (mask[pixelIndex] === 1) {
      const foregroundNeighbors = countNeighborPixels(mask, width, height, pixelIndex, false);
      if (foregroundNeighbors === 0) {
        processed[offset + 3] = 0;
        continue;
      }

      const closeness = 1 - clamp(distance / model.edgeBlendThreshold, 0, 1);
      const edgeFactor = foregroundNeighbors / 8;
      const softenedAlpha = Math.round(
        255 * clamp(0.03 + edgeFactor * 0.18 + (1 - closeness) * 0.16, 0, 0.42)
      );
      processed[offset + 3] = Math.min(processed[offset + 3], softenedAlpha);
      continue;
    }

    const backgroundNeighbors = countNeighborPixels(mask, width, height, pixelIndex, true);
    if (backgroundNeighbors < 2 || !model.whiteLikely) {
      continue;
    }

    const closeToBackground =
      sample.brightness >= model.minBrightness - 14 &&
      sample.chroma <= model.maxChroma + 14 &&
      distance <= model.edgeBlendThreshold + 18;

    if (!closeToBackground) {
      continue;
    }

    const fringeStrength = 1 - clamp(distance / (model.edgeBlendThreshold + 18), 0, 1);
    const trimAmount = clamp(fringeStrength * (backgroundNeighbors / 8) * 0.55, 0, 0.55);
    processed[offset + 3] = Math.round(processed[offset + 3] * (1 - trimAmount));
  }

  return processed;
}

function getBackgroundCoverage(mask: Uint8Array): number {
  let backgroundPixels = 0;

  for (const pixel of mask) {
    if (pixel === 1) {
      backgroundPixels += 1;
    }
  }

  return backgroundPixels / mask.length;
}

async function analyzeFastPath(dataUrl: string): Promise<FastPathDecision> {
  const image = await loadImageElement(dataUrl);
  const previewCanvas = document.createElement('canvas');
  const previewContext = previewCanvas.getContext('2d', { willReadFrequently: true });

  if (!previewContext) {
    return {
      preferCanvas: false,
      backgroundCoverage: 0,
      whiteLikely: false,
    };
  }

  const maxPreviewDimension = 320;
  const scale = Math.min(1, maxPreviewDimension / Math.max(image.width, image.height));
  previewCanvas.width = Math.max(1, Math.round(image.width * scale));
  previewCanvas.height = Math.max(1, Math.round(image.height * scale));
  previewContext.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height);

  const previewData = previewContext.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
  const model = buildBackgroundModel(previewData.data, previewCanvas.width, previewCanvas.height);
  const mask = buildBackgroundMask(previewData.data, previewCanvas.width, previewCanvas.height, model);
  const backgroundCoverage = getBackgroundCoverage(mask);

  const preferCanvas =
    model.whiteLikely &&
    backgroundCoverage >= 0.18 &&
    backgroundCoverage <= 0.94;

  return {
    preferCanvas,
    backgroundCoverage,
    whiteLikely: model.whiteLikely,
  };
}



async function removeBackgroundWithCanvasDataUrl(dataUrl: string): Promise<string> {
  const image = await loadImageElement(dataUrl);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('تعذر إنشاء سياق الرسم');
  }

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const backgroundModel = buildBackgroundModel(data, width, height);
  const backgroundMask = buildBackgroundMask(data, width, height, backgroundModel);
  const processedData = applyMaskToImageData(data, width, height, backgroundMask, backgroundModel);

  context.putImageData(new ImageData(processedData, width, height), 0, 0);

  return canvas.toDataURL('image/png');
}

export function base64ToFile(
  base64Data: string,
  mimeType: string = 'image/png',
  filename: string = 'processed_image.png'
): File {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], filename, { type: mimeType });
}


// ============================================================================
// @IMGLY ROBUST FALLBACK & HELPERS
// ============================================================================

function inferenceConfig(onProgress?: RemoveBgConfig['progress']): RemoveBgConfig & { device: 'gpu'; proxyToWorker: boolean } {
  const publicPath = computeImglyPublicPath();
  if (publicPath) {
    try {
      console.debug('[background-removal] using publicPath:', publicPath);
    } catch {}
  }
  return {
    model: 'isnet_quint8',
    output: { format: 'image/webp', quality: 0.9 },
    device: 'gpu',
    proxyToWorker: true,
    ...(onProgress ? { progress: onProgress } : {}),
    ...(publicPath ? { publicPath } : {}),
  };
}

function computeImglyPublicPath(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const env = (process?.env as any)?.NEXT_PUBLIC_IMG_LY_BG_PUBLIC_PATH as string | undefined;
  const globalOverride = (window as any).__IMG_LY_BG_REMOVAL_PUBLIC_PATH as string | undefined;
  if (env) return env;
  if (globalOverride) return globalOverride;
  return undefined;
}

async function loadImageBitmap(source: BackgroundRemovalSource): Promise<ImageBitmap> {
  if (typeof source === 'string') {
    const res = await fetch(source);
    if (!res.ok) throw new Error('تعذر تحميل الصورة');
    return createImageBitmap(await res.blob());
  }
  return createImageBitmap(source as Blob);
}

function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('فشل إنشاء الصورة'))), 'image/webp', 0.9);
  });
}

async function prepareInferenceSource(
  source: BackgroundRemovalSource,
  maxSide: number
): Promise<BackgroundRemovalSource> {
  if (typeof window === 'undefined') return source;

  const bitmap = await loadImageBitmap(source);
  const w = bitmap.width;
  const h = bitmap.height;
  const longest = Math.max(w, h);

  try {
    if (longest <= maxSide) {
      return source;
    }
    const scale = maxSide / longest;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return source;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await canvasToWebpBlob(canvas);
  } finally {
    bitmap.close();
  }
}

export async function preloadProductBackgroundRemoval(): Promise<void> {
  if (typeof window === 'undefined') return;
  const { preload } = await import('@imgly/background-removal');
  await preload(inferenceConfig() as Parameters<typeof preload>[0]);
}

/**
 * Removes the background in the browser using hybrid approach.
 * First tries smart canvas segmentation for white backgrounds,
 * then falls back to @imgly/background-removal.
 */
export async function removeProductBackground(
  source: BackgroundRemovalSource,
  onProgress?: RemoveBgConfig['progress']
): Promise<File> {
  if (typeof window === 'undefined') {
    throw new Error('Background removal must run in browser');
  }

  const baseName =
    typeof source === 'object' && source !== null && 'name' in source && typeof (source as File).name === 'string'
      ? (source as File).name.replace(/\.[^/.]+$/, '') || 'product'
      : 'product';

  try {
    const preparedSource = await prepareImageSourceFromAny(source);
    const fastPath = await analyzeFastPath(preparedSource.dataUrl);

    if (fastPath.preferCanvas) {
      console.log(
        `Using fast canvas background removal (whiteLikely=${fastPath.whiteLikely}, coverage=${fastPath.backgroundCoverage.toFixed(2)}).`
      );
      try {
        const fastCanvasDataUrl = await removeBackgroundWithCanvasDataUrl(preparedSource.dataUrl);
        const file = base64ToFile(fastCanvasDataUrl.split(',')[1], 'image/png', `${baseName}-nobg.png`);
        return file;
      } catch (err) {
        console.warn('Canvas bg removal failed, falling back to IMG.LY', err);
      }
    }
  } catch (err) {
    console.warn('Failed to analyze fast path, continuing to IMG.LY', err);
  }

  console.log('Removing background with IMG.LY model...');
  const { removeBackground } = await import('@imgly/background-removal');

  const preparedForImgly = await prepareInferenceSource(source, BG_REMOVAL_MAX_INPUT_SIDE);
  const cfg = inferenceConfig(onProgress) as Parameters<typeof removeBackground>[1];

  let blob: Blob;
  try {
    blob = await removeBackground(preparedForImgly as Parameters<typeof removeBackground>[0], cfg);
  } catch (gpuErr) {
    console.warn('Background removal GPU path failed, retrying CPU:', gpuErr);
    blob = await removeBackground(preparedForImgly as Parameters<typeof removeBackground>[0], {
      ...cfg,
      device: 'cpu',
    } as Parameters<typeof removeBackground>[1]);
  }

  return new File([blob], `${baseName}-nobg.webp`, {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  });
}
