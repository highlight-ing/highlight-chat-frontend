import {useEffect, useRef, useState} from "react";
import {useApi} from "@/hooks/useApi";
import {useStore} from "@/providers/store-provider";

export interface ChatHistoryItem {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
}

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[];
}

export const useChatHistory = (): ChatHistoryItem[] => {
  const {get} = useApi()
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const conversationId = useStore(({conversationId}) => conversationId)
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()

  const fetchResponse = async () => {
    try {
      const response = await get('history/')
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: ChatHistoryResponse = await response.json();
      setChatHistory(data.conversations);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory([]);
    }
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    if (!chatHistory?.length) {
      fetchResponse();
      return
    }
    if (!chatHistory.some(chat => chat.id === conversationId)) {
      fetchResponse()

      // Hope that a title is assigned within a second or two
      fetchTimeoutRef.current = setTimeout(() => {
        fetchResponse()
        fetchTimeoutRef.current = undefined
      }, 2000)
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [conversationId]);

  return chatHistory;
};
