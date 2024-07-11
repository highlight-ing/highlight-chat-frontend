import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ConversationContextType {
  conversationId: string | null;
  resetConversationId: () => void;
  getOrCreateConversationId: () => string;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  const resetConversationId = () => setConversationId(null);

  const getOrCreateConversationId = () => {
    if (!conversationId) {
      const newId = uuidv4();
      setConversationId(newId);
      return newId;
    }
    return conversationId;
  };

  return (
    <ConversationContext.Provider value={{ conversationId, resetConversationId, getOrCreateConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
};