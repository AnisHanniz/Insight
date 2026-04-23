import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthError = { error: string; status: 401 | 403 | 404 };
export type SessionOk = { userId: string; role: string | undefined };
export type PackOwnerOk = SessionOk & {
  pack: {
    id: string;
    creatorId: string | null;
    status: string;
    isCommunity: boolean;
    name: string;
  };
};

export async function requireSession(): Promise<AuthError | SessionOk> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  return { userId: session.user.id, role: session.user.role as string | undefined };
}

export async function requirePackOwner(
  packId: string
): Promise<AuthError | PackOwnerOk> {
  const s = await requireSession();
  if ("error" in s) return s;

  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { id: true, creatorId: true, status: true, isCommunity: true, name: true },
  });
  if (!pack) return { error: "Pack not found", status: 404 };

  const isAdmin = s.role === "admin";
  if (!isAdmin && pack.creatorId !== s.userId) {
    return { error: "Forbidden", status: 403 };
  }

  return { userId: s.userId, role: s.role, pack };
}

export function canEditPack(status: string | null | undefined): boolean {
  return status === "draft" || status === "rejected";
}
