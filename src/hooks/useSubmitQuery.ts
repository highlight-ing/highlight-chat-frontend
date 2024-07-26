import { HighlightContext } from "@highlight-ai/app-runtime";
import imageCompression from "browser-image-compression";
import { useStore } from "@/providers/store-provider";
import useAuth from "./useAuth";

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

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

export const useSubmitQuery = () => {
  const { attachments, clearAttachments, input, setInput, setIsDisabled } =
    useStore((state) => ({
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      input: state.input,
      setInput: state.setInput,
      setIsDisabled: state.setInputIsDisabled,
    }));

  const { messages, addMessage, updateLastMessage } = useStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    updateLastMessage: state.updateLastMessage,
  }));

  const { highlightContext } = useStore((state) => ({
    highlightContext: state.highlightContext,
  }));

  const { getOrCreateConversationId, resetConversationId } = useStore(
    (state) => ({
      getOrCreateConversationId: state.getOrCreateConversationId,
      resetConversationId: state.resetConversationId,
    })
  );

  const { getTokens } = useAuth();

  const { aboutMe } = useStore((state) => ({
    aboutMe: state.aboutMe,
  }));

  const fetchResponse = async (formData: FormData, token: string) => {
    setIsDisabled(true);

    try {
      const conversationId = getOrCreateConversationId();
      formData.append("conversation_id", conversationId);

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:8080/";
      let response = await fetch(`${backendUrl}api/v1/chat/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedResponse = "";
      addMessage({ type: "assistant", content: "" });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);

        // Directly append the chunk to the accumulated response
        accumulatedResponse += chunk;

        // Update the UI with the accumulated response
        updateLastMessage({ type: "assistant", content: accumulatedResponse });
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      addMessage({
        type: "assistant",
        content: "Sorry, there was an error processing your request.",
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const prepareHighlightContext = (highlightContext: any) => {
    if (!highlightContext) return "";

    const processedContext = { ...highlightContext };

    if (processedContext.attachments) {
      processedContext.attachments = processedContext.attachments.filter(
        (attachment: any) =>
          attachment.type !== "screenshot" && attachment.type !== "audio"
      );
    }

    return (
      "\n\nHighlight Context:\n" + JSON.stringify(processedContext, null, 2)
    );
  };

  const handleIncomingContext = async (
    context: HighlightContext,
    systemPrompt?: string
  ) => {
    console.log("Received context inside handleIncomingContext: ", context);
    if (!context.suggestion || context.suggestion.trim() === "") {
      console.log("No context received, ignoring.");
      return;
    }

    if (!context.application) {
      console.log("No application data in context, ignoring.");
      return;
    }
    // Check if the context is empty, only contains empty suggestion and attachments, or has no application data
    if (!context.attachments || context.attachments.length === 0) {
      console.log("Empty or invalid context received, ignoring.");
      return;
    }

    console.log("context:", context);
    resetConversationId(); // Reset conversation ID for new incoming context

    let query = context.suggestion || "";
    let screenshotUrl =
      context.attachments?.find((a) => a.type === "screenshot")?.value ?? "";
    let clipboardText =
      context.attachments?.find((a) => a.type === "clipboard")?.value ?? "";
    let ocrScreenContents = context.environment?.ocrScreenContents ?? "";
    let rawContents = context.application?.focusedWindow?.rawContents;
    let audio =
      context.attachments?.find((a) => a.type === "audio")?.value ?? "";

    if (
      query ||
      clipboardText ||
      ocrScreenContents ||
      screenshotUrl ||
      rawContents ||
      audio
    ) {
      addMessage({
        type: "user",
        content: query,
        clipboardText,
        screenshot: screenshotUrl,
        audio,
      });

      setInput("");
      clearAttachments(); // Clear the attachment immediately

      const formData = new FormData();
      formData.append("prompt", query);
      if (systemPrompt) {
        formData.append("system_prompt", systemPrompt);
      }

      // Add previous messages to form data as an array of objects
      const previousMessages = messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
      }));
      formData.append("previous_messages", JSON.stringify(previousMessages));

      let contextString = prepareHighlightContext(context);

      if (contextString.trim() === "") {
        contextString =
          "This is a new conversation with Highlight Chat. You do not have any Highlight Context available.";
      }

      console.log("contextString:", contextString);
      formData.append("context", contextString);

      // Add about_me to form data
      if (aboutMe) {
        formData.append("about_me", JSON.stringify(aboutMe));
      }

      const contextAttachments = context.attachments || [];
      await addAttachmentsToFormData(formData, contextAttachments);
      const { accessToken } = await getTokens();
      await fetchResponse(formData, accessToken);
    }
  };

  const handleSubmit = async (systemPrompt?: string) => {
    const query = input.trim();

    if (!query) {
      console.log("No query provided, ignoring.");
      return;
    }

    if (query) {
      const formData = new FormData();
      formData.append("prompt", query);
      if (systemPrompt) {
        formData.append("system_prompt", systemPrompt);
      }

      // Add about_me to form data
      if (aboutMe) {
        formData.append("about_me", JSON.stringify(aboutMe));
      }

      // Add previous messages to form data as an array of objects
      const previousMessages = messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
      }));
      formData.append("previous_messages", JSON.stringify(previousMessages));

      const { screenshot, audio, fileTitle } = await addAttachmentsToFormData(
        formData,
        attachments
      );

      addMessage({
        type: "user",
        content: query,
        screenshot,
        audio,
        fileTitle,
      });

      setInput("");
      clearAttachments(); // Clear the attachment immediately

      let contextString = prepareHighlightContext(highlightContext);

      if (contextString.trim() === "") {
        contextString =
          "This is a new conversation with Highlight Chat. You do not have any Highlight Context available.";
      }

      console.log("contextString:", contextString);
      formData.append("context", contextString);

      // If it's a new conversation, reset the conversation ID
      if (messages.length === 0) {
        resetConversationId();
      }

      const { accessToken } = await getTokens();
      await fetchResponse(formData, accessToken);
    }
  };

  return { handleSubmit, handleIncomingContext };
};
