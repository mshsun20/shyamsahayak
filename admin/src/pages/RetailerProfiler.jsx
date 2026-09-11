import { useState, useMemo, useRef } from "react";
import { Download, Upload, Search, Medal } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import { initialRetailerVisits } from "../data/masterData";

const medalColor = { 1: "text-yellow-500", 2: "text-gray-400", 3: "text-amber-700" };

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span className={`flex items-center gap-1 font-semibold ${medalColor[rank]}`}>
        <Medal size={15} />
        {rank}
      </span>
    );
  }
  return <span className="text-gray-500">{rank}</span>;
}

export default function RetailerProfiler() {
  const [rows] = useState(initialRetailerVisits);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("MTD");
  const fileInputRef = useRef(null);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.reportingManager.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleExport = () => {
    const headers = ["Date", "Zone", "State", "Rank", "Name", "Reporting Manager", "Total Counter Visits", "Productive Counter Visits", "Order Qty (Tn)", "Total Fabricators Met"];
    const csvRows = filteredRows.map((r) => [
      r.date, r.zone, r.state, r.rank, r.name, r.reportingManager,
      r.totalCounterVisits ?? "", r.productiveCounterVisits ?? "", r.orderQty ?? "", r.totalFabricatorsMet ?? "",
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "retailer-profiler-visits.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Master Data">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Field Visit Tracker (Retailer + Profiler)</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50"
          >
            <Download size={15} />
            Download as Sheet
          </button>
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" />
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
              <tr>
                <th colSpan={5} className="px-4 py-2 bg-blue-50 text-info text-xs font-semibold text-left">Identity</th>
                <th colSpan={5} className="px-4 py-2 bg-green-50 text-success text-xs font-semibold text-left relative">
                  <div className="flex items-center justify-between">
                    Daily Metrics
                    <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
                      <button
                        onClick={() => setPeriod("MTD")}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${period === "MTD" ? "bg-primary-light text-primary" : "text-gray-400"}`}
                      >
                        MTD
                      </button>
                      <button
                        onClick={() => setPeriod("OM")}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${period === "OM" ? "bg-primary-light text-primary" : "text-gray-400"}`}
                      >
                        OM
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Reporting Manager</th>
                <th className="px-4 py-3 font-semibold">Total Counter Visits</th>
                <th className="px-4 py-3 font-semibold">Productive Counter Visits</th>
                <th className="px-4 py-3 font-semibold">Order Qty (Tn)</th>
                <th className="px-4 py-3 font-semibold">Total Fabricators Met</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.zone}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.state}</td>
                  <td className="px-4 py-2.5"><RankBadge rank={r.rank} /></td>
                  <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.reportingManager}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.totalCounterVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.productiveCounterVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.orderQty != null ? r.orderQty.toFixed(2) : "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.totalFabricatorsMet ?? "-"}</td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400 text-sm">
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
