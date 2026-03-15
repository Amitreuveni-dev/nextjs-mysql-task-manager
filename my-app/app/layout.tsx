import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { A11yPanel } from "@/components/accessibility/a11y-panel";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SyncroMind AI",
    template: "%s | SyncroMind AI",
  },
  description: "AI-powered project and task management. Organize, prioritize, and execute smarter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#3b82f6" height={3} showSpinner={false} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
          {children}
          <A11yPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
