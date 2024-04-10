import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import localFont from "@next/font/local";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const panamera = localFont({
  src: [
    {
      path: "../../public/fonts/panamera/Panamera-Light.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/panamera/Panamera-Regular.ttf",
      weight: "500",
    },
    {
      path: "../../public/fonts/panamera/Panamera-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-panamera",
});
const phosphene = localFont({
  src: [
    {
      path: "../../public/fonts/panamera/PhospheneFont-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-phosphene",
});
const uncutSans = localFont({
  src: [
    {
      path: "../../public/fonts/panamera/UncutSans-Variable.ttf",
      weight: "400",
    },
  ],
  variable: "--font-uncutSans",
});
const technor = localFont({
  src: [
    {
      path: "../../public/fonts/technor/Technor-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/technor/Technor-Semibold.ttf",
      weight: "500",
    },
    {
      path: "../../public/fonts/technor/Technor-Bold.ttf",
      weight: "600",
    },
  ],
  variable: "--font-technor",
});
const supreme = localFont({
  src: [
    {
      path: "../../public/fonts/supreme/Supreme-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/supreme/Supreme-Medium.ttf",
      weight: "500",
    },
    {
      path: "../../public/fonts/supreme/Supreme-Bold.ttf",
      weight: "600",
    },
  ],
  variable: "--font-supreme",
});

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
      <body
        className={`
          ${supreme.variable} ${technor.variable} ${panamera.variable}
          ${uncutSans.variable}   ${phosphene.variable}       `}
      >
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
