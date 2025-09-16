export function downloadCSV(filename: string, rows: any[]) {
  const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map(r => keys.map(k => esc(r[k])).join(",")).join("\n");
  const csv = keys.join(",") + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
