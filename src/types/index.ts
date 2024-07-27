type WindowAttachment = {
  title: string;
  thumbnailUrl?: string;
};

export type UserMessage = {
  type: "user";
  screenshot?: string;
  clipboardText?: string;
  audio?: string;
  window?: WindowAttachment;
  fileTitle?: string;
  content: string;
};

export type AssistantMessage = {
  type: "assistant";
  content: string;
};

export type Message = UserMessage | AssistantMessage;

export type CompareResult = {
  overview: string[];
  grok: string[];
  claude: string[];
};

export interface TopBarProps {
  showHistory?: boolean;
  setShowHistory?: (show: boolean) => void;
}

export interface ImageAttachment {
  type: "image";
  value: string;
  file?: File;
}

export interface PdfAttachment {
  type: "pdf";
  value: File;
}

export interface AudioAttachment {
  type: "audio";
  value: string;
}

export type Attachment = ImageAttachment | PdfAttachment | AudioAttachment;

export interface ChatHistoryItem {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
}

export interface ModalObjectProps {
  id: string
  context?: Record<string, any>
}
