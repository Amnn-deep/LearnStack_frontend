export interface User {
  username: string;
  token: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Chat {
  id: string;
  history: string[];
  last_message: string;
  reply: string;
}

export interface ChatResponse {
  reply: string;
  history: string[];
}

export interface AuthResponse {
  access_token: string;
}