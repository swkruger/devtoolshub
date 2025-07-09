"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  Wrench, 
  FileJson, 
  Search, 
  Shield, 
  Image, 
  Hash, 
  Code,
  Crown,
  Settings
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "All Tools",
    href: "/tools",
    icon: Wrench,
  },
]

const tools = [
  {
    name: "JSON Formatter",
    href: "/tools/json-formatter",
    icon: FileJson,
    isPremium: false,
  },
  {
    name: "Regex Tester",
    href: "/tools/regex-tester",
    icon: Search,
    isPremium: false,
  },
  {
    name: "JWT Decoder",
    href: "/tools/jwt-decoder",
    icon: Shield,
    isPremium: false,
  },
  {
    name: "Image Compressor",
    href: "/tools/image-compressor",
    icon: Image,
    isPremium: false,
  },
  {
    name: "UUID Generator",
    href: "/tools/uuid-generator",
    icon: Hash,
    isPremium: false,
  },
  {
    name: "XPath Tester",
    href: "/tools/xpath-tester",
    icon: Code,
    isPremium: false,
  },
]

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        {/* Navigation */}
        <div className="px-3 py-2">
          <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight",
            isCollapsed && "hidden"
          )}>
            DevToolsHub
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="px-3 py-2">
          <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight",
            isCollapsed && "hidden"
          )}>
            Tools
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {tools.map((tool) => (
                <Button
                  key={tool.href}
                  variant={pathname === tool.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start relative",
                    isCollapsed && "justify-center px-2"
                  )}
                  asChild
                >
                  <Link href={tool.href}>
                    <tool.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{tool.name}</span>
                        {tool.isPremium && (
                          <Crown className="h-3 w-3 text-primary" />
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/billing">
                <Crown className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Go Premium"}
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/settings">
                <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Settings"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 