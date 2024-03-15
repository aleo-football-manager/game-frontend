"use client";

import { PuzzleWalletProvider } from "@puzzlehq/sdk";
import { ThemeProvider } from "next-themes";
//@ts-ignore
export function Providers({ children }) {
  return (
    <ThemeProvider enableSystem defaultTheme="system" attribute="class">
      <PuzzleWalletProvider
        dAppName="Super Leo Lig"
        dAppDescription="Zk Football Manager game"
        dAppUrl="https://superleolig.online/"
        dAppIconURL="https://superleolig.online/logo.png"
      >
        {children}
      </PuzzleWalletProvider>
    </ThemeProvider>
  );
}
