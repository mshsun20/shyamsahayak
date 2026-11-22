import { useMemo, useState } from "react";
import { Search } from "lucide-react";

// Grouped checkbox table of permissions from Permission Master.
// Unlike PermissionTable (which stores ids) an API client stores permission *codes*.
export default function ApiClientPermissionPicker({ options, value = [], onChange }) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState("All");

  // Keep codes already assigned to the client visible even if they are no longer active.
  const allOptions = useMemo(() => {
    const known = new Set(options.map((o) => o.code));
    const orphans = value.filter((c) => !known.has(c)).map((c) => ({ _id: c, code: c, module: "unavailable", name: c, description: "No longer active in Permission Master" }));
    return [...options, ...orphans];
  }, [options, value]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();
    allOptions.forEach((o) => {
      const selected = value.includes(o.code);
      const matchesQuery =
        !q || o.name?.toLowerCase().includes(q) || o.code?.toLowerCase().includes(q) || o.module?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q);
      const matchesShow = show === "All" || (show === "Selected" ? selected : !selected);
      if (!matchesQuery || !matchesShow) return;
      const key = o.module || "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [allOptions, value, query, show]);

  const toggle = (code) => onChange(value.includes(code) ? value.filter((v) => v !== code) : [...value, code]);

  const toggleGroup = (items) => {
    const codes = items.map((i) => i.code);
    const allOn = codes.every((c) => value.includes(c));
    onChange(allOn ? value.filter((v) => !codes.includes(v)) : [...new Set([...value, ...codes])]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 min-w-55 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code or module..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Show:</span>
          <select
            value={show}
            onChange={(e) => setShow(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All</option>
            <option value="Selected">Selected</option>
            <option value="Unselected">Unselected</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {groups.map(([module, items]) => {
                const selectedCount = items.filter((i) => value.includes(i.code)).length;
                const all = selectedCount === items.length;
                return [
                  <tr key={`g-${module}`} className="bg-gray-50 border-y border-gray-200 first:border-t-0">
                    <td className="px-4 py-2 w-12">
                      <input
                        type="checkbox"
                        checked={all}
                        ref={(el) => el && (el.indeterminate = selectedCount > 0 && !all)}
                        onChange={() => toggleGroup(items)}
                        className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                      />
                    </td>
                    <td colSpan={2} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {module}
                      <span className="ml-2 normal-case font-normal text-gray-400">
                        {selectedCount}/{items.length}
                      </span>
                    </td>
                  </tr>,
                  ...items.map((o) => (
                    <tr key={o.code} onClick={() => toggle(o.code)} className="cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-2.5 w-12">
                        <input
                          type="checkbox"
                          checked={value.includes(o.code)}
                          onChange={() => toggle(o.code)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                        />
                      </td>
                      <td className="px-4 py-2.5 w-2/5">
                        <p className="font-medium text-gray-900">{o.name || o.code}</p>
                        <p className="text-[11px] font-mono text-gray-400">{o.code}</p>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{o.description || "-"}</td>
                    </tr>
                  )),
                ];
              })}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        {value.length} permission{value.length === 1 ? "" : "s"} selected
      </p>
    </div>
  );
}
