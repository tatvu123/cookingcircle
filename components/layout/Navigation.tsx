"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Bell, LogIn, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NewRecipeButton } from "@/components/new-recipe-button"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "Explore", href: "#" },
    { label: "My Recipes", href: "/profile/poster" },
    { label: "Favorites", href: "#" },
    { label: "Shop", href: "/shopping-list" },
  ]

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Cooking Circle
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium hover:text-zinc-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NewRecipeButton />
          <Button variant="default" size="sm" href="/login">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Button variant="default" size="sm" href="/login" className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <div className="space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

