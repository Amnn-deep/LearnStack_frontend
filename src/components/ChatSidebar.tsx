import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../types';
import { Brain, Plus, Trash2, LogOut, User } from 'lucide-react';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">LearnStack AI</span>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 hide-scrollbar"> {/* Hide scrollbar but keep scroll */}
        {chats.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start learning with AI</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  currentChatId === chat.id
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chat.last_message || 'New conversation'}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {chat.reply ? chat.reply.substring(0, 50) + '...' : 'No messages'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700 hide-scrollbar"> {/* Hide scrollbar if any, but keep scroll */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400">Learning with AI</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};