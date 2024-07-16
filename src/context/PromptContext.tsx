import React, { createContext, useContext, useState } from "react";
import { Message } from "../types/types";

interface MessagesContextProps {
  prompt?: string;
  setPrompt: (prompt: string) => void;
}

export const PromptContext = createContext<MessagesContextProps>({
  prompt: undefined,
  setPrompt: () => {},
});

export const PromptContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [prompt, setPrompt] = useState<string>();

  return (
    <PromptContext.Provider value={{ prompt, setPrompt }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePromptContext = () => {
  return useContext(PromptContext);
};
