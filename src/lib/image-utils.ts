import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // Define compression tiers - try highest quality first, then degrade if needed
  const attempts = [
    // Tier 1: High quality WebP (Preferred)
    // Good balance of quality and size. 
    { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: false, fileType: 'image/webp' },

    // Tier 2: Standard WebP (Mobile Friendly)
    // Smaller dimensions, safe for most mobile screens
    { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: false, fileType: 'image/webp' },

    // Tier 3: Standard JPEG (Fallback)
    // Some older devices/browsers struggle with WebP encoding, so we fall back to JPEG
    { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: false, fileType: 'image/jpeg' },

    // Tier 4: Aggressive JPEG (Last Resort)
    // Ensure we get *something* uploaded, even if small
    { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: false, fileType: 'image/jpeg' }
  ];

  let lastError;

  for (const options of attempts) {
    try {
      // console.log(`Attempting compression with options:`, options);
      const compressedBlob = await imageCompression(file, options);

      // If the result is somehow still huge (unlikely with maxSizeMB, but possible if lib fails),
      // we check here. The goal is to be under 5MB for the server.
      if (compressedBlob.size > 5 * 1024 * 1024) {
        throw new Error('Compressed file still too large');
      }

      // Construct proper file extension and name
      const ext = options.fileType === 'image/webp' ? 'webp' : 'jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const newFileName = `${baseName}.${ext}`;

      return new File([compressedBlob], newFileName, {
        type: options.fileType,
        lastModified: Date.now(),
      });

    } catch (error) {
      console.warn(`Compression attempt failed for ${options.maxWidthOrHeight}px:`, error);
      lastError = error;
      // Continue to next attempt
    }
  }

  console.error('All compression attempts failed. Returning original file.', lastError);
  return file;
}
