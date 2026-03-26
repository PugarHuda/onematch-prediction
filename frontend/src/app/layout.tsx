import type { Metadata } from "next";
import { Space_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OneMatch — P2P Prediction Duels",
  description: "Swipe. Match. Predict. Win. P2P prediction market on OneChain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-brutal-bg text-black font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
