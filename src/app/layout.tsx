import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader } from "./components/conditional-header";
import { ConditionalMain } from "./components/conditional-main";

export const metadata: Metadata = {
  title: "Stripe Connect & Issuing Demo",
  description: "Live coding demo of Stripe Connect and Issuing capabilities",
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
