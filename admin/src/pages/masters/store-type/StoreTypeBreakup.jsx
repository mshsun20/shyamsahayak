import { useState, useMemo, useRef } from "react";
import { Download, Upload, Search, ChevronUp, ChevronDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import { initialStoreTypeBreakup } from "../../../data/masterData";

const columns = [
  { key: "counterId", label: "Counter ID" },
  { key: "zone", label: "Zone" },
  { key: "state", label: "State" },
  { key: "district", label: "District" },
  { key: "dealerName", label: "Dealer Name" },
  { key: "primaryDB", label: "Primary DB" },
  { key: "apr", label: "Apr'26 (MT)", numeric: true },
  { key: "may", label: "May'26 (MT)", numeric: true },
  { key: "jun", label: "Jun'26 (MT)", numeric: true },
  { key: "l3mAvg", label: "L3M Avg (MT)", numeric: true },
  { key: "storeType", label: "Store Type" },
];

function parseCsv(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line, i) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row = { id: `uploaded-${i}` };
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    return row;
  });
}

export default function StoreTypeBreakup() {
  const [rows, setRows] = useState(initialStoreTypeBreakup);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const fileInputRef = useRef(null);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    let list = rows.filter(
      (r) =>
        !q ||
        String(r.dealerName || "").toLowerCase().includes(q) ||
        String(r.state || "").toLowerCase().includes(q) ||
        String(r.primaryDB || "").toLowerCase().includes(q) ||
        String(r.counterId || "").toLowerCase().includes(q)
    );
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === bv) return 0;
        const result = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? result : -result;
      });
    }
    return list;
  }, [rows, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label);
    const csvRows = filteredRows.map((r) => columns.map((c) => r[c.key] ?? ""));
    const csvContent = [headers, ...csvRows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "store-type-breakup.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result));
      if (parsed.length > 0) setRows(parsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronUp size={11} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  return (
    <AdminLayout title="Master Data">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Store Type Breakup</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50"
          >
            <Download size={15} />
            Download as Sheet
          </button>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
          >
            <Upload size={15} />
            Upload File
          </button>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name / State / Manager"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1c2333] text-left text-[11px] uppercase tracking-wide text-gray-200">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                    <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1">
                      {c.label}
                      <SortIcon colKey={c.key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-2.5 whitespace-nowrap ${c.numeric ? "text-info font-medium" : "text-gray-700"}`}
                    >
                      {c.numeric ? Number(r[c.key] ?? 0).toFixed(2) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredRows.length} of {rows.length} records
        </div>
      </div>
    </AdminLayout>
  );
}
