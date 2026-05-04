import imageCompression from 'browser-image-compression';

export type ImageProfile = 'product' | 'logo' | 'cover';

/** Fetch a data URL or remote image URL into a File (for keeping sibling slots in sync when editing). */
export async function imageUrlToFile(src: string, fileName: string): Promise<File> {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error('تعذر تحميل الصورة');
  }
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg', lastModified: Date.now() });
}

const PROFILES = {
  product: {
    maxSizeMB: 0.05, // 50KB
    maxDimension: 800,
    quality: 0.75,
  },
  logo: {
    maxSizeMB: 0.02, // 20KB
    maxDimension: 256,
    quality: 0.80,
  },
  cover: {
    maxSizeMB: 0.08, // 80KB
    maxDimension: 1024,
    quality: 0.75,
  },
};

async function compressImageWithCanvas(file: File, profile: (typeof PROFILES)[ImageProfile]): Promise<File | null> {
  if (typeof window === 'undefined') return null;

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = imageUrl;
    });

    const scale = Math.min(1, profile.maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(image, 0, 0, width, height);

    const targetBytes = profile.maxSizeMB * 1024 * 1024;
    const qualities = [profile.quality, 0.65, 0.5, 0.38, 0.28];
    let smallest: Blob | null = null;

    for (const quality of qualities) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality);
      });
      if (!blob) continue;
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= targetBytes) {
        smallest = blob;
        break;
      }
    }

    if (!smallest) return null;

    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image';
    return new File([smallest], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function compressImage(file: File, profileName: ImageProfile = 'product'): Promise<File> {
  if (!file || (typeof file.size !== 'number') || file.size === 0) {
    console.warn('Invalid file passed to compressImage', file);
    return file;
  }

  const profile = PROFILES[profileName] || PROFILES.product;
  const targetBytes = profile.maxSizeMB * 1024 * 1024;

  if (file.size <= targetBytes && file.type === 'image/webp') {
    console.log(`Image already within target for ${profileName}, skipping compression.`);
    return file;
  }

  const attempts = [
    { dimension: profile.maxDimension, quality: profile.quality },
    { dimension: Math.round(profile.maxDimension * 0.85), quality: 0.65 },
    { dimension: Math.round(profile.maxDimension * 0.7), quality: 0.5 },
    { dimension: Math.round(profile.maxDimension * 0.55), quality: 0.38 },
  ];

  try {
    console.log(`Compressing ${profileName}: ${file.name} (${(file.size / 1024).toFixed(0)}KB) -> target ${(profile.maxSizeMB * 1024).toFixed(0)}KB WebP`);
    let bestBlob: Blob | null = null;

    for (const attempt of attempts) {
      const compressedBlob = await imageCompression(file, {
        maxSizeMB: profile.maxSizeMB,
        maxWidthOrHeight: attempt.dimension,
        useWebWorker: false, // Avoid worker issues on Android/Capacitor
        fileType: 'image/webp',
        initialQuality: attempt.quality,
      });

      if (!bestBlob || compressedBlob.size < bestBlob.size) {
        bestBlob = compressedBlob;
      }

      if (compressedBlob.size <= targetBytes) break;
    }

    const canvasCompressed = await compressImageWithCanvas(file, profile);
    if (canvasCompressed && (!bestBlob || canvasCompressed.size < bestBlob.size)) {
      bestBlob = canvasCompressed;
    }

    if (!bestBlob) return file;

    console.log(`Compressed: ${(bestBlob.size / 1024).toFixed(0)}KB`);

    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image';
    return new File([bestBlob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn(`Image compression failed for ${profileName}. Trying canvas fallback.`, error);
    const canvasCompressed = await compressImageWithCanvas(file, profile).catch(() => null);
    if (canvasCompressed && canvasCompressed.size < file.size) {
      return canvasCompressed;
    }
    return file;
  }
}
