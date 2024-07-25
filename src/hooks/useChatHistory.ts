import { useEffect, useState } from "react";
import useAuth from "./useAuth";

interface ChatHistoryItem {
  id: string;
  context: string;
  created_at: string;
  updated_at: string;
  userId: string;
  messages: any[];
}

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[];
}

export const useChatHistory = (): ChatHistoryItem[] => {
  const { getTokens } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  const fetchResponse = async () => {
    const { accessToken } = await getTokens();

    try {
      const backendUrl = "http://0.0.0.0:8080/api/v1/history/";
        //process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:8080/";
      const requestUrl = `${backendUrl}`;
      let response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: ChatHistoryResponse = await response.json();
      console.log("chat history:", data);
      setChatHistory(data.conversations);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory([]);
    }
  };

  useEffect(() => {
    fetchResponse();
  }, []);

  return chatHistory;
};
