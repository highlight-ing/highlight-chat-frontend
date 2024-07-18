import { ClipboardText, Document, Sound } from "iconsax-react";
import { useState } from "react";
import { CloseIcon } from "../icons/icons";
import Tooltip from "./Tooltip";
import { useStore } from "@/providers/store-provider";

interface AttachmentProps {
  type: "audio" | "clipboard" | "image" | "pdf";
  value: string;
  removeEnabled?: boolean;
}

export const Attachment = ({
  type,
  value,
  removeEnabled = false,
}: AttachmentProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { removeAttachment } = useStore((state) => ({
    removeAttachment: state.removeAttachment,
  }));

  return (
    <Tooltip
      key="attachment-tooltip"
      tooltip={
        <div className="max-w-[300px] max-h-[100px] line-clamp-3">{value}</div>
      }
      position="right"
      disabled={
        !value || value.length === 0 || type === "image" || type === "pdf"
      }
    >
      <div
        className={`group relative flex items-center justify-center h-12 min-w-12 rounded-md border border-light-10 bg-light-20 ${
          type === "pdf" ? "max-w-fit" : "max-w-20"
        } w-fit`}
      >
        {type === "image" && (
          <img
            className="transition-opacity transition-padding duration-150 ease-in-out flex h-10 max-w-22 w-auto items-center overflow-hidden rounded-sm opacity-50 pointer-events-none"
            style={{ opacity: isImageLoaded ? 1 : 0 }}
            src={value}
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
        {type === "clipboard" && <ClipboardText className="text-white" />}
        {type === "audio" && <Sound className="text-white" />}
        {type === "pdf" && (
          <div className="flex flex-1 justify-center align-center gap-2 p-2 w-full">
            <Document className="text-white min-w-5" />
            <span className="flex justify-center items-center text-sm text-white truncate">
              {value}
            </span>
          </div>
        )}
        {removeEnabled && (
          <div
            className="absolute top-[-5px] right-[-5px] hidden group-hover:flex cursor-pointer text-light-80"
            onClick={() => removeAttachment(type)}
          >
            <CloseIcon size={16} />
          </div>
        )}
      </div>
    </Tooltip>
  );
};
