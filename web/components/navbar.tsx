"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShieldCheck, Menu, Moon, Sun, LayoutDashboard, LogOut, User } from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/keamanan", label: "Keamanan" },
];

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">WebQA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
            aria-label="Toggle tema"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {!loading && user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {user.role === "admin" && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={() => logout()}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/login">
                <User className="mr-1.5 h-4 w-4" />
                Masuk
              </Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Button key={link.href} variant="ghost" asChild className="justify-start">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                {user ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    {user.role === "admin" && (
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/admin">Admin</Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start" onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/login">Masuk</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
