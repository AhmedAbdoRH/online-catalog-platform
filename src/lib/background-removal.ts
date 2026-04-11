export type BackgroundRemovalSource = File | Blob | string;

/** Max longest side before matting — smaller = faster inference (output still goes through product compression). */
export const BG_REMOVAL_MAX_INPUT_SIDE = 640;

type RemoveBgConfig = {
  model?: 'isnet' | 'isnet_fp16' | 'isnet_quint8';
  output?: { format?: 'image/png' | 'image/jpeg' | 'image/webp'; quality?: number };
  progress?: (key: string, current: number, total: number) => void;
  device?: 'cpu' | 'gpu';
  proxyToWorker?: boolean;
};

function inferenceConfig(onProgress?: RemoveBgConfig['progress']): RemoveBgConfig & { device: 'gpu'; proxyToWorker: boolean } {
  return {
    model: 'isnet_quint8',
    output: { format: 'image/webp', quality: 0.9 },
    device: 'gpu',
    proxyToWorker: true,
    ...(onProgress ? { progress: onProgress } : {}),
  };
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

/**
 * Downscale large inputs so ONNX runs on fewer pixels (often 3–10× faster than full‑res phone photos).
 */
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

/**
 * Preload WASM + model while the user is on the form so the first click is much faster.
 */
export async function preloadProductBackgroundRemoval(): Promise<void> {
  if (typeof window === 'undefined') return;
  const { preload } = await import('@imgly/background-removal');
  await preload(inferenceConfig() as Parameters<typeof preload>[0]);
}

/**
 * Removes the background in the browser via @imgly/background-removal.
 * `source` may be a File/Blob or an image URL string (http(s) or data URL).
 */
export async function removeProductBackground(
  source: BackgroundRemovalSource,
  onProgress?: RemoveBgConfig['progress']
): Promise<File> {
  const { removeBackground } = await import('@imgly/background-removal');

  const prepared = await prepareInferenceSource(source, BG_REMOVAL_MAX_INPUT_SIDE);
  const cfg = inferenceConfig(onProgress) as Parameters<typeof removeBackground>[1];

  let blob: Blob;
  try {
    blob = await removeBackground(prepared as Parameters<typeof removeBackground>[0], cfg);
  } catch (gpuErr) {
    console.warn('Background removal GPU path failed, retrying CPU:', gpuErr);
    blob = await removeBackground(prepared as Parameters<typeof removeBackground>[0], {
      ...cfg,
      device: 'cpu',
    } as Parameters<typeof removeBackground>[1]);
  }

  const baseName =
    typeof source === 'object' && source !== null && 'name' in source && typeof (source as File).name === 'string'
      ? (source as File).name.replace(/\.[^/.]+$/, '') || 'product'
      : 'product';

  return new File([blob], `${baseName}-nobg.webp`, {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  });
}
