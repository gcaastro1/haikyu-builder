import "@/styles/main.scss";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Navbar } from "./components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter', 
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700'], 
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: "Haikyu!! Team Builder",
  description: "Crie seu time de Haikyu!! Fly High",
};

import { Footer } from "./components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <body>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar /> 
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </div>
        <SpeedInsights/>
      </body>
    </html>
  );
}