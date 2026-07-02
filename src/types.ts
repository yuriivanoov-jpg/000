export type Mode = 'CANNY' | 'DEPTH' | 'LINE';

export interface Message {
  id: string;
  sender: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  image?: string;
}

export interface Agent {
  id: string;
  name: string;
  nameRu?: string;
  role: string;
  roleRu?: string;
  bio: string;
  bioRu?: string;
  avatar: string; // Unsplash image url
  avatarBg: string; // tailwind color class
  systemInstruction: string;
  systemInstructionRu?: string;
  initialMessage: string;
  initialMessageRu?: string;
}

export interface RenderProject {
  id: string;
  name: string;
  nameRu?: string;
  location: string;
  locationRu?: string;
  image: string;
  method: Mode;
  bias: number;
  params: string;
  date: string;
  description: string;
  descriptionRu?: string;
}
