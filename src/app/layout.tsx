import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}