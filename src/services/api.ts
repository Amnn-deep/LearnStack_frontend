import { AuthResponse, ChatResponse, Chat } from '../types';

const BASE_URL = 'https://learn-stack-backend.vercel.app';

export const api = {
  async authenticate(username: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/token?username=${encodeURIComponent(username)}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  },

  async sendMessage(message: string, history: string[], token: string): Promise<ChatResponse> {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  async sendMessageStream(message: string, history: string[], token: string, onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to send message');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let replyBuffer = '';
    let jsonBuffer = '';
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        jsonBuffer += chunk;
        // Try to parse the reply field from the JSON as it streams
        try {
          const parsed = JSON.parse(jsonBuffer);
          if (parsed.reply) {
            // Only stream the reply field
            for (let i = replyBuffer.length; i < parsed.reply.length; i++) {
              onChunk(parsed.reply[i]);
              await new Promise(res => setTimeout(res, 15));
            }
            replyBuffer = parsed.reply;
          }
        } catch (e) {
          // Not valid JSON yet, wait for more
        }
      }
    }
  },

  async getChats(token: string): Promise<Chat[]> {
    const response = await fetch(`${BASE_URL}/chats`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  },

  async getChat(chatId: string, token: string): Promise<Chat> {
    const response = await fetch(`${BASE_URL}/chats/${chatId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    return response.json();
  },

  async deleteChat(chatId: string, token: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  },

  async deleteAllChats(token: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/chats`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete all chats');
    }
  },
};