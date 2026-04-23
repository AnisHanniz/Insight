import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      elo?: number;
      packsUnlocked?: string[];
      balance?: number;
      creatorBadge?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    elo?: number;
    packsUnlocked?: string[];
    balance?: number;
    creatorBadge?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    elo?: number;
    packsUnlocked?: string[];
    balance?: number;
    creatorBadge?: boolean;
  }
}
