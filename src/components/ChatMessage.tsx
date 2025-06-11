import type { Message } from '@/types/chat';
import type { UserProfile } from '@auth0/nextjs-auth0/client';

interface ChatMessageProps {
  message: Message;
  user: UserProfile;
}

export default function ChatMessage({ message, user }: ChatMessageProps) {
  const isUserMessage = message.is_user_message;
  const avatarSrc = isUserMessage
    ? user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`
    : '/ai-avatar.png';
  const avatarAlt = isUserMessage ? user.name || 'User' : 'AI Assistant';

  return (
    <div className={`d-flex mb-3 ${isUserMessage ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        className={`d-flex ${isUserMessage ? 'flex-row-reverse' : 'flex-row'} align-items-end`}
        style={{ maxWidth: '85%' }}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUserMessage ? 'ms-2' : 'me-2'}`}>
          <div className={`rounded-circle p-2 ${isUserMessage ? 'bg-primary' : 'bg-secondary'}`}>
            <img
              src={avatarSrc}
              alt={avatarAlt}
              className="rounded-circle"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Message Bubble */}
        <div className="flex-grow-1">
          <div
            className={`p-3 rounded-3 shadow-sm ${
              isUserMessage ? 'bg-primary text-white' : 'bg-light'
            }`}
          >
            {message.image_url ? (
              <img
                src={message.image_url}
                alt="AI generated image"
                className="img-fluid rounded"
                style={{ maxHeight: '300px', width: 'auto' }}
              />
            ) : (
              <p className="mb-0">{message.content}</p>
            )}
          </div>
          <small
            className={`d-block mt-1 text-muted ${
              isUserMessage ? 'text-end' : 'text-start'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </small>
        </div>
      </div>
    </div>
  );
} 