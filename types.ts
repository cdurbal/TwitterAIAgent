export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface ChatConfig {
  model: string;
  systemInstruction: string;
  temperature: number;
}

export enum Sender {
  User = 'user',
  Model = 'model'
}
