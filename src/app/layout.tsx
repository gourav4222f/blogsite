import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import { SideNav } from "@/components/app/SideNav";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AuthButton } from "@/components/AuthButton";
import { GoToTopButton } from "@/components/GoToTopButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MicroBlog",
  description: "A modern microblogging app",
  applicationName: "MicroBlog",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SidebarProvider>
            <div className="flex min-h-svh w-full bg-background">
              <SideNav />
              <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mx-2 h-6" />
                  <Link href="/">MicroBlog</Link>
                  <div className="ml-auto">
                    <AuthButton />
                  </div>

                </header>
                <main className="flex-1 px-4 py-4 md:px-8">
                  {children}
                </main>
                {/* Floating scroll-to-top button (client component) */}
                <GoToTopButton />
              </SidebarInset>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
