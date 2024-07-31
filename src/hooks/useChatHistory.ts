import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useStore } from "@/providers/store-provider";
import { ChatHistoryItem } from "@/types";

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[];
}

export const useChatHistory = (): {
  history: ChatHistoryItem[];
  refreshChatHistory: () => Promise<ChatHistoryItem[]>;
} => {
  const { get } = useApi();
  const { conversationId, history, setHistory } = useStore((state) => state);

  const fetchResponse = async () => {
    try {
      console.log("Fetching chat history");
      const response = await get('history/');
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: ChatHistoryResponse = await response.json();
      setHistory(data.conversations);
      return data.conversations;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // setHistory([]);
      return [];
    }
  };

  // Handle initial fetch of chat history
  useEffect(() => {
    fetchResponse();
  }, []);

  // Refresh chat history when a new conversation is created
  useEffect(() => {
    if (conversationId && !history.some(chat => chat.id === conversationId)) {
      console.log('Refreshing chat history, new conversation found');
      fetchResponse();
    }
  }, [conversationId, history]);

  return {
    history,
    refreshChatHistory: fetchResponse
  };
};