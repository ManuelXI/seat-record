import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Seat Record",
  description: "A signed, confidentiality-safe record of what embedded workers did on client engagements.",
};

// Runs before paint so the saved theme never flashes the wrong colours.
const themeScript = `try{var t=localStorage.getItem('seat-record-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
