import type { Metadata } from "next";
import { Exo_2 } from "next/font/google"; // Import Exo_2
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Configure the new font
const exo2 = Exo_2({ subsets: ["latin"], weight: ["400", "700", "800"] });

export const metadata: Metadata = {
  title: "Insight",
  description: "Train your Counter-Strike decision making",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${exo2.className} text-gray-100`}>
        <Providers>
          <Navbar />
          {/* The main content now has a bit of top padding to not be directly under the navbar */}
          <main className="pt-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
