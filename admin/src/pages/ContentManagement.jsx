import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Tag, BookOpen, Calendar, Star, ArrowRight, Eye, MoreVertical, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import { recentContent } from "../data/content";

const typeBadge = {
  Product: "bg-blue-50 text-info",
  Scheme: "bg-green-50 text-success",
  Article: "bg-amber-50 text-warning",
};

const statusBadge = {
  Published: "bg-green-50 text-success",
  Draft: "bg-gray-100 text-gray-500",
};

const filterOptions = ["All Content", "Products", "Schemes", "Articles"];

export default function ContentManagement() {
  const products = useSelector((state) => state.products);
  const schemes = useSelector((state) => state.schemes);
  const articles = useSelector((state) => state.articles);
  const navigate = useNavigate();
  const [contentFilter, setContentFilter] = useState("All Content");
  const [filterOpen, setFilterOpen] = useState(false);

  const publishedProducts = products.filter((p) => p.status === "Active").length;
  const draftProducts = products.filter((p) => p.status === "Draft").length;

  const activeSchemes = schemes.filter((s) => s.status === "Active").length;
  const upcomingSchemes = schemes.filter((s) => s.status === "Upcoming").length;
  const expiredSchemes = schemes.filter((s) => s.status === "Expired").length;
  const nextExpiry = useMemo(() => {
    const upcoming = schemes
      .filter((s) => !s.noExpiry && s.endDate && new Date(s.endDate) >= new Date())
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    if (upcoming.length === 0) return "—";
    return new Date(upcoming[0].endDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [schemes]);

  const publishedArticles = articles.filter((a) => a.status === "Published").length;
  const draftArticles = articles.filter((a) => a.status === "Draft").length;
  const featuredArticles = articles.filter((a) => a.featured).length;

  const filteredContent = useMemo(() => {
    if (contentFilter === "All Content") return recentContent;
    const typeMap = { Products: "Product", Schemes: "Scheme", Articles: "Article" };
    return recentContent.filter((item) => item.type === typeMap[contentFilter]);
  }, [contentFilter]);

  return (
    <AdminLayout title="Content Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-500">Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length.toLocaleString()}</p>
          <p className="text-xs text-gray-400 -mt-2">
            {publishedProducts} Published · {draftProducts} Draft
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            Updated today, 10:30 AM
          </p>
          <button
            onClick={() => navigate("/content/products")}
            className="flex items-center gap-1 text-xs font-medium text-primary mt-1"
          >
            Manage Products
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Schemes card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 text-success flex items-center justify-center">
              <Tag size={18} />
            </div>
            <span className="text-sm text-gray-500">Schemes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{schemes.length}</p>
          <p className="text-xs text-gray-400 -mt-2">
            {activeSchemes} Active · {upcomingSchemes} Upcoming · {expiredSchemes} Expired
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            Next expiry: {nextExpiry}
          </p>
          <button
            onClick={() => navigate("/content/schemes")}
            className="flex items-center gap-1 text-xs font-medium text-success mt-1"
          >
            Manage Schemes
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Knowledge Base card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-sm text-gray-500">Knowledge Base</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
          <p className="text-xs text-gray-400 -mt-2">
            {publishedArticles} Published · {draftArticles} Draft
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Star size={12} />
            {featuredArticles} Featured articles
          </p>
          <button
            onClick={() => navigate("/content/knowledge-base")}
            className="flex items-center gap-1 text-xs font-medium text-purple-600 mt-1"
          >
            Manage Articles
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mt-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Recently Updated Content</p>
          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            >
              {contentFilter}
              <ChevronDown size={14} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setContentFilter(opt);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                      opt === contentFilter ? "text-primary font-medium" : "text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Category / Group</th>
                <th className="px-5 py-3 font-semibold">Last Updated By</th>
                <th className="px-5 py-3 font-semibold">Last Updated</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContent.map((item, i) => (
                <tr key={`${item.id}-${i}`} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.title}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[item.type]}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{item.group}</td>
                  <td className="px-5 py-3 text-gray-600">{item.updatedBy}</td>
                  <td className="px-5 py-3">
                    <p className="text-gray-700">{item.lastUpdated}</p>
                    <p className="text-xs text-gray-400">{item.lastUpdatedTime}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-info hover:bg-blue-50 rounded-md">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
