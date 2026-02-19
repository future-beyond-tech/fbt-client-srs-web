import { Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "SRS Dealership | Billing & Inventory",
  description: "Production frontend for SRS Vehicle Dealership Billing & Inventory System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
