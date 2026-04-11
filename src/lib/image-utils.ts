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

export async function compressImage(file: File, profileName: ImageProfile = 'product'): Promise<File> {
  if (!file || (typeof file.size !== 'number') || file.size === 0) {
    console.warn('Invalid file passed to compressImage', file);
    return file;
  }

  const profile = PROFILES[profileName] || PROFILES.product;

  // If already under target size and WebP, skip compression
  if (file.size <= profile.maxSizeMB * 1024 * 1024 && file.type === 'image/webp') {
    console.log(`Image already within target for ${profileName}, skipping compression.`);
    return file;
  }

  const options = {
    maxSizeMB: profile.maxSizeMB,
    maxWidthOrHeight: profile.maxDimension,
    useWebWorker: false, // Avoid worker issues on Android/Capacitor
    fileType: 'image/webp',
    initialQuality: profile.quality,
  };

  try {
    console.log(`Compressing ${profileName}: ${file.name} (${(file.size / 1024).toFixed(0)}KB) → target ${(profile.maxSizeMB * 1024).toFixed(0)}KB WebP`);
    const compressedBlob = await imageCompression(file, options);
    console.log(`Compressed: ${(compressedBlob.size / 1024).toFixed(0)}KB`);

    // Construct new filename with .webp extension
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image';
    const newFileName = `${baseName}.webp`;

    return new File([compressedBlob], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

  } catch (error) {
    console.warn(`Image compression failed for ${profileName}. Returning original file.`, error);
    // CRITICAL: Never break the flow. Server will catch oversized files.
    return file;
  }
}

