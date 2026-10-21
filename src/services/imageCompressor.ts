/**
 * Client-side Canvas Image Compression Utility
 * Compresses large mobile camera uploads / payment screenshots before sending over network.
 * Reduces 5MB-15MB files down to ~300KB-800KB without visible quality loss, preventing timeouts.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeMB?: number;
}

export async function compressImageClient(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    maxSizeMB = 1.2,
  } = options;

  // If not an image (e.g. PDF, doc, zip, etc.), return untouched
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If already tiny (e.g. under 400 KB), no need to compress
  if (file.size <= 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.warn("[Compression] FileReader error, proceeding with original file");
      resolve(file);
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        console.warn("[Compression] Image load error, proceeding with original file");
        resolve(file);
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio preservation scale
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Optional white background for transparent PNGs converting to JPEG
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          // Always export to JPEG for maximum compression efficiency
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // If the compressed blob is actually bigger (rare, but possible on small PNGs), use original
              if (blob.size >= file.size) {
                resolve(file);
                return;
              }

              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], newFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              console.log(
                `[Compression] Optimized ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)} MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
              );

              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          console.warn("[Compression] Canvas processing failed, falling back to original:", err);
          resolve(file);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
