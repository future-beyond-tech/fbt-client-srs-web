import SaleForm from "@/components/forms/SaleForm";

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:p-6 lg:p-8">
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Billing
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete billing in 4 quick steps and generate bill instantly.
          </p>
        </div>

        <SaleForm />
      </div>
    </main>
  );
}
