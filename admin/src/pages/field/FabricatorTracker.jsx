import { useState, useMemo, useRef } from "react";
import { Download, Upload, Search, Medal } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { initialFabricatorVisits } from "../../data/masterData";

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

export default function FabricatorTracker() {
  const [rows] = useState(initialFabricatorVisits);
  const [search, setSearch] = useState("");
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
    const headers = [
      "Zone", "State", "Rank", "Name", "Reporting Manager",
      "Total Counter Visits (Today)", "Productive Counter Visits (Today)", "Total Fabricator Visits (Today)",
      "Working Days (MTD)", "Productive Counter Visits (MTD)", "Total Order Volume Tn (MTD)", "Total Fabricator Visits (MTD)",
    ];
    const csvRows = filteredRows.map((r) => [
      r.zone, r.state, r.rank, r.name, r.reportingManager,
      r.forTheDay.totalCounterVisits ?? "", r.forTheDay.productiveCounterVisits ?? "", r.forTheDay.totalFabricatorVisits ?? "",
      r.mtd.workingDays ?? "", r.mtd.productiveCounterVisits ?? "", r.mtd.totalOrderVolume ?? "", r.mtd.totalFabricatorVisits ?? "",
    ]);
    const csvContent = [headers, ...csvRows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fabricator-visits.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Master Data">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Field Visit Tracker (Fabricator)</h2>
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
                <th colSpan={3} className="px-4 py-2 bg-[#0f3d2e] text-white text-xs font-semibold text-left">For The Day (19-08-2026)</th>
                <th colSpan={4} className="px-4 py-2 bg-[#5a3212] text-white text-xs font-semibold text-left">Month Till Date (Overall Visit)</th>
              </tr>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Reporting Manager</th>
                <th className="px-4 py-3 font-semibold">Total Counter Visits</th>
                <th className="px-4 py-3 font-semibold">Productive Counter Visits</th>
                <th className="px-4 py-3 font-semibold">Total Fabricators Visits</th>
                <th className="px-4 py-3 font-semibold">#Working Days</th>
                <th className="px-4 py-3 font-semibold">Productive Counter Visits</th>
                <th className="px-4 py-3 font-semibold">Total Order Volume (Tn)</th>
                <th className="px-4 py-3 font-semibold">Total Fabricators Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-600">{r.zone}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.state}</td>
                  <td className="px-4 py-2.5"><RankBadge rank={r.rank} /></td>
                  <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.reportingManager}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.forTheDay.totalCounterVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.forTheDay.productiveCounterVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.forTheDay.totalFabricatorVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.mtd.workingDays ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.mtd.productiveCounterVisits ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.mtd.totalOrderVolume ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.mtd.totalFabricatorVisits ?? "-"}</td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-gray-400 text-sm">
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
