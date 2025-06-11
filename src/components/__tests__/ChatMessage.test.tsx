import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Message } from '@/types/chat';
import type { UserProfile } from '@auth0/nextjs-auth0/client';
import ChatMessage from '../ChatMessage';

const mockUser: UserProfile = {
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/avatar.jpg',
  sub: 'test-sub',
  updated_at: new Date().toISOString(),
};

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const message: Message = {
      id: '1',
      content: 'Hello',
      is_user_message: true,
      created_at: new Date().toISOString(),
    };

    render(<ChatMessage message={message} user={mockUser} />);
    
    const messageElement = screen.getByText('Hello');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.closest('div')).toHaveClass('bg-primary');
  });

  it('renders AI message correctly', () => {
    const message: Message = {
      id: '2',
      content: 'Hi there',
      is_user_message: false,
      created_at: new Date().toISOString(),
    };

    render(<ChatMessage message={message} user={mockUser} />);
    
    const messageElement = screen.getByText('Hi there');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.closest('div')).toHaveClass('bg-light');
  });

  it('renders image message correctly', () => {
    const message: Message = {
      id: '3',
      content: '',
      is_user_message: false,
      created_at: new Date().toISOString(),
      image_url: 'https://example.com/image.jpg',
    };

    render(<ChatMessage message={message} user={mockUser} />);
    
    const imageElement = screen.getByAltText('AI generated image');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('handles missing user picture', () => {
    const message: Message = {
      id: '4',
      content: 'Test message',
      is_user_message: true,
      created_at: new Date().toISOString(),
    };

    const userWithoutPicture = { ...mockUser, picture: undefined };
    render(<ChatMessage message={message} user={userWithoutPicture} />);
    
    const avatarElement = screen.getByAltText('Test User');
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'));
  });
}); 