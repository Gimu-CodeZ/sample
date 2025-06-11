'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Fetch messages
  const { data: messages = [], isLoading: isLoadingMessages } = trpc.messages.getMessages.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );

  // Mutations
  const addMessage = trpc.messages.addMessage.useMutation({
    onSettled: () => {
      setIsSubmitting(false);
    },
    onSuccess: () => {
      utils.messages.getMessages.invalidate();
    },
  });

  const addAiResponse = trpc.messages.addAiResponse.useMutation({
    onSuccess: () => {
      utils.messages.getMessages.invalidate();
    },
  });

  const generateText = trpc.gemini.generateText.useMutation({
    onSettled: () => {
      setIsThinking(false);
      setIsSubmitting(false);
    },
  });

  const generateImage = trpc.gemini.generateImage.useMutation({
    onSettled: () => {
      setIsGeneratingImage(false);
      setIsSubmitting(false);
    },
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isGeneratingImage]);

  // Focus input on mount
  useEffect(() => {
    if (user && inputRef.current) {
      inputRef.current.focus();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      // Add user message
      await addMessage.mutateAsync({ content: userMessage });

      // Generate AI response
      let aiResponse;
      if (userMessage.toLowerCase().startsWith('generate image:')) {
        setIsGeneratingImage(true);
        const imagePrompt = userMessage.slice('generate image:'.length).trim();
        const imageUrl = await generateImage.mutateAsync({ prompt: imagePrompt });
        aiResponse = { image_url: imageUrl };
      } else {
        setIsThinking(true);
        const textResponse = await generateText.mutateAsync({ prompt: userMessage });
        aiResponse = { content: textResponse };
      }

      // Add AI response
      await addAiResponse.mutateAsync(aiResponse);
    } catch (error) {
      console.error('Error in chat:', error);
      // Reset states on error
      setIsSubmitting(false);
      setIsThinking(false);
      setIsGeneratingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error.message}
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="bg-primary text-white shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center">
              <div className="bg-white rounded-circle p-2 me-3">
                <i className="bi bi-robot text-primary fs-5"></i>
              </div>
              <div>
                <h5 className="mb-0">AI Assistant</h5>
                <small className="opacity-75">
                  <i className="bi bi-circle-fill text-success me-1"></i>
                  Online
                </small>
              </div>
            </div>
            {user && (
              <div className="d-flex align-items-center">
                <img
                  src={user.picture || ''}
                  alt={user.name || 'User'}
                  className="rounded-circle me-2 img-fluid"
                  style={{ maxHeight: '32px', width: 'auto' }}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
                  }}
                />
                <a href="/api/auth/logout" className="btn btn-outline-light btn-sm">
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Log out
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="chat-messages">
        <div className="container-fluid">
          {!user ? (
            <div className="text-center py-5">
              <i className="bi bi-chat-dots text-primary display-1 mb-4"></i>
              <h2 className="mb-4">Welcome to AI Chat</h2>
              <p className="lead mb-4">Sign in to start chatting with our AI assistant</p>
              <a href="/api/auth/login" className="btn btn-primary btn-lg px-5">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </a>
            </div>
          ) : isLoadingMessages ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading messages...</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`d-flex mb-3 ${message.is_user_message ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`d-flex ${message.is_user_message ? 'flex-row-reverse' : 'flex-row'} align-items-end`}
                    style={{ maxWidth: '85%' }}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.is_user_message ? 'ms-2' : 'me-2'}`}>
                      <div className={`rounded-circle p-2 ${message.is_user_message ? 'bg-primary' : 'bg-secondary'}`}>
                        {message.is_user_message ? (
                          <i className="bi bi-person-fill text-white"></i>
                        ) : (
                          <i className="bi bi-robot text-white"></i>
                        )}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div className="flex-grow-1">
                      <div
                        className={`p-3 rounded-3 shadow-sm ${
                          message.is_user_message ? 'bg-primary text-white' : 'bg-white border'
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
                          message.is_user_message ? 'text-end' : 'text-start'
                        }`}
                      >
                        <i className="bi bi-clock me-1"></i>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking Message */}
              {isThinking && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="d-flex align-items-end" style={{ maxWidth: '85%' }}>
                    <div className="flex-shrink-0 me-2">
                      <div className="rounded-circle p-2 bg-secondary">
                        <i className="bi bi-robot text-white"></i>
                      </div>
                    </div>
                    <div className="bg-white border rounded-3 p-3 shadow-sm">
                      <div className="d-flex align-items-center">
                        <div className="spinner-grow spinner-grow-sm text-secondary me-2" role="status">
                          <span className="visually-hidden">Thinking...</span>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-lightning-charge me-1"></i>
                          AI is thinking...
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Generation Message */}
              {isGeneratingImage && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="d-flex align-items-end" style={{ maxWidth: '85%' }}>
                    <div className="flex-shrink-0 me-2">
                      <div className="rounded-circle p-2 bg-secondary">
                        <i className="bi bi-robot text-white"></i>
                      </div>
                    </div>
                    <div className="bg-white border rounded-3 p-3 shadow-sm">
                      <div className="d-flex align-items-center">
                        <div className="spinner-grow spinner-grow-sm text-secondary me-2" role="status">
                          <span className="visually-hidden">Generating image...</span>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-image me-1"></i>
                          AI is generating image...
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      {user && (
        <footer className="chat-input-bar">
          <div className="container-fluid">
            <form onSubmit={handleSubmit} className="py-2">
              <div className="input-group">
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Type your message... (or 'generate image: your prompt' for images)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSubmitting}
                  style={{ fontSize: '16px' }} // Prevents zoom on iOS
                />
                <button
                  className="btn btn-primary px-4"
                  type="submit"
                  disabled={!inputMessage.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status">
                      <span className="visually-hidden">Sending...</span>
                    </div>
                  ) : (
                    <i className="bi bi-send-fill"></i>
                  )}
                </button>
              </div>
            </form>
          </div>
        </footer>
      )}
    </div>
  );
}
