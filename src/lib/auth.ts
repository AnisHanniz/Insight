import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && "password" === credentials.password) {
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            elo: user.elo, 
            packsUnlocked: user.packsUnlocked as string[] 
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === 'steam') {
        token.steam = profile
      }
      
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.elo = (user as any).elo;
        token.packsUnlocked = (user as any).packsUnlocked;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { elo: true, role: true, packsUnlocked: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.elo = dbUser.elo;
          token.packsUnlocked = dbUser.packsUnlocked as string[];
        }
      }
      return token
    },
    async session({ session, token }) {
      if ('steam' in token) {
        // @ts-expect-error
        session.user.steam = token.steam
      }
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).elo = token.elo;
        (session.user as any).packsUnlocked = token.packsUnlocked;
      }
      return session
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
