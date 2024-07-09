'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { MenuIcon, AddIcon, PaperclipIcon, MicIcon, AddSquareIcon, AssistantIcon, ClipboardTextIcon } from './icons/icons';
import { TopBarProps, Message, CompareResult } from './types/types';
import ReactMarkdown from 'react-markdown';
import {
  type HighlightContext,
} from "@highlight-ai/app-runtime";

import api from '@highlight-ai/app-runtime';
import Highlight from "@highlight-ai/app-runtime";

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const TopBar: React.FC<TopBarProps> = ({ mode, setMode, onNewConversation }) => {
  return (
    <header className="absolute top-0 left-0 right-0 border-b border-[rgba(255,255,255,0.05)]">
      <div className="flex w-[1122px] h-[64px] p-[12px] justify-end items-center mx-auto">
        <button 
          className="flex w-[24px] h-[24px] justify-center items-center"
          onClick={onNewConversation}
        >
          <AddIcon />
        </button>
      </div>
    </header>
  );
};

const HighlightChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [mode, setMode] = useState<'assistant' | 'compare'>('assistant');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'pdf' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [highlightContext, setHighlightContext] = useState<HighlightContext | null>(null);
  const highlightContextRef = useRef<HighlightContext | null>(null);
  const [screenshotPath, setScreenshotPath] = useState<string | null>(null);
  const [clipboardText, setClipboardText] = useState<string | null>(null);
  const [ocrScreenContents, setOcrScreenContents] = useState<string | null>(null);
  const [isClipboardSuggestion, setIsClipboardSuggestion] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { accessToken: newAccessToken } = await response.json();
      setAccessToken(newAccessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Handle the error (e.g., redirect to login page)
    }
  };

  const debouncedHandleSubmit = useCallback(
    debounce((context: HighlightContext) => {
      setInput(context.suggestion || '');
      handleSubmit(null, context);
    }, 300),
    []
  );

  useEffect(() => {
    api.addEventListener("onContext", (context: HighlightContext) => {
      console.log('Highlight context event listener called:', context);
      setHighlightContext(context);
      highlightContextRef.current = context;
      setScreenshotPath(context.environment.screenshotPath || null);
      setClipboardText(context.environment.clipboardText || null);
      setIsClipboardSuggestion(true);
      setOcrScreenContents(context.environment.ocrScreenContents || null);
      
      // Handle context with debounce
      debouncedHandleSubmit(context);
    });
  }, [debouncedHandleSubmit]);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        console.log('Authenticating user');
        const { accessToken, refreshToken } = await Highlight.auth.signIn();
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        console.log('Access Token:', accessToken); // Add this line to print the access token
        console.log('Refresh Token:', refreshToken); // Add this line to print the refresh token
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    };

    authenticateUser();
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSubmit(null, suggestion);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setAttachment(file);
      setAttachmentType(file.type.startsWith('image/') ? 'image' : 'pdf');
    } else {
      alert('Please select a valid image or PDF file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | null, contextOrSuggestion?: HighlightContext | string) => {
    if (e) e.preventDefault();
    
    let query: string;
    let context: HighlightContext | null = null;

    if (typeof contextOrSuggestion === 'string') {
      query = contextOrSuggestion;
    } else if (contextOrSuggestion && 'suggestion' in contextOrSuggestion) {
      query = contextOrSuggestion.suggestion || '';
      context = contextOrSuggestion;
    } else {
      query = input.trim();
    }

    if (query || attachment || clipboardText || ocrScreenContents) {
      setMessages(prevMessages => [...prevMessages, { 
        type: 'user', 
        content: query,
        attachment: attachment ? URL.createObjectURL(attachment) : undefined,
        clipboardText: clipboardText,
        ocrScreenContents: ocrScreenContents
      }]);
      setInput('');
      setIsWorking(true);
      setAttachment(null); // Clear the attachment immediately
      setIsClipboardSuggestion(false);
      setClipboardText(null);
      setOcrScreenContents(null);
      
      try {
        const formData = new FormData();
        formData.append('prompt', query);

        if (highlightContextRef.current) {
          console.log('appending highlight context', highlightContextRef.current);
          
          // Trim audio attachment and remove screenshot attachment
          if (highlightContextRef.current.attachments) {
            highlightContextRef.current.attachments = highlightContextRef.current.attachments
              .filter(attachment => attachment.type !== 'screenshot')
              .map(attachment => {
                if (attachment.type === 'audio') {
                  return {
                    ...attachment,
                    value: attachment.value.slice(0, 1000)
                  };
                }
                return attachment;
              });
          }
        } else {
          console.log('no highlight context at all')
        }

        if (attachment) {
          if (attachmentType === 'image') {
            console.log('appending image attachment');
            formData.append('image', attachment);
          } else if (attachmentType === 'pdf') {
            console.log('appending pdf attachment');
            formData.append('pdf', attachment);
          }
        } else if (highlightContextRef.current?.environment.screenshotPath) {
          console.log('appending screenshot image')
          // Fetch the image from the screenshotPath and append it to formData
          try {
            const response = await fetch(highlightContextRef.current.environment.screenshotPath);
            const blob = await response.blob();
            formData.append('image', blob, 'screenshot.png');
          } catch (error) {
            console.error('Error fetching screenshot:', error);
          }
        } else {
          console.log('no image to append')
        }

        // Create context from conversation history
        const conversationHistory = messages.map(msg => `${msg.type}: ${msg.content}`).join('\n');
        let contextString = conversationHistory || 'This is a new conversation with Highlight Chat.';

        // Add Highlight context if available
        if (highlightContextRef.current) {
          contextString += '\n\nHighlight Context:\n';
          contextString += JSON.stringify(highlightContextRef.current, null, 2);
        }

        console.log('contextString:', contextString);
  
        formData.append('context', contextString);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080/';
        let response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          // Token has expired, refresh it
          await refreshAccessToken();
          // Retry the request with the new token
          response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          });
        }

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        let accumulatedResponse = '';
        setMessages(prevMessages => [...prevMessages, { type: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);

          // Split the chunk into individual JSON objects
          const jsonObjects = chunk.match(/\{[^\}]+\}/g) || [];

          for (const jsonObject of jsonObjects) {
            try {
              const parsedChunk = JSON.parse(jsonObject);
              accumulatedResponse += parsedChunk.response;

              // Update the UI with the accumulated response
              setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1] = { type: 'assistant', content: accumulatedResponse };
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing chunk:', e);
              console.error('Problematic JSON object:', jsonObject);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching response:', error);
        setMessages(prevMessages => [...prevMessages, { type: 'assistant', content: "Sorry, there was an error processing your request." }]);
      } finally {
        setIsWorking(false);
      }
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setInput('');
    setIsWorking(false);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(255,255,255,0.05)] text-white overflow-hidden flex flex-col">
      <TopBar 
        mode={mode} 
        setMode={setMode} 
        onNewConversation={startNewConversation}
      />
      <main className="flex-1 overflow-auto pt-14 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Highlight Chat</h1>
                <p className="text-[rgba(255,255,255,0.60)] text-base font-normal leading-[150%]">
                  Ask Highlight anything to get started.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              return (
                <div key={index} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="flex w-[32px] h-[32px] p-[6px] justify-center items-center rounded-full bg-[rgba(255,255,255,0.05)]">
                        <AssistantIcon className="text-[#FFFFFF66]" />
                      </div>
                    </div>
                  )}
                  <div className={`
                    flex flex-col justify-center gap-4 p-5
                    rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]
                    ${message.type === 'user' ? 'items-end' : 'items-start'}
                    ${message.type === 'user' && (message.attachment || message.clipboardText || message.ocrScreenContents) ? 'max-w-[300px]' : 'max-w-[80%]'}
                  `}>
                    {message.type === 'user' && (message.attachment || highlightContext?.environment.screenshotPath) && (
                      <div className="mb-2 w-full">
                        <div className="relative inline-block w-full">
                          <img 
                            src={message.attachment || highlightContext?.environment.screenshotPath}
                            alt="Attachment" 
                            className="w-full h-auto rounded object-cover object-center"
                            style={{
                              maxHeight: '200px'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {message.type === 'user' && message.clipboardText && (
                      <div className="mb-2 w-full">
                        <div className="p-2 bg-[rgba(255,255,255,0.1)] rounded">
                          <p className="text-sm text-white">Clipboard Text:</p>
                          <p className="text-xs text-[rgba(255,255,255,0.8)]">{message.clipboardText}</p>
                        </div>
                      </div>
                    )}
                    {message.type === 'user' && message.ocrScreenContents && (
                      <div className="mb-2 w-full">
                        <div className="p-2 bg-[rgba(255,255,255,0.1)] rounded">
                          <p className="text-sm text-white">OCR Content:</p>
                          <p className="text-xs text-[rgba(255,255,255,0.8)]">{message.ocrScreenContents}</p>
                        </div>
                      </div>
                    )}
                    <div className="text-[rgba(255,255,255,0.60)] font-normal leading-[150%] break-words">
                      <ReactMarkdown>
                        {typeof message.content === 'string' ? message.content : ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isWorking && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center">
                <div className="flex w-[32px] h-[32px] p-[6px] justify-center items-center rounded-full bg-[rgba(255,255,255,0.05)] mr-2">
                  <AssistantIcon className="text-[#FFFFFF66]" />
                </div>
                <span className="text-sm text-[rgba(255,255,255,0.6)]">Working on it...</span>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2">
              {attachmentType === 'image' ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  alt="Attachment preview"
                  className="max-h-32 rounded"
                />
              ) : (
                <div className="flex items-center bg-[rgba(255,255,255,0.1)] p-2 rounded">
                  <span className="text-sm font-bold text-white mr-2">PDF</span>
                  <span className="text-sm text-white">{attachment.name}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 bg-[#161617] rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-3">
            <button type="button" onClick={handleAttachmentClick}>
              <PaperclipIcon />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-white placeholder-[rgba(255,255,255,0.6)] text-base"
              placeholder="Ask Highlight anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </form>
      </footer>
    </div>
  );
};

const CompareView: React.FC<{ result: CompareResult }> = ({ result }) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
        <span className="text-sm text-gray-400">Overview</span>
      </div>
      <ul className="list-disc pl-6 mb-4">
        {result.overview.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ul>
      <div className="mb-2">
        <span className="text-sm font-semibold">Grok mentioned:</span>
      </div>
      <ul className="list-disc pl-6 mb-4">
        {result.grok.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ul>
      <div className="mb-2">
        <span className="text-sm font-semibold">Claude mentioned:</span>
      </div>
      <ul className="list-disc pl-6">
        {result.claude.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default HighlightChat;