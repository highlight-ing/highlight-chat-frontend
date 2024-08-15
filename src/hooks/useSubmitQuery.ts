import { type HighlightContext } from "@highlight-ai/app-runtime";
import Highlight from "@highlight-ai/app-runtime";
import imageCompression from "browser-image-compression";
import { useStore } from "@/providers/store-provider";
import useAuth from "./useAuth";
import { useApi } from "@/hooks/useApi";
import { PromptApp } from "@/types";
import { useShallow } from "zustand/react/shallow";
import { base64ToFile } from "@/utils/attachments";

async function compressImageIfNeeded(file: File): Promise<File> {
  const ONE_MB = 1 * 1024 * 1024; // 1MB in bytes
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

async function fetchWindows() {
  const windows = await Highlight.user.getWindows();
  return windows.map((window) => window.windowTitle);
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// TODO: Handle .docx and .pptx
const textBasedTypes = [
  "application/json",
  "application/xml",
  "application/javascript",
];

// TODO: Consolidate the two attachment types
// Should just remove the HLC-specific code and use the Highlight API
export default async function addAttachmentsToFormData(
  formData: FormData,
  attachments: any[]
) {
  let screenshot, audio, fileTitle, clipboardText, ocrText;

  for (const attachment of attachments) {
    if (attachment?.value) {
      switch (attachment.type) {
        case "file":
          const mime = attachment?.mimeType;
          if (mime === "application/pdf") {
            let pdfFile = base64ToFile(
              attachment.value,
              attachment.fileName,
              "application/pdf"
            );
            if (pdfFile) {
              formData.append("pdf", pdfFile);
            }
          } else if (mime.startsWith("image/")) {
            let imageFile = base64ToFile(
              attachment.value,
              attachment.fileName,
              mime
            );
            if (!imageFile) continue;
            const compressedFile = await compressImageIfNeeded(imageFile);
            const base64data = await readFileAsBase64(compressedFile);
            const mimeType = compressedFile.type || "image/png";
            const base64WithMimeType = `data:${mimeType};base64,${
              base64data.split(",")[1]
            }`;
            formData.append("base64_image", base64WithMimeType);
          } else if (
            mime === "application/vnd.ms-excel" ||
            mime ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ) {
            formData.append("spreadsheet", attachment.value);
          } else if (
            mime.startsWith("text/") ||
            textBasedTypes.includes(attachment.mimeType)
          ) {
            formData.append("text_file", attachment.value);
          } else {
            console.error("Unsupported file type:", attachment.mimeType);
          }
          break
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
          formData.append("audio", attachment.value);
          break;
        case "spreadsheet":
          fileTitle = attachment.value.name;
          formData.append("spreadsheet", attachment.value);
          break;
        case "clipboard":
          clipboardText = attachment.value;
          formData.append("clipboard_text", attachment.value);
          break;
        case "ocr":
          ocrText = attachment.value;
          formData.append("ocr_text", attachment.value);
          break;
        default:
          console.warn("Unknown attachment type:", attachment.type);
      }
    }
  }

  return { screenshot, audio, fileTitle, clipboardText, ocrText };
}

const prepareHighlightContext = (highlightContext: any) => {
  if (!highlightContext) return "";

  const processedContext = { ...highlightContext };

  if (processedContext.attachments) {
    processedContext.attachments = processedContext.attachments.filter(
      (attachment: any) =>
        attachment.type !== "screenshot" && attachment.type !== "audio"
    );
  }

  return JSON.stringify(processedContext);
};

export const useSubmitQuery = () => {
  const { post } = useApi();

  const { addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
    }))
  );

  const {
    getOrCreateConversationId,
    attachments,
    clearAttachments,
    input,
    setInput,
    setIsDisabled,
    addMessage,
    updateLastMessage,
    aboutMe,
  } = useStore(
    useShallow((state) => ({
      getOrCreateConversationId: state.getOrCreateConversationId,
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      input: state.input,
      setInput: state.setInput,
      setIsDisabled: state.setInputIsDisabled,
      addMessage: state.addMessage,
      updateLastMessage: state.updateLastMessage,
      aboutMe: state.aboutMe,
    }))
  );

  const { getAccessToken } = useAuth();

  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

  const showConfirmationModal = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal("confirmation-modal", {
        header: "Additional Context Requested",
        children: message,
        primaryAction: {
          label: "Allow",
          onClick: () => {
            closeModal("confirmation-modal");
            resolve(true);
          },
          variant: "primary",
        },
        secondaryAction: {
          label: "Deny",
          onClick: () => {
            closeModal("confirmation-modal");
            resolve(false);
          },
          variant: "ghost-neutral",
        },
      });
    });
  };

  const fetchResponse = async (formData: FormData, token: string) => {
    setIsDisabled(true);

    try {
      const conversationId = getOrCreateConversationId();
      formData.append("conversation_id", conversationId);

      const response = await post("chat_v2/", formData);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedResponse = "";
      addMessage({ role: "assistant", content: "" });

      let contextConfirmed = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);

        // Split the chunk into individual JSON objects
        const jsonObjects = chunk.split(/(?<=})\s*(?=\{)/);

        for (const jsonStr of jsonObjects) {
          try {
            const jsonChunk = JSON.parse(jsonStr);
            console.log("jsonChunk: ", jsonChunk);

            if (jsonChunk.type === "text" && jsonChunk.content) {
              accumulatedResponse += jsonChunk.content;
              updateLastMessage({
                role: "assistant",
                content: accumulatedResponse,
              });
            } else if (
              jsonChunk.type === "tool_use" ||
              jsonChunk.type === "tool_use_input"
            ) {
              console.log(`${jsonChunk.type}:`, jsonChunk);

              if (contextConfirmed === null) {
                contextConfirmed = await showConfirmationModal(
                  "The assistant is requesting additional context. Do you want to allow this?"
                );
              }

              if (contextConfirmed) {
                console.log("Additional context request allowed");
                if (jsonChunk.content) {
                  if (jsonChunk.content.window) {
                    const screenshot = await Highlight.user.getWindowScreenshot(
                      jsonChunk.content.window
                    );
                    console.log("screenshot: ", screenshot);
                    addAttachment({
                      type: "image",
                      value: screenshot,
                    });
                  } else if (jsonChunk.content.windows) {
                    // Handle multiple windows if available
                    for (const window of jsonChunk.content.windows) {
                      const screenshot =
                        await Highlight.user.getWindowScreenshot(window);
                      console.log("screenshot for window:", window, screenshot);
                      addAttachment({
                        type: "image",
                        value: screenshot,
                      });
                    }
                  } else {
                    console.log(
                      "No specific window information available in the request"
                    );
                  }

                  // Handle other potential content types
                  if (jsonChunk.content.clipboard) {
                    addAttachment({
                      type: "clipboard",
                      value: jsonChunk.content.clipboard,
                    });
                  }
                  // Add more conditions for other content types as needed
                } else {
                  console.log("No content available in the request");
                }
              } else {
                console.log("Additional context request denied");
                if (jsonChunk.type === "tool_use") {
                  updateLastMessage({
                    role: "assistant",
                    content:
                      accumulatedResponse +
                      "\n\nI'm sorry, but I wasn't able to access the additional context I requested.",
                  });
                }
              }
            } else if (jsonChunk.type === "error") {
              console.error("Error from backend:", jsonChunk.content);
              updateLastMessage({
                role: "assistant",
                content: "Sorry, an error occurred: " + jsonChunk.content,
              });
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            accumulatedResponse += jsonStr;
            updateLastMessage({
              role: "assistant",
              content: accumulatedResponse,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const handleIncomingContext = async (
    context: HighlightContext,
    navigateToNewChat: () => void,
    promptApp?: PromptApp
  ) => {
    console.log("Received context inside handleIncomingContext: ", context);
    console.log("Got attachment count: ", context.attachments?.length);
    context.attachments?.map((attachment) => {
      console.log("Attachment: ", JSON.stringify(attachment));
    });
    if (!context.suggestion || context.suggestion.trim() === "") {
      console.log("No context received, ignoring.");
      return;
    }

    if (!context.application) {
      console.log("No application data in context, ignoring.");
      return;
    }
    // Check if the context is empty, only contains empty suggestion and attachments, or has no application data
    if (
      !context.suggestion &&
      (!context.attachments || context.attachments.length === 0)
    ) {
      console.log("Empty or invalid context received, ignoring.");
      return;
    }

    let query = context.suggestion || "";
    let screenshotUrl = context.attachments?.find(
      (a) => a.type === "screenshot"
    )?.value;
    let clipboardText = context.attachments?.find(
      (a) => a.type === "clipboard"
    )?.value;
    let ocrScreenContents = context.environment?.ocrScreenContents;
    let rawContents = context.application?.focusedWindow?.rawContents;
    let audio = context.attachments?.find((a) => a.type === "audio")?.value;
    let windowTitle = context.application?.focusedWindow?.title;

    // Fetch windows information
    const windows = await fetchWindows();

    if (
      query ||
      clipboardText ||
      ocrScreenContents ||
      screenshotUrl ||
      rawContents ||
      audio
    ) {
      addMessage({
        role: "user",
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle } : undefined,
        windows: windows, // Add windows information to the message
      });

      setInput("");
      clearAttachments(); // Clear the attachment immediately

      const formData = new FormData();
      formData.append("prompt", query);
      formData.append("windows", JSON.stringify(windows)); // Add windows to formData

      console.log("prompt app: ", promptApp);
      if (promptApp) {
        formData.append("app_id", promptApp.id.toString());
      }

      // Add about_me to form data
      if (aboutMe) {
        formData.append("about_me", JSON.stringify(aboutMe));
      }

      const contextAttachments = context.attachments || [];
      await addAttachmentsToFormData(formData, contextAttachments);

      let contextString = prepareHighlightContext(context);

      if (contextString.trim() !== "") {
        formData.append("context", contextString);
      }

      const accessToken = await getAccessToken();
      await fetchResponse(formData, accessToken);
    }
  };

  const handleSubmit = async (promptApp?: PromptApp) => {
    const query = input.trim();

    if (!query) {
      console.log("No query provided, ignoring.");
      return;
    }

    if (query) {
      const formData = new FormData();
      formData.append("prompt", query);
      if (promptApp) {
        formData.append("app_id", promptApp.id.toString());
      }

      // Add about_me to form data
      if (aboutMe) {
        formData.append("about_me", JSON.stringify(aboutMe));
      }

      // Fetch windows information
      const windows = await fetchWindows();
      formData.append("windows", JSON.stringify(windows));

      const { screenshot, audio, fileTitle, clipboardText, ocrText } =
        await addAttachmentsToFormData(formData, attachments);

      addMessage({
        role: "user",
        content: query,
        screenshot,
        audio,
        file_title: fileTitle,
        clipboard_text: clipboardText,
        windows: windows, // Add windows information to the message
      });

      setInput("");
      clearAttachments(); // Clear the attachment immediately

      const accessToken = await getAccessToken();
      await fetchResponse(formData, accessToken);
    }
  };

  return { handleSubmit, handleIncomingContext };
};
