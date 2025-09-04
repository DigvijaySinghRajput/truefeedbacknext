"use client";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import ModeToggle from "./theme-toggle-button";
import { Separator } from "@/components/ui/separator";

function navbar() {
  const { data: session } = useSession();
  const [isSearching, setIsSearching] = useState(false);
  const [searchedName, setSearchedName] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const user: User = session?.user as User;

  useEffect(() => {
    if (!searchedName.trim()) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await axios.get<ApiResponse>(
          `/api/search-username?searchuser=${searchedName}`
        );
        setSearchResults(response.data.users ?? []);
      } catch (error) {
        console.log("Error occured while searching");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchedName]);

  return (
    <div>
      <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 shadow-md bg-background/100 dark:bg-background/100 text-foreground border-b border-border">
        <div className="container mx-auto flex relative justify-between md:flex-row items-center">
          <a href="/" className="text-xl font-bold mb-4 md:mb-0 text-left">
            Mystry World
          </a>

          {session && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
              <span className="font-medium">
                Mystery awaits, {user?.username}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 absolute right-0">
            <div className="relative w-64 md:w-80">
              <Input
                placeholder="Search Username"
                onChange={(e) => setSearchedName(e.target.value)}
                className="w-full"
              />
              {searchedName.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background text-foreground mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200">
                  {isSearching ? (
                    <div className="px-4 py-3 text-gray-500 text-center flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((value, index) => {
                      const profileUrl = `/dm/${value}`;
                      return (
                        <a target="_blank" href={profileUrl} key={index}>
                          <div className="px-4 py-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors duration-150">
                            {value}
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-foreground text-center">
                      No user found
                    </div>
                  )}
                </div>
              )}
            </div>
            {session ? (
              <>
                <Button
                  className="bg-background text-foreground"
                  variant="outline"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    className="bg-slate-100 text-foreground"
                    variant="outline"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    className="bg-slate-100 text-foreground"
                    variant="outline"
                  >
                    Create Account
                  </Button>
                </Link>
              </>
            )}

            <ModeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default navbar;
