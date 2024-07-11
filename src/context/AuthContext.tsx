import React, { createContext, useContext, useEffect, useState } from "react";
import Highlight from "@highlight-ai/app-runtime";
import { Attachment } from "../types/types";

interface AuthContextProps {
  refreshAccessToken: () => Promise<string>;
  getAccessToken: () => Promise<string>;
  accessToken?: string;
}

const initialContext: AuthContextProps = {
  refreshAccessToken: async () => "",
  getAccessToken: async () => "",
  accessToken: undefined,
};

export const AuthContext = createContext<AuthContextProps>(initialContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    undefined
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateUser = async () => {
    if (isAuthenticating) {
      return null;
    }

    setIsAuthenticating(true);
    try {
      const { accessToken, refreshToken } = await Highlight.auth.signIn();
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      return accessToken;
    } catch (error) {
      console.error("Authentication failed:", error);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch("/api/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const { accessToken: newAccessToken } = await response.json();
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string> => {
    if (!accessToken) {
      const newAccessToken = await authenticateUser();
      if (newAccessToken) {
        return newAccessToken;
      } else {
        throw new Error("No access token");
      }
    }

    return accessToken;
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshAccessToken, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
