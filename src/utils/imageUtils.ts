import imageCompression from "browser-image-compression";

const ONE_MB = 1 * 1024 * 1024; // 1MB in bytes

export async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= ONE_MB) {
    return file;
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    return file;
  }
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getBase64WithMimeType(file: File): Promise<string> {
  const compressedFile = await compressImageIfNeeded(file);
  const base64data = await readFileAsBase64(compressedFile);
  const mimeType = compressedFile.type || "image/png";
  return `data:${mimeType};base64,${base64data.split(",")[1]}`;
}