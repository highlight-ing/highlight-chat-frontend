import {useEffect, useRef} from "react";
import {useApi} from "@/hooks/useApi";
import {useStore} from "@/providers/store-provider";
import {ChatHistoryItem} from "@/types";
import {useShallow} from "zustand/react/shallow";

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[];
}

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 10000

export const useChatHistory = (): {history: ChatHistoryItem[], refreshChatHistory: () => Promise<ChatHistoryItem[]>} => {
  const {get} = useApi()
  const {conversationId, history, setHistory} = useStore(
    useShallow((state) => ({
      conversationId: state.conversationId,
      history: state.history,
      setHistory: state.setHistory
    }))
  );
  const initialFetchDone = useRef(false);
  const fetchRetryRef = useRef<NodeJS.Timeout>()
  const fetchRetryCountRef = useRef(0)

  const fetchResponse = async () => {
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

  useEffect(() => {
    if (!initialFetchDone.current) {
      // Initial fetch
      fetchResponse();
      initialFetchDone.current = true;
    } else if (conversationId && !history.some(chat => chat.id === conversationId)) {
      // New conversation found after initial fetch
      console.log('Refreshing chat history, new conversation found');
      fetchResponse();
    } else {
      // If the latest conversation title is "New Conversation"
      const chat = history.find(chat => chat.id === conversationId)
      if (chat?.title === 'New Conversation' && fetchRetryCountRef.current < MAX_RETRIES) {
        console.log(`Refreshing chat history until title is provided, ${MAX_RETRIES - fetchRetryCountRef.current} tries remaining`)

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
        }, RETRY_INTERVAL)
      }
    }

    return () => {
      if (fetchRetryRef.current) {
        clearInterval(fetchRetryRef.current)
      }
    }
  }, [history, conversationId]);

  return {
    history,
    refreshChatHistory: fetchResponse
  };
};
