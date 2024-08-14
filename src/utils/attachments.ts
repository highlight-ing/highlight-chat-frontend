import { AudioAttachment } from "@/types";
import { getDurationUnit } from "./string";

export const getAudioAttachmentPreview = (
  attachment: AudioAttachment
): string => {
  if (attachment.duration === 0) return attachment.value;

  let durationString = "";
  // If the duration can be represented as a whole number of hours use hours
  if (attachment.duration % 60 === 0) {
    durationString = `${attachment.duration / 60} ${getDurationUnit(
      attachment.duration,
      "hours"
    )}`;
  } else {
    durationString = `${attachment.duration} ${getDurationUnit(
      attachment.duration,
      "minutes"
    )}`;
  }

  return `Last ${durationString}:\n${attachment.value}`;
};

export function base64ToFile(
  base64String: string,
  fileName: string,
  mimeType: string
): File | null {
  try {
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");

    // Decode the base64 string
    const binaryString = Buffer.from(base64Data, "base64");

    // Create a Uint8Array from the Buffer
    const bytes = new Uint8Array(binaryString);

    return new File([bytes], fileName, { type: mimeType });
  } catch (error) {
    console.error(
      "Error converting base64 to File:",
      fileName,
      JSON.stringify(error)
    );
    return null;
  }
}
