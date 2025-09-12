import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader } from "./components/conditional-header";
import { ConditionalMain } from "./components/conditional-main";

export const metadata: Metadata = {
  title: "Pluxee SnackPack - SME Benefits Revolution",
  description: "Modern employee benefits platform for SMEs - From 18-month banking delays to 60-day MVP launch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConditionalHeader />
        <ConditionalMain>
          {children}
        </ConditionalMain>
      </body>
    </html>
  );
}
