import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import MarqueeBackground from "@/components/MarqueeBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVA - Authenticity Validator for Academia",
  description: "Enterprise-grade academic credential verification platform with OCR, cryptographic hashing, and blockchain anchoring. Secure verification of diplomas, transcripts, and certificates.",
  keywords: ["AVA", "Academic Verification", "Credential Validation", "Document Authentication", "Blockchain Verification", "OCR Certificate"],
  authors: [{ name: "AVA Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AVA - Authenticity Validator for Academia",
    description: "Secure digital verification of academic credentials with enterprise-grade security",
    url: "https://ava-platform.com",
    siteName: "AVA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVA - Authenticity Validator for Academia",
    description: "Secure digital verification of academic credentials",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        style={{ position: "relative" }}
      >
        <MarqueeBackground />
        <Providers>
          <ThemeToggle />
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              className: 'skeuo-notification animate-in slide-in-from-top-4 fade-in duration-300 font-bold',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

