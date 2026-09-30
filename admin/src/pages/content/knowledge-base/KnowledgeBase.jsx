import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  Layers,
  SlidersHorizontal,
  Pencil,
  MoreVertical,
  ChevronRight,
  ChevronsUpDown,
  Trash2,
  Eye,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
// import { deleteArticle } from "../../../redux/store";
import { articleCategories, articleStatuses, articleAuthors } from "../../../data/content";

const filterDefaults = {
  search: "",
  category: "All Categories",
  status: "All Status",
  author: "All Authors",
};

const categoryBadge = {
  Products: "bg-red-50 text-danger",
  Schemes: "bg-green-50 text-success",
  "User Management": "bg-blue-50 text-info",
  Settings: "bg-indigo-50 text-indigo-600",
};

const statusBadge = {
  Published: "bg-green-50 text-success",
  Draft: "bg-amber-50 text-warning",
};

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function KnowledgeBase() {
  const articles = [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch, reset } = useForm({ defaultValues: filterDefaults });
  const { search, category, status, author } = watch();

  const [sortDir, setSortDir] = useState(null);
  const [viewArticle, setViewArticle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredArticles = useMemo(() => {
    let list = articles.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(q) || a.shortDescription.toLowerCase().includes(q);
      const matchesCategory = category === "All Categories" || a.category === category;
      const matchesStatus = status === "All Status" || a.status === status;
      const matchesAuthor = author === "All Authors" || a.author === author;
      return matchesSearch && matchesCategory && matchesStatus && matchesAuthor;
    });

    if (sortDir) {
      list = [...list].sort((a, b) =>
        sortDir === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      );
    }
    return list;
  }, [articles, search, category, status, author, sortDir]);

  const clearFilters = () => reset(filterDefaults);

  const toggleTitleSort = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      // dispatch(deleteArticle(deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout title="Content Management">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Knowledge Base</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-3.5 py-2 rounded-lg hover:bg-primary-light">
            <Layers size={15} />
            Add Article in Bulk
          </button>
          <button
            onClick={() => navigate("/content/knowledge-base/add")}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
          >
            <Plus size={15} />
            Add Article
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 my-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              {...register("search")}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <select
            {...register("category")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Categories</option>
            {articleCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            {...register("status")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Status</option>
            {articleStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            {...register("author")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Authors</option>
            {articleAuthors.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <button onClick={clearFilters} className="text-xs font-medium text-primary ml-auto">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">
                  <button onClick={toggleTitleSort} className="flex items-center gap-1 font-semibold">
                    Article Title
                    <ChevronsUpDown size={12} className="text-gray-300" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Last Updated</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{article.title}</p>
                    <p className="text-xs text-gray-400">{article.shortDescription}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${categoryBadge[article.category]}`}>
                      {article.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.author}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{article.lastUpdated}</p>
                    <p className="text-xs text-gray-400">{article.lastUpdatedTime}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.views ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewArticle(article)}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/content/knowledge-base/edit/${article.id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <ActionsMenu onDelete={() => setDeleteTarget(article)} />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No articles match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      </div>

      {viewArticle && (
        <Modal title="Article Details" onClose={() => setViewArticle(null)}>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Title</span><span className="text-gray-800 font-medium">{viewArticle.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="text-gray-800">{viewArticle.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[viewArticle.status]}`}>{viewArticle.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Author</span><span className="text-gray-800">{viewArticle.author}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Views</span><span className="text-gray-800">{viewArticle.views ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Featured</span><span className="text-gray-800">{viewArticle.featured ? "Yes" : "No"}</span></div>
            <div>
              <span className="text-gray-400 block mb-1">Content</span>
              <p className="text-gray-700 whitespace-pre-line">{viewArticle.content}</p>
            </div>
            {viewArticle.tags?.length > 0 && (
              <div>
                <span className="text-gray-400 block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewArticle.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Article"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.title}</span>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
