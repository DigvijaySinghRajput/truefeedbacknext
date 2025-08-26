"use client";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";

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
      <nav className="p-4 md:p-6 shadow-md bg-gray-700 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <a href="/" className="text-xl font-bold mb-4 md:mb-0">
            Mystry World
          </a>

          <div className="flex items-center gap-4 ml-auto">
            {session ? (
              <>
                <span className="hidden md:inline">
                  Welcome, {user?.username || user?.email}
                </span>
                <Button
                  className="bg-slate-100 text-black"
                  variant="outline"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button className="bg-slate-100 text-black" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-slate-100 text-black" variant="outline">
                    Create Account
                  </Button>
                </Link>
              </>
            )}

            <div className="relative w-64 md:w-80">
              <Input
                placeholder="Search Username"
                onChange={(e) => setSearchedName(e.target.value)}
                className="w-full"
              />
              {searchedName.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white text-black mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200">
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
                          <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150">
                            {value}
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No user found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default navbar;
