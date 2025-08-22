"use client";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import Link from "next/link";

function navbar() {
  const { data: session } = useSession();

  const user: User = session?.user as User;

  return (
    <div>
      <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <a href="#" className="text-xl font-bold mb-4 md:mb-0">
            Mystry Message
          </a>
          {session ? (
            <div className="flex items-center justify-between w-full md:w-auto">
              <span className="flex-1 text-center md:flex-none md:mr-4">
                Welcome,{user?.username || user?.email}
              </span>
              <Button
                className="w-full md:w-auto bg-slate-100 text-black"
                variant="outline"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center md:justify-end">
              <Link href="/sign-in">
                <Button
                  className="w-full md:w-auto bg-slate-100 text-black"
                  variant={"outline"}
                >
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  className="w-full md:w-auto bg-slate-100 text-black"
                  variant={"outline"}
                >
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default navbar;
