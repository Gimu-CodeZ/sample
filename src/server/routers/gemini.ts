import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
}

export const geminiRouter = createTRPCRouter({
  generateText: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: input.prompt
                }]
              }]
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Gemini API error: ${error.error?.message || 'Unknown error'}`,
          });
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No text was generated',
          });
        }

        return generatedText;
      } catch (error) {
        console.error('Error generating text:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate text',
        });
      }
    }),

  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: {
                text: input.prompt
              }
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Gemini API error: ${error.error?.message || 'Unknown error'}`,
          });
        }

        const data = await response.json();
        const imageData = data.imageData;

        if (!imageData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No image was generated',
          });
        }

        // Convert the image data to a base64 data URL
        const base64Data = `data:image/jpeg;base64,${imageData}`;
        return base64Data;
      } catch (error) {
        console.error('Error generating image:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate image',
        });
      }
    }),
}); 