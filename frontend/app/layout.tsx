import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "SwaraGPT — AI Virtual Guru for Indian Classical Music",
  description: "An AI-powered virtual guru combining speech processing, MIR, and LLMs for personalized Hindustani & Carnatic music learning, pitch assessment, and raga recognition.",
  keywords: ["Indian Classical Music", "SwaraGPT", "AI Music Guru", "Raga Recognition", "Pitch Analysis", "Swaras", "Shruti", "Hindustani Music", "Carnatic Music"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-[#080B11] text-gray-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
