import { useState, useMemo } from "react";
import { Search } from "lucide-react";

// Checkbox table of permissions from Permission Master. `value` is an array of permission ids.
export default function PermissionTable({ options, value = [], onChange }) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => {
      const matchesQuery =
        !q || o.name?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q);
      const isSelected = value.includes(o._id);
      const matchesShow = show === "All" || (show === "Selected" ? isSelected : !isSelected);
      return matchesQuery && matchesShow;
    });
  }, [options, value, query, show]);

  const allVisibleSelected = visible.length > 0 && visible.every((o) => value.includes(o._id));

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const toggleAllVisible = () => {
    const visibleIds = visible.map((o) => o._id);
    if (allVisibleSelected) {
      onChange(value.filter((v) => !visibleIds.includes(v)));
    } else {
      onChange([...new Set([...value, ...visibleIds])]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search permissions..."
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
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1]">
              <tr className="bg-gray-50 text-left text-xs text-gray-700 border-b border-gray-200">
                <th className="px-4 py-2.5 w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    disabled={visible.length === 0}
                    className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                  />
                </th>
                <th className="px-4 py-2.5 font-semibold w-2/5">Permission Name</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((option) => (
                <tr
                  key={option._id}
                  onClick={() => toggle(option._id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={value.includes(option._id)}
                      onChange={() => toggle(option._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{option.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{option.description || "-"}</td>
                </tr>
              ))}
              {visible.length === 0 && (
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