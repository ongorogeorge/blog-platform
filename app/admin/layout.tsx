import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, FolderOpen, Mail, BarChart3, LogOut } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin-auth")?.value

  if (adminAuth || adminAuth == "authenticated") {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/40 border-r hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/posts">
                <FileText className="mr-2 h-4 w-4" />
                Posts
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/categories">
                <FolderOpen className="mr-2 h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/newsletter">
                <Mail className="mr-2 h-4 w-4" />
                Newsletter
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-6">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
