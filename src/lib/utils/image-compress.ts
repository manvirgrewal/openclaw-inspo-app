/**
 * Avatar image compression pipeline.
 *
 * Target: 256×256, WebP @ 75% quality (~10-30KB).
 * Falls back to JPEG if WebP not supported.
 * Returns a compact data URL ready for storage.
 */

const AVATAR_SIZE = 256;
const WEBP_QUALITY = 0.75;
const JPEG_QUALITY = 0.8;
const MAX_FILE_BYTES = 50_000; // 50KB hard cap

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Load an image from a File or data URL */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Read a File as a data URL */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Crop + resize + compress an image.
 * Returns a small data URL suitable for localStorage or DB storage.
 */
export async function cropAndCompress(
  imageSrc: string,
  cropArea: CropArea,
  size: number = AVATAR_SIZE
): Promise<string> {
  const img = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Enable image smoothing for downscale quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the cropped region, scaled to target size
  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    size,
    size
  );

  // Try WebP first (smaller), fall back to JPEG
  let dataUrl = canvas.toDataURL("image/webp", WEBP_QUALITY);

  // Check if browser actually produced WebP (some Safari versions don't)
  if (!dataUrl.startsWith("data:image/webp")) {
    dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  }

  // If still too large, progressively reduce quality
  let quality = WEBP_QUALITY;
  const format = dataUrl.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
  while (dataUrl.length > MAX_FILE_BYTES * 1.37 && quality > 0.3) {
    // 1.37 factor: base64 overhead ratio
    quality -= 0.1;
    dataUrl = canvas.toDataURL(format, quality);
  }

  // Last resort: shrink dimensions
  if (dataUrl.length > MAX_FILE_BYTES * 1.37) {
    const smallCanvas = document.createElement("canvas");
    const smallSize = Math.round(size * 0.75);
    smallCanvas.width = smallSize;
    smallCanvas.height = smallSize;
    const smallCtx = smallCanvas.getContext("2d")!;
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.imageSmoothingQuality = "high";
    smallCtx.drawImage(canvas, 0, 0, smallSize, smallSize);
    dataUrl = smallCanvas.toDataURL(format, quality);
  }

  return dataUrl;
}

/** Quick helper: estimate the byte size of a data URL */
export function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round(base64.length * 0.75);
}
