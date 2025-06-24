import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { headers } from 'next/headers';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruthChecker - AI-Powered Fact Verification",
  description: "Verify facts in real-time with our advanced AI-powered fact-checking system. Analyze text, documents, and audio for instant verification with authoritative sources.",
  keywords: ["fact checking", "AI verification", "truth verification", "misinformation detection"],
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the detected language from middleware headers
  const headersList = await headers();
  const detectedLanguage = headersList.get('x-detected-language') || 'en';

  return (
    <html lang={detectedLanguage} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers detectedLanguage={detectedLanguage}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
