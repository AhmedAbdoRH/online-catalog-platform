import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // WebP format with 250KB limit for smaller uploads and faster loading
  const options = {
    maxSizeMB: 0.25, // 250KB limit
    maxWidthOrHeight: 1280, // HD standard - efficient for mobile
    useWebWorker: false, // Avoid worker issues on some Android viewports
    fileType: 'image/webp', // WebP for better compression and quality
    initialQuality: 0.85,
  };

  if (!file || (typeof file.size !== 'number') || file.size === 0) {
    console.warn('Invalid file passed to compressImage', file);
    return file;
  }

  try {
    const compressedBlob = await imageCompression(file, options);

    // Construct new filename with .webp extension
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "image";
    const newFileName = `${baseName}.webp`;

    return new File([compressedBlob], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

  } catch (error) {
    console.warn('Image compression failed. Returning original file.', error);
    // CRITICAL: Never break the flow. Return original.
    // The server/form will catch it if it's too big.
    return file;
  }
}
