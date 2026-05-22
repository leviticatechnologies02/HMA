interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, isLoading = false, emptyMessage = "No data found.",
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={`text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">{emptyMessage}</td></tr>
            ) : data.map((row) => (
              <tr key={String(row[keyField])} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-5 py-4 text-dark ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : String(row[col.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}