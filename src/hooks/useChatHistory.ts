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

  const fetchNewConversation = async (conversationId: string): Promise<ChatHistoryItem | null> => {
    try {
      const response = await get(`history/${conversationId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  }
  

  useEffect(() => {
    if (!initialFetchDone.current) {
      // Initial fetch
      fetchResponse();
      initialFetchDone.current = true;
    } else if (conversationId && !history.some(chat => chat.id === conversationId)) {
      // New conversation found after initial fetch
      console.log('Fetching new conversation');
      fetchNewConversation(conversationId).then(newConversation => {
        if (newConversation) {
          setHistory([newConversation, ...history]);
        }
      });
    } else if (conversationId) {
      // Existing code for updating "New Conversation" title
      const chat = history.find(chat => chat.id === conversationId)
      if (chat?.title === 'New Conversation' && fetchRetryCountRef.current < MAX_RETRIES) {
        console.log(`Fetching updated conversation, ${MAX_RETRIES - fetchRetryCountRef.current} tries remaining`)

        // Retry until title is assigned
        fetchRetryRef.current = setTimeout(async () => {
          const updatedConversation = await fetchNewConversation(conversationId);
          if (updatedConversation && updatedConversation.title !== 'New Conversation') {
            const updatedHistory = history.map(chat => 
              chat.id === conversationId ? updatedConversation : chat
            );
            setHistory(updatedHistory);
            fetchRetryCountRef.current = 0;
            console.log('Updated conversation');
          } else {
            fetchRetryCountRef.current++;
          }
          fetchRetryRef.current = undefined;
        }, RETRY_INTERVAL)
      }
    }

    return () => {
      if (fetchRetryRef.current) {
        clearTimeout(fetchRetryRef.current);
      }
    }
  }, [history, conversationId]);

  return {
    history,
    refreshChatHistory: fetchResponse
  };
};