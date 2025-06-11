import { createTRPCRouter } from '../trpc';
import { messagesRouter } from './messages';
import { geminiRouter } from './gemini';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  gemini: geminiRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter; 