import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { FavoritesProvider } from "@/lib/favorites";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { Header, Footer } from "@/components/layout/HeaderFooter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ShariEstate | Find Your Dream Home", template: "%s | ShariEstate" },
  description: "Search homes for sale and rent across the United States.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <FavoritesProvider>
            <NavigationProvider>
              <Header />
              <main className="min-h-[calc(100vh-8rem)]">{children}</main>
              <Footer />
            </NavigationProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
