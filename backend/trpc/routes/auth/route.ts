import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context.js';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

export default createTRPCRouter({
  // Refresh access token using refresh token
  refreshToken: publicProcedure
    .input(z.object({ refresh_token: z.string() }))
    .mutation(async ({ input }: { input: { refresh_token: string } }) => {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured on server');
      }

      const params = new URLSearchParams();
      params.append('refresh_token', input.refresh_token);
      params.append('client_id', GOOGLE_CLIENT_ID);
      params.append('client_secret', GOOGLE_CLIENT_SECRET);
      params.append('grant_type', 'refresh_token');

      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        throw new Error(
          `Token refresh failed: ${errorData.error || errorText} - ${errorData.error_description || ''}`
        );
      }

      const data = await response.json() as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        id_token?: string;
      };

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || input.refresh_token, // Google might not return a new refresh token
        expires_in: data.expires_in,
        id_token: data.id_token,
      };
    }),
});

