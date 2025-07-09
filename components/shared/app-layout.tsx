"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    email: string
    name: string
    avatar_url?: string
  } | null
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300",
        // Mobile styles
        "w-64 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop styles
        "lg:relative lg:z-auto",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        {/* Sidebar header with toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <span className="text-lg font-semibold">DevToolsHub</span>
          )}
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar isCollapsed={sidebarCollapsed} />
        </div>
      </div>

      {/* Main content area */}
      <div className={cn(
        "flex flex-col flex-1 min-h-screen transition-all duration-300",
        "lg:ml-0", // Remove the margin since sidebar is now in flex layout
        sidebarCollapsed && "lg:pl-0"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex-shrink-0">
          <Header user={user} />
          
          {/* Mobile menu button */}
          <div className="lg:hidden absolute top-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 