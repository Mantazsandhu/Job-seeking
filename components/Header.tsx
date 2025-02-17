"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/lib/userActions";
import Spinner from "./ui/spinner/spinner";

export function Header() {
  
  const { data, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";
  return (
    <header className="bg-black border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iAUoadDdbY4JJ7uYwEFid2XEEkFnGd.png"
            alt="Guhuza Logo"
            width={120}
            height={40}
            className="dark:invert"
          />
        </Link>
        {isLoading ? (
          <Spinner />
        ) : (
          <nav className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-gray-800 flex items-center gap-1"
                >
                  Services <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/services/live-interviews" className="w-full">
                    Live Interviews
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services/skills-testing" className="w-full">
                    Skills Testing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/services/background-screening"
                    className="w-full"
                  >
                    Background Screening
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services/staffing" className="w-full">
                    Staffing Firm
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/leaderboard">
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-gray-800"
              >
                Leaderboard
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/game">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    Take a quiz
                  </Button>
                </Link>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    className="bg-white text-black hover:bg-gray-100 hover:text-black"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
