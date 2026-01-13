import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1200,
    useWebWorker: false,
    fileType: 'image/webp',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // ensure new file has proper name and extension
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([compressedFile], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Initial image compression failed. Retrying with fallback options...', error);

    // Fallback options: smaller dimensions, lower quality, standard JPEG (sometimes safer than WebP on old devices)
    const fallbackOptions = {
      maxSizeMB: 0.5, // Slightly larger limit to avoid aggressive compression loop issues
      maxWidthOrHeight: 800, // Smaller dimensions
      useWebWorker: false,
      fileType: 'image/jpeg', // Fallback to JPEG
    };

    try {
      const compressedFallback = await imageCompression(file, fallbackOptions);
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
      return new File([compressedFallback], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } catch (fallbackError) {
      console.error('All image compression attempts failed:', fallbackError);
      return file; // Return original as last resort
    }
  }
}
