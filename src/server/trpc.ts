import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import { type SupabaseClient } from '@supabase/supabase-js';

// Define the context type
export interface Context {
  req: Request;
  res: Response;
  supabase: SupabaseClient;
  user?: {
    sub: string;
  };
}

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Create the context
export const createTRPCContext = async (opts: { req: Request; res: Response }): Promise<Context> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get the authorization header
  const authHeader = opts.req.headers.get('authorization');
  let user: { sub: string } | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Here you would typically verify the JWT token and extract the user info
      // For now, we'll just use a mock user ID
      user = { sub: 'user_123' };
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    supabase,
    user,
  };
};

// Create public and protected procedures
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router; 