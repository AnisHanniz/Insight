"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="sticky top-0 z-40 bg-secondary/80 backdrop-blur border-b border-white/5 text-gray-light">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white"
        >
          <span className="text-primary">In</span>sight
        </Link>
        <div className="hidden md:flex space-x-6 items-center font-bold text-sm">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            Home
          </Link>
          <Link
            href="/fundamentals"
            className="text-gray-300 hover:text-white transition"
          >
            Fundamentals
          </Link>
          <Link
            href="/premium"
            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 hover:from-yellow-300 hover:to-yellow-100 font-extrabold transition"
          >
            Premium
          </Link>
          {status === "authenticated" && (
            <Link
              href="/profile"
              className="text-gray-300 hover:text-white transition"
            >
              Profile
            </Link>
          )}
          {isAdmin && (
            <div className="relative group py-2">
              <span className="text-gray-300 group-hover:text-white transition cursor-pointer">
                Admin
              </span>
              <div className="absolute left-0 top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="w-48 bg-[#1a1c23] border border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col">
                  <Link
                    href="/admin"
                    className="px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/packs"
                    className="px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Manage Packs
                  </Link>
                  <Link
                    href="/admin/users"
                    className="px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {status === "authenticated" ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-400">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-1.5 px-3 rounded-lg text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/signin">
              <button className="bg-primary hover:bg-dark-2 text-white font-bold py-1.5 px-4 rounded-lg text-sm">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
