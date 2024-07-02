'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { MenuIcon, AddIcon, PaperclipIcon, MicIcon, AddSquareIcon, AssistantIcon } from './icons/icons';
import { TopBarProps, Message, CompareResult } from './types/types';
import ReactMarkdown from 'react-markdown';

const TopBar: React.FC<TopBarProps> = ({ mode, setMode, onNewConversation }) => {
  return (
    <header className="absolute top-0 left-0 right-0 border-b border-[rgba(255,255,255,0.05)]">
      <div className="flex w-[1122px] h-[64px] p-[12px] justify-end items-center mx-auto">
        {/* <button className="w-6 h-6 flex items-center justify-center">
          <MenuIcon />
        </button>
        <button 
          className="flex px-[12px] py-[8px] justify-end items-center gap-[8px] rounded-[8px] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] text-sm font-medium"
          onClick={() => setMode(mode === 'assistant' ? 'compare' : 'assistant')}
        >
          {mode === 'assistant' ? 'Assistant' : 'Compare'} Mode <ChevronDown className="ml-2" size={16} />
        </button> */}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSubmit(null, suggestion);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAttachment(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | null, suggestionInput?: string) => {
    if (e) e.preventDefault();
    const query = suggestionInput || input.trim();
    if (query || attachment) {
      setMessages(prevMessages => [...prevMessages, { 
        type: 'user', 
        content: query,
        attachment: attachment ? URL.createObjectURL(attachment) : undefined
      }]);
      setInput('');
      setIsWorking(true);
      
      try {
        const formData = new FormData();
        formData.append('prompt', query);

        // Create context from conversation history
        const conversationHistory = messages.map(msg => `${msg.type}: ${msg.content}`).join('\n');

        formData.append('context', conversationHistory || 'This is a new conversation with Highlight Chat.');

        if (attachment) {
          formData.append('image', attachment);
        }

        // Optional fields can be added here if needed
        // formData.append('location', '');
        // formData.append('topic', '');
        // formData.append('image', imageFile);
        // formData.append('voice', voiceFile);

        const response = await fetch('http://0.0.0.0:8080/', { //fetch('https://highlight-chat-backend-fq27dri5ra-ue.a.run.app/', {
          method: 'POST',
          body: formData,
        });

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
          console.log('Received chunk:', chunk);

          // Split the chunk into individual JSON objects
          const jsonObjects = chunk.match(/\{[^\}]+\}/g) || [];

          for (const jsonObject of jsonObjects) {
            try {
              const parsedChunk = JSON.parse(jsonObject);
              accumulatedResponse += parsedChunk.response;
              console.log('Accumulated response:', accumulatedResponse);

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
        setAttachment(null); // Clear the attachment after sending
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
                <div className="space-y-4">
                  {['Write a response to the most recent Discord message',
                    'Summarize the last 30 minutes of audio',
                    'Help me fix the error in my IDE'].map((suggestion, index) => (
                    <button 
                      key={index} 
                      className="flex w-[450px] p-5 flex-col justify-center items-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)]"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="text-[rgba(255,255,255,0.60)] text-base font-normal leading-[150%]">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              console.log('Rendering message:', message);
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
                    ${message.type === 'user' && message.attachment ? 'max-w-[300px]' : 'max-w-[80%]'}
                  `}>
                    {message.type === 'user' && message.attachment && (
                      <div className="mb-2 w-full">
                        <div className="relative inline-block w-full">
                          <img 
                            src={message.attachment}
                            alt="Attachment" 
                            className="w-full h-auto rounded object-cover object-center"
                            style={{
                              maxHeight: '200px'
                            }}
                          />
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
                <div className="w-6 h-6 bg-[#161617] rounded-full mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
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
              <div className="relative inline-block">
                <img 
                  src={URL.createObjectURL(attachment)} 
                  alt="Attachment" 
                  className="w-[79.371px] h-[42px] rounded object-cover object-center"
                  style={{
                    background: `url(${URL.createObjectURL(attachment)}) lightgray 0px -0.146px / 100% 100.436% no-repeat`
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setAttachment(null)} 
                  className="absolute right-[3.001px] bottom-[3px] flex justify-center items-center w-[19px] h-[19px] bg-[rgba(22,22,23,0.9)] rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.75)]"
                >
                  <AddSquareIcon />
                </button>
              </div>
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
              accept="image/*"
              className="hidden"
            />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-white placeholder-[rgba(255,255,255,0.6)] text-base"
              placeholder="Ask Highlight anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button">
              {/* <MicIcon /> */}
            </button>
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