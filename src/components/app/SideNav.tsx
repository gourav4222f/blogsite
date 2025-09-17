"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  User,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export function SideNav() {
  const { isMobile } = useSidebar();
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
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="px-2 py-2 text-2xl font-bold flex items-center">
          <svg
            width={isMobile ? "22" : "46"}
            height={isMobile ? "20" : "40"}
            viewBox={isMobile ? "0 0 22 20" : "0 0 46 40"}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={isMobile ? "M0 10L1.04545 7H6.62263C10.2607 7 14.006 9.28973 15.8571 11.6216L17 14H10L8.45455 11.6216C7.99397 9.28973 9.73929 7 11.9545 7H18L16.9545 11.6216C16.006 9.28973 13.7393 7 12.3774 7H8L6.37738 11.6216C4.99397 9.28973 3.73929 7 2.04545 7H0Z" : "M0 33L4.60606 25H12.2448C17.2569 25 21.4947 28.7103 22.1571 33.6784L23 40H13L11.5585 36.6365C10.613 34.4304 8.44379 33 6.04362 33H0ZM46 33L41.3939 25H33.7552C28.7431 25 24.5053 28.7103 23.8429 33.6784L23 40H33L34.4415 36.6365C35.387 34.4304 37.5562 33 39.9564 33H46ZM4.60606 25L18.9999 0H23L22.6032 9.52405C22.2608 17.7406 15.7455 24.3596 7.53537 24.8316L4.60606 25ZM41.3939 25L27.0001 0H23L23.3968 9.52405C23.7392 17.7406 30.2545 24.3596 38.4646 24.8316L41.3939 25Z"}
              fill="#0047C1"
            />
          </svg>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={link.name}>
                      <Link href={link.href}>
                        <Icon size={isMobile ? 3 : undefined} />
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto" />
      <SidebarRail />
    </Sidebar>
  );
}
