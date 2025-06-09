"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Category = {
  _id: string
  name: string
  slug: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        if (res.ok) {
          const result = await res.json()
          if (result.success) {
            setCategories(result.data || [])
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            George Ongoro
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link
                    href="/"
                    className={`hover:text-primary transition-colors ${
                      pathname === "/" ? "font-medium text-primary" : ""
                    }`}
                  >
                    Home
                  </Link>
                </li>

                {/* Categories Dropdown */}
                {!isLoading && categories.length > 0 && (
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto font-normal">
                          Categories
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {categories.map((category) => (
                          <DropdownMenuItem key={category._id} asChild>
                            <Link
                              href={`/${category.slug}`}
                              className={`w-full ${pathname === `/${category.slug}` ? "font-medium text-primary" : ""}`}
                            >
                              {category.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )}

                <li>
                  <Link
                    href="/suggested"
                    className={`hover:text-primary transition-colors ${
                      pathname === "/suggested" ? "font-medium text-primary" : ""
                    }`}
                  >
                    Suggested
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className={`hover:text-primary transition-colors ${
                      pathname === "/about" ? "font-medium text-primary" : ""
                    }`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
            <ModeToggle />
          </div>

          <div className="flex items-center md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4">
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="block text-lg hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>

                {/* Mobile Categories */}
                {!isLoading && categories.length > 0 && (
                  <>
                    <li className="text-sm font-medium text-muted-foreground">Categories</li>
                    {categories.map((category) => (
                      <li key={category._id} className="pl-4">
                        <Link href={`/${category.slug}`} className="block text-lg hover:text-primary transition-colors">
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </>
                )}

                <li>
                  <Link href="/suggested" className="block text-lg hover:text-primary transition-colors">
                    Suggested
                  </Link>
                </li>

                <li>
                  <Link href="/about" className="block text-lg hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
