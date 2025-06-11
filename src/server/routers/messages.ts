import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const messagesRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        });
      }

      try {
        const { data: messages, error } = await ctx.supabase
          .from('messages')
          .select('*')
          .eq('user_id', ctx.user.sub)
          .order('created_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        // Reverse to get chronological order
        return messages.reverse();
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages',
        });
      }
    }),

  addMessage: protectedProcedure
    .input(z.object({
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        });
      }

      try {
        const { data, error } = await ctx.supabase
          .from('messages')
          .insert({
            content: input.content,
            is_user_message: true,
            user_id: ctx.user.sub,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error adding message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add message',
        });
      }
    }),

  addAiResponse: protectedProcedure
    .input(z.object({
      content: z.string().optional(),
      image_url: z.string().url().optional(),
    }).refine(data => data.content || data.image_url, {
      message: "Either content or image_url must be provided",
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        });
      }

      try {
        const { data, error } = await ctx.supabase
          .from('messages')
          .insert({
            content: input.content,
            image_url: input.image_url,
            is_user_message: false,
            user_id: ctx.user.sub,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error adding AI response:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add AI response',
        });
      }
    }),
}); 