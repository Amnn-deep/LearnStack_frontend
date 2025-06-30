import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Chat, Message } from '../types';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { ChatSidePanel } from '../components/ChatSidePanel';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chats on component mount
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

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

    try {
      await api.deleteChat(chatId, user.token);
      setChats(chats.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
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

  return (
    <div className="h-screen flex">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      <ChatSidePanel />
    </div>
  );
};