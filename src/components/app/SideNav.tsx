"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = (
    session?.user as undefined | { username?: string | null }
  )?.username ?? undefined;

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    {
      name: "Profile",
      href: username ? `/${username}` : "/api/auth/signin",
      icon: User,
    },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    // Hidden on mobile, sticky sidebar on md+ screens
    <aside className="hidden md:flex sticky top-0 h-screen flex-col gap-3 p-4 border-r bg-white w-64 shrink-0">
      <div className="text-2xl font-bold text-black mb-8">
        <Link href="/">MicroBlog</Link>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-100",
                {
                  "bg-gray-200 font-bold text-black": isActive,
                }
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
