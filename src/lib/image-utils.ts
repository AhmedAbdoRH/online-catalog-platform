import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // Simple, robust configuration for maximum compatibility
  const options = {
    maxSizeMB: 1, // 1MB limit - good quality, safe for server (5MB limit)
    maxWidthOrHeight: 1280, // HD standard - efficient for mobile
    useWebWorker: false, // Avoid worker issues on some Android viewports
    fileType: 'image/jpeg', // JPEG is safer/faster than WebP on older devices
    initialQuality: 0.8,
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Construct new filename
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const newFileName = `${baseName}.jpg`;

    return new File([compressedBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

  } catch (error) {
    console.warn('Image compression failed. Returning original file.', error);
    // CRITICAL: Never break the flow. Return original.
    // The server/form will catch it if it's too big.
    return file;
  }
}
