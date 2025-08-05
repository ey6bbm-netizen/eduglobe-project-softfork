
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, Message, Role, Conversation } from './types';
import { UI_TEXT } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

import TypingTitle from './components/TypingTitle';
import LanguageSelector from './components/LanguageSelector';
import Logo from './components/Logo';
import FloatingSymbols from './components/FloatingSymbols';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import ConversationList from './components/ConversationList';

const App = () => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('activeConversationId', null);
  const [language, setLanguage] = useLocalStorage<Language>('language', Language.ENGLISH);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const uiStrings = UI_TEXT[language];

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Ensure there is always an active conversation if one exists
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    if (conversations.length === 0) {
        setActiveConversationId(null);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!activeConversationId) return;

    const currentConvo = conversations.find(c => c.id === activeConversationId);
    if (!currentConvo) return;

    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text, language };
    
    const shouldGenerateName = currentConvo.messages.filter(m => m.role === Role.USER).length === 0;

    const historyWithUserMessage = [...currentConvo.messages, userMessage];
    setConversations(prevConvos =>
      prevConvos.map(c =>
        c.id === activeConversationId ? { ...c, messages: historyWithUserMessage } : c
      )
    );
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessagePlaceholder: Message = { id: aiMessageId, role: Role.AI, text: '', language };

    setConversations(prevConvos =>
      prevConvos.map(c =>
        c.id === activeConversationId ? { ...c, messages: [...c.messages, aiMessagePlaceholder] } : c
      )
    );
    
    let fullResponseText = '';

    try {
        const response = await fetch('/api/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: historyWithUserMessage,
                language: language,
            }),
        });

        if (!response.ok || !response.body) {
            const errorText = response.statusText;
            throw new Error(`API error: ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullResponseText += chunk;
            
            setConversations(prevConvos =>
              prevConvos.map(c => {
                if (c.id !== activeConversationId) return c;
                
                const updatedMessages = c.messages.map(m =>
                  m.id === aiMessageId ? { ...m, text: fullResponseText } : m
                );
                return { ...c, messages: updatedMessages };
              })
            );
        }

    } catch (error) {
        console.error("Failed to get response:", error);
        setConversations(prevConvos => prevConvos.map(c => {
            if (c.id !== activeConversationId) return c;
            const updatedMessages = c.messages.map(m =>
                m.id === aiMessageId ? { ...m, text: uiStrings.errorMessage } : m
            );
            return { ...c, messages: updatedMessages };
        }));
    } finally {
        setIsLoading(false);
        
        if (shouldGenerateName && fullResponseText) {
            try {
                const titleResponse = await fetch('/api/generateTitle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstUserMessage: text,
                        firstAiResponse: fullResponseText,
                        language: language,
                    }),
                });
                if (titleResponse.ok) {
                    const { title } = await titleResponse.json();
                    if (title) {
                        setConversations(prevConvos => prevConvos.map(c => 
                            c.id === activeConversationId ? { ...c, name: title } : c
                        ));
                    }
                }
            } catch (titleError) {
                console.error("Failed to generate title:", titleError);
            }
        }
    }

  }, [activeConversationId, language, conversations, setConversations, uiStrings.errorMessage]);
  
  const handleNewChat = () => {
    const newConversation: Conversation = {
        id: Date.now().toString(),
        name: uiStrings.newChatButton,
        messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  }

  const handleDeleteChat = (idToDelete: string) => {
    const remainingConversations = conversations.filter(c => c.id !== idToDelete);
    setConversations(remainingConversations);
    if (activeConversationId === idToDelete) {
        setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
    }
  }

  const handleDeleteCurrentChat = () => {
    if (activeConversationId) {
      handleDeleteChat(activeConversationId);
    }
  };
  
  const isInputDisabled = isLoading || !activeConversation;
  const placeholder = uiStrings.chatPlaceholder;

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex h-screen bg-[var(--bg-main-start)] font-sans">
      {/* Left Panel */}
      <div className="w-96 flex-shrink-0 bg-gradient-to-b from-[var(--bg-panel-start)] to-[var(--bg-panel-end)] p-6 flex flex-col shadow-2xl z-10 relative">
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <TypingTitle text={uiStrings.title} />
          <p className="mt-2 text-sm text-slate-400">
            {uiStrings.slogan}
          </p>
          <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} headerText={uiStrings.languageSelectorHeader} />
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            onNew={handleNewChat}
            onDelete={handleDeleteChat}
            uiStrings={{ chatHistoryHeader: uiStrings.chatHistoryHeader, newChatButton: uiStrings.newChatButton }}
          />
        </div>
        <div className="mt-auto pt-4 flex-shrink-0">
          <button
            onClick={handleDeleteCurrentChat}
            disabled={!activeConversationId}
            className="w-full text-center px-4 py-2 rounded-lg transition-colors duration-200 bg-pink-700 hover:bg-pink-600 text-white font-semibold shadow-lg disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {uiStrings.deleteChatButton}
          </button>
        </div>
        {/* Neon Separator */}
        <div className="absolute top-0 right-0 h-full w-px" style={{
            boxShadow: '0 0 2px #fff, 0 0 6px #a855f7, 0 0 12px #a855f7, 0 0 20px #38bdf8'
        }}></div>
      </div>

      {/* Right Panel */}
      <main className="flex-grow flex flex-col h-screen bg-gradient-to-br from-[var(--bg-main-start)] to-[var(--bg-main-end)] relative">
        <div className="flex-grow relative overflow-hidden">
          {!activeConversation ? (
            <>
              <div className="absolute inset-0 z-0">
                  <FloatingSymbols />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                <div className="mb-4">
                  <Logo />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
                    {uiStrings.welcomeHeader}
                </h2>
                <p className="text-slate-400 mt-2">{uiStrings.welcomeMessage}</p>
              </div>
            </>
          ) : (
            <div ref={chatContainerRef} className="absolute inset-0 overflow-y-auto p-6">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg}
                  isStreaming={isLoading && msg.id === lastMessage?.id && lastMessage.role === Role.AI}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-t-xl">
           <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder={placeholder} isInputDisabled={isInputDisabled} />
        </div>
      </main>
    </div>
  );
};

export default App;
