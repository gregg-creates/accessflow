import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AxeDevCheck } from "@/components/AxeDevCheck";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: {
    default: "AccessFlow — AI-Powered Accessibility Compliance",
    template: "%s | AccessFlow",
  },
  description:
    "Scan any website for ADA and WCAG violations. Get plain-English explanations, exact code fixes, and effort estimates — powered by AI.",
  metadataBase: new URL("https://accessflow.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="scroll-mt-[72px]">
          {children}
        </main>
        <Footer />
        <AxeDevCheck />
      </body>
    </html>
  );
}
