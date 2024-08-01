import {useEffect, useRef} from "react";
import {useApi} from "@/hooks/useApi";
import {useStore} from "@/providers/store-provider";
import {ChatHistoryItem} from "@/types";

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[];
}

export const useChatHistory = (): {history: ChatHistoryItem[], refreshChatHistory: () => Promise<ChatHistoryItem[]>} => {
  const {get} = useApi()
  const {conversationId, history, setHistory} = useStore((state) => state);

  const fetchResponse = async () => {
    console.log('fetching chat history')
    try {
      const response = await get('history/')
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: ChatHistoryResponse = await response.json();
      setHistory(data.conversations);
      return data.conversations
    } catch (error) {
      console.error("Error fetching response:", error);
      if (history.length > 0) {
        setHistory([]);
      }
      return []
    }
  };

  // Handle initial fetch of chat history
  useEffect(() => {
    console.log('Initial fetch of chat history')
    fetchResponse();
  }, [])

  useEffect(() => {
    console.log('Checking for new conversation')
    // If a new conversationId is found
    if (conversationId && !history.some(chat => chat.id === conversationId)) {
      console.log('Refreshing chat history, new conversation found')
      fetchResponse()
    }
  }, [history, conversationId]);

  return {
    history,
    refreshChatHistory: fetchResponse
  };
};