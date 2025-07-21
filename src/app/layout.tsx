import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hi Bob Expense",
  description: "A Stripe Issuing, Treasury, and Capital demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-hibob-background">
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-hibob-brand">
                      Hi Bob <span className="font-light">Expense</span>
                    </h1>
                  </div>
                </div>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
