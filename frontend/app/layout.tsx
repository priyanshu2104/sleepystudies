import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SleepyStudies | Free Computer Science Notes Repository",
    template: "%s | SleepyStudies",
  },
  description: "Free, high-quality handwritten lecture notes, slides, and study guides for Computer Science students.",
  keywords: ["Computer Science", "Lecture Notes", "Engineering Notes", "SleepyStudies", "University Notes", "PDF Notes"],
  openGraph: {
    title: "SleepyStudies | Free Computer Science Notes Repository",
    description: "Study Smarter, Sleep Better. Free high-quality university notes and guides.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
        <Navbar />

        {children}
      </body>
    </html>
  );
}