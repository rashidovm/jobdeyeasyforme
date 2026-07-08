import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobdeyeasyforme.vercel.app"),
  title: {
    default: "JobDeyEasy — We do the hard part. You hit Send.",
    template: "%s | JobDeyEasy",
  },
  description:
    "JobDeyEasy finds jobs that fit you and prepares everything: a tailored CV, a matching cover letter, and a ready-to-send email. You just hit Send.",
  openGraph: {
    type: "website",
    siteName: "JobDeyEasy",
    title: "JobDeyEasy — We do the hard part. You hit Send.",
    description:
      "We find jobs that fit you and prepare everything — a tailored CV, a matching cover letter, and a ready-to-send email.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobDeyEasy — We do the hard part. You hit Send.",
    description:
      "We find jobs that fit you and prepare everything — a tailored CV, a matching cover letter, and a ready-to-send email.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
