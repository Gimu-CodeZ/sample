import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { createTRPCContext } from '@/server/trpc';
import { type Context } from '@/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      return createTRPCContext({ 
        req, 
        res: new Response() 
      });
    },
  });

export { handler as GET, handler as POST }; 