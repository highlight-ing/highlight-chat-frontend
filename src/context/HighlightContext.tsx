import React, { createContext, useContext, useState } from "react";
import { Message } from "../types/types";
import { HighlightContext } from "@highlight-ai/app-runtime";

interface HighlightContextContextProps {
  highlightContext: HighlightContext | undefined;
  setHighlightContext: (highlightContext: HighlightContext | undefined) => void;
}

export const HighlightContextContext =
  createContext<HighlightContextContextProps>({
    highlightContext: {} as HighlightContext,
    setHighlightContext: () => {},
  });

export const HighlightContextContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [highlightContext, setHighlightContext] = useState<
    HighlightContext | undefined
  >(undefined);

  return (
    <HighlightContextContext.Provider
      value={{ highlightContext, setHighlightContext }}
    >
      {children}
    </HighlightContextContext.Provider>
  );
};

export const useHighlightContextContext = () => {
  return useContext(HighlightContextContext);
};
