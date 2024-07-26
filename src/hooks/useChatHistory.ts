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

export const useChatHistory = (): {chatHistory: ChatHistoryItem[], refreshChatHistory: () => Promise<ChatHistoryItem[]>} => {
  const {get} = useApi()
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const conversationId = useStore(({conversationId}) => conversationId)
  const fetchRetryRef = useRef<NodeJS.Timeout>()
  const fetchRetryCountRef = useRef(0)

  const fetchResponse = async () => {
    try {
      const response = await get('history/')
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: ChatHistoryResponse = await response.json();
      setChatHistory(data.conversations);
      return data.conversations
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory([]);
      return []
    }
  };

  // Handle initial fetch of chat history
  useEffect(() => {
    fetchResponse();
  }, [])

  useEffect(() => {
    // If a new conversationId is found
    if (conversationId && !chatHistory.some(chat => chat.id === conversationId)) {
      console.log('Refreshing chat history, new conversation found')
      fetchResponse()
      return
    }

    // If the latest conversation title is "New Conversation"
    const chat = chatHistory.find(chat => chat.id === conversationId)
    if (chat?.title === 'New Conversation' && fetchRetryCountRef.current < 10) {
      console.log('Refreshing chat history until title is provided')

      // Retry until title is assigned
      fetchRetryRef.current = setTimeout(() => {
        fetchResponse()
          .then((conversations) => {
            const chat = conversations.find(chat => chat.id === conversationId)
            if (chat && chat.title !== 'New Conversation') {
              fetchRetryCountRef.current = 0
              console.log('Reset history retry counter')
            }
          })
        fetchRetryRef.current = undefined
        fetchRetryCountRef.current++
      }, 1000)
    }

    return () => {
      if (fetchRetryRef.current) {
        clearInterval(fetchRetryRef.current)
      }
    }
  }, [chatHistory, conversationId]);

  return {
    chatHistory,
    refreshChatHistory: fetchResponse
  };
};
