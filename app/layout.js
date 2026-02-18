import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { BillingProvider } from "@/features/billing/BillingContext";

export const metadata = {
  title: "Shree Ramalingam Sons | Dealership Billing",
  description: "Frontend billing prototype for bike and car dealership workflow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <BillingProvider>
          <AppShell>{children}</AppShell>
        </BillingProvider>
      </body>
    </html>
  );
}
