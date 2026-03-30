import imageCompression from 'browser-image-compression';

// Target: 110KB WebP — maximum storage savings with acceptable quality
const COMPRESSION_TARGET_MB = 0.110; // 110KB
const COMPRESSION_MAX_DIMENSION = 1920; // Full HD max — good for product display
const COMPRESSION_QUALITY = 0.82; // Slightly below default for aggressive savings

export async function compressImage(file: File): Promise<File> {
  if (!file || (typeof file.size !== 'number') || file.size === 0) {
    console.warn('Invalid file passed to compressImage', file);
    return file;
  }

  // If already under 110KB and WebP, skip compression
  if (file.size <= COMPRESSION_TARGET_MB * 1024 * 1024 && file.type === 'image/webp') {
    console.log('Image already within target, skipping compression.');
    return file;
  }

  const options = {
    maxSizeMB: COMPRESSION_TARGET_MB,
    maxWidthOrHeight: COMPRESSION_MAX_DIMENSION,
    useWebWorker: false, // Avoid worker issues on Android/Capacitor
    fileType: 'image/webp',
    initialQuality: COMPRESSION_QUALITY,
  };

  try {
    console.log(`Compressing image: ${file.name} (${(file.size / 1024).toFixed(0)}KB) → target 110KB WebP`);
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
    console.warn('Image compression failed. Returning original file.', error);
    // CRITICAL: Never break the flow. Server will catch oversized files.
    return file;
  }
}
