import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobDeyEasy | We do the hard part. You hit Send.",
  description: "JobDeyEasy finds jobs that fit you and prepares everything — a tailored CV, a matching cover letter, and a ready-to-send email.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
