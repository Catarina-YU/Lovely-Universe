import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixelTitle = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-title",
  display: "swap",
});

const pixelBody = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nosso Universo",
  description: "Uma pequena aventura sob as estrelas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1033",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${pixelTitle.variable} ${pixelBody.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
