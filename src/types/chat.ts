export interface Message {
  id: string;
  content: string;
  is_user_message: boolean;
  created_at: string;
  image_url?: string;
} 