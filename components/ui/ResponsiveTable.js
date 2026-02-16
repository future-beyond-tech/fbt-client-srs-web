import EmptyState from "@/components/ui/EmptyState";

function getCellValue(column, row) {
  if (column.render) {
    return column.render(row);
  }

  return row[column.key] ?? "-";
}

export default function ResponsiveTable({
  columns,
  data,
  emptyTitle = "No records available",
  emptyMessage = "Add data to get started.",
  mobileTitleKey,
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 lg:px-5"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className="px-4 py-3 text-sm text-slate-700 lg:px-5"
                  >
                    {getCellValue(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {data.map((row) => (
          <article key={row.id} className="p-4">
            <p className="text-sm font-semibold text-slate-900">
              {mobileTitleKey ? row[mobileTitleKey] : row[columns[0].key]}
            </p>

            <dl className="mt-3 space-y-2">
              {columns.map((column) => (
                <div key={`${row.id}-mobile-${column.key}`} className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {column.label}
                  </dt>
                  <dd className="text-sm text-slate-700">{getCellValue(column, row)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
