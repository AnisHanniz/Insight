export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import Steam from 'next-auth-steam'
import type { NextRequest } from 'next/server'
import GoogleProvider from "next-auth/providers/google";
import { authOptions } from "@/lib/auth";

async function handler(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  const providers = [...authOptions.providers];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.STEAM_WEB_API_KEY) {
    providers.push(
      // @ts-ignore
      Steam(req, {
        clientSecret: process.env.STEAM_WEB_API_KEY,
      })
    );
  }

  // @ts-ignore
  return NextAuth(req, context, {
    ...authOptions,
    providers
  })
}

export { handler as GET, handler as POST }