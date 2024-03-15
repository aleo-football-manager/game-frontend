import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Super Leo Lig",
  description: "ZK Football Manager game",
  metadataBase: new URL("https://superleolig.online"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>
            <NextTopLoader crawlSpeed={50} speed={50} showSpinner={false} />
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
