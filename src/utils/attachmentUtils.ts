import { compressImageIfNeeded, readFileAsBase64 } from "./imageUtils";

interface Attachment {
  type: string;
  value: any;
  file?: File;
}

interface AttachmentResult {
  screenshot?: string;
  audio?: string;
  fileTitle?: string;
}

export default async function addAttachmentsToFormData(
  formData: FormData,
  attachments: any[]
) {
  let screenshot, audio, fileTitle;

  for (const attachment of attachments) {
    if (attachment?.value) {
      switch (attachment.type) {
        case "image":
        case "screenshot":
          screenshot = attachment.value;
          if (attachment.file) {
            const compressedFile = await compressImageIfNeeded(attachment.file);
            const base64data = await readFileAsBase64(compressedFile);
            const mimeType = compressedFile.type || "image/png";
            const base64WithMimeType = `data:${mimeType};base64,${
              base64data.split(",")[1]
            }`;
            formData.append("base64_image", base64WithMimeType);
          } else if (
            typeof attachment.value === "string" &&
            attachment.value.startsWith("data:image")
          ) {
            formData.append("base64_image", attachment.value);
          } else {
            console.error("Unsupported image format:", attachment.value);
          }
          break;
        case "pdf":
          fileTitle = attachment.value.name;
          formData.append("pdf", attachment.value);
          break;
        case "audio":
          audio = attachment.value;
          formData.append("audio", attachment.value.slice(0, 1000));
          break;
        default:
          console.warn("Unknown attachment type:", attachment.type);
      }
    }
  }

  return { screenshot, audio, fileTitle };
}

export function getAttachmentFromContext(context: any, type: string): string {
  return context.attachments?.find((a: Attachment) => a.type === type)?.value ?? "";
}