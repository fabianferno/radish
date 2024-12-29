import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Some App",
  description: "This app does something",
  icons: ["/logo.gif"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
