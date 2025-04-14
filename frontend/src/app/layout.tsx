import type React from "react";
// import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { SocketProvider } from "@/contexts/socket-context";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "StockTrader Pro",
  description: "A modern stock trading platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SocketProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
