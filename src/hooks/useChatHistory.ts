import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";

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
  const { accessToken, refreshAccessToken } = useAuthContext();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  const fetchResponse = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:8080/";
      const requestUrl = `${backendUrl}chat-history`;
      let response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token has expired, refresh it
        await refreshAccessToken();
        // Retry the request with the new token
        response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

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
    if (accessToken) {
      fetchResponse();
    }
  }, [accessToken]);

  return chatHistory;
};
