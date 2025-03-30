import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./lib/themeContext";
import Navigation from "./components/ui/Navigation";
import { SupabaseProvider } from "./lib/supabase/provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Zen Space | Mental Health AI Assistant",
  description: "Your personal AI companion for mental well-being and emotional support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased mood-theme-transition`}
      >
        <SupabaseProvider>
          <ThemeProvider>
            <Navigation />
            {children}
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
