import { Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { BillingProvider } from "@/features/billing/BillingContext";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Shree Ramalingam Sons | Dealership Billing",
  description: "Frontend billing prototype for bike and car dealership workflow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <BillingProvider>
          <AppShell>{children}</AppShell>
        </BillingProvider>
      </body>
    </html>
  );
}
