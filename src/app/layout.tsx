import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/config/constants";
import { TopBar } from "@/components/navigation/top-bar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { DesktopNav } from "@/components/navigation/desktop-nav";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastProvider } from "@/components/common/toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-dvh bg-zinc-950 font-sans text-zinc-100 antialiased">
        <AuthProvider>
          <ToastProvider>
            {/* Mobile: top bar + bottom nav */}
            <div className="md:hidden">
              <TopBar />
            </div>
            {/* Desktop: top navigation */}
            <DesktopNav />
            <main className="mx-auto min-h-dvh max-w-3xl pb-20 md:pb-4">
              {children}
            </main>
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
