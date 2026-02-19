import PurchaseForm from "@/components/forms/PurchaseForm";

export default function PurchasesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">New Purchase</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add newly purchased vehicle and seller details.
          </p>
        </header>

        <PurchaseForm />
      </div>
    </main>
  );
}
