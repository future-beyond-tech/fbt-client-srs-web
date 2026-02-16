export default function StatusBadge({ status }) {
  const styles =
    status === "Sold"
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}
