import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    accessToken: string;
    provider: string;
    providerAccountId: string;
  }
} 