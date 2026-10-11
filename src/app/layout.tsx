import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vendorz — Multi-Vendor Delivery Platform",
  description: "Connect sellers, customers, and couriers — by Isibaya Dynamic Group",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
