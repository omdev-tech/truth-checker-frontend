import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

/**
 * NextAuth.js Configuration
 * Handles Google OAuth authentication with JWT tokens
 * Integrates with FastAPI backend for user synchronization
 */
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  
  callbacks: {
    /**
     * JWT Callback - Runs whenever a JWT is created, updated, or accessed
     */
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        
        // Sync user with backend and get backend JWT token
        try {
          const backendResult = await syncUserWithBackend({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account.provider,
            provider_id: account.providerAccountId,
          });
          
          // Store backend JWT token for API authentication
          if (backendResult?.access_token) {
            token.backendAccessToken = backendResult.access_token;
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        }
      }
      
      return token;
    },

    /**
     * Session Callback - Runs whenever a session is checked
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        // Use backend JWT token for API authentication
        session.accessToken = token.backendAccessToken as string || token.accessToken as string;
      }
      
      return session;
    },

    /**
     * Redirect Callback - Controls where users are redirected after authentication
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', { user: user.email, provider: account?.provider });
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { user: token?.email });
    },
  },

  debug: process.env.NODE_ENV === 'development',
});

/**
 * Sync user data with FastAPI backend
 */
async function syncUserWithBackend(userData: {
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  provider_id: string;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${backendUrl}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('User synced with backend:', result);
    return result;
  } catch (error) {
    console.error('Backend sync error:', error);
    throw error;
  }
}

export { handler as GET, handler as POST }; 