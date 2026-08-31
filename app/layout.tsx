import "./globals.css";
import {Providers} from './providers';

import { Inter, Playfair_Display } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif-playfair" });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>

    </html>
  );
}
