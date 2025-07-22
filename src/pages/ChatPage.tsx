
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Chat, Message } from '../types';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { ChatSidePanel } from '../components/ChatSidePanel';

export const ChatPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // collapsed by default

  // Load chats on component mount, but only after auth is loaded
  useEffect(() => {
    if (!isAuthLoading && user) {
      loadChats();
    }
  }, [user, isAuthLoading]);

  const loadChats = async () => {
    if (!user) return;
    
    try {
      const chatList = await api.getChats(user.token);
      setChats(chatList);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    if (!user) return;

    try {
      const chat = await api.getChat(chatId, user.token);
      const chatMessages: Message[] = [];
      
      // Convert history to messages
      for (let i = 0; i < chat.history.length; i += 2) {
        const userMessage = chat.history[i];
        const botMessage = chat.history[i + 1];
        
        if (userMessage) {
          chatMessages.push({
            id: `${chatId}-${i}`,
            text: userMessage,
            isUser: true,
            timestamp: new Date(),
          });
        }
        
        if (botMessage) {
          chatMessages.push({
            id: `${chatId}-${i + 1}`,
            text: botMessage,
            isUser: false,
            timestamp: new Date(),
          });
        }
      }
      
      setMessages(chatMessages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) return;

    // Optimistically update UI
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }

    try {
      await api.deleteChat(chatId, user.token);
      // Optionally, reload chats from server here if needed
      // await loadChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
      // Optionally, revert UI or show error to user
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!user) return;
    setIsLoading(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    let botMessageId = `bot-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: botMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    try {
      const history = messages.flatMap(msg => [msg.text]);
      let botText = '';
      await api.sendMessageStream(
        messageText,
        history,
        user.token,
        (chunk: string) => {
          botText += chunk;
          // Try to parse as JSON and extract only the reply field
          let displayText = botText;
          try {
            const parsed = JSON.parse(botText);
            if (parsed.reply) {
              displayText = parsed.reply;
            }
          } catch (e) {
            // Not valid JSON yet, show as is
          }
          setMessages(prev =>
            prev.map(msg =>
              msg.id === botMessageId ? { ...msg, text: displayText } : msg
            )
          );
        }
      );
      loadChats();
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== botMessageId));
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    // Optionally, show a loading spinner here
    return null;
  }

  return (
    <div className="h-screen flex relative overflow-hidden"> {/* Prevent body scroll */}
      {/* Collapse/expand button for mobile */}
      <button
        className="absolute top-2 left-2 z-30 md:hidden bg-gray-800 text-white rounded-full p-2 shadow-lg"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
        aria-label={isSidebarCollapsed ? 'Show menu' : 'Hide menu'}
      >
        {isSidebarCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        )}
      </button>
      {/* Sidebar: overlays chat on mobile, static on desktop */}
      <div
        className={`fixed top-0 left-0 h-full z-20 bg-gray-900 transition-transform duration-200 w-64 md:static md:translate-x-0 ${isSidebarCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
        style={{ maxWidth: '16rem' }}
      >
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>
      {/* Main chat area always visible */}
      <div className="flex-1 flex flex-col min-w-0 h-full"> {/* Ensure chat area fills height */}
        <div className="flex-1 flex flex-col overflow-y-auto"> {/* Make only this area scrollable */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
      {/* Hide right panel on mobile if collapsed */}
      <div className="hidden md:block md:relative absolute right-0 top-0 h-full w-80 md:w-auto z-10 md:z-0 bg-white hide-scrollbar overflow-y-auto"> {/* Hide scrollbar but keep scroll */}
        <ChatSidePanel />
      </div>
    </div>
  );
};