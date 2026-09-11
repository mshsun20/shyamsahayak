import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Download,
  Plus,
  Layers,
  SlidersHorizontal,
  Eye,
  MoreVertical,
  Package,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Modal from "../components/Modal";
import { deleteProduct, deleteProducts } from "../redux/store";
import { productCategories } from "../data/content";

const filterDefaults = {
  search: "",
  category: "All Categories",
  status: "All Status",
  featured: "All",
};

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-50 text-success" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? "Published" : "Draft"}
    </span>
  );
}

function ActionsMenu({ onEdit, onDelete }) {
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
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Pencil size={13} />
              Edit
            </button>
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

export default function Products() {
  const products = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch, reset } = useForm({ defaultValues: filterDefaults });
  const { search, category, status, featured } = watch();

  const [selected, setSelected] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q);
      const matchesCategory = category === "All Categories" || p.category === category;
      const matchesStatus =
        status === "All Status" ||
        (status === "Published" && p.status === "Active") ||
        (status === "Draft" && p.status === "Draft");
      const matchesFeatured =
        featured === "All" ||
        (featured === "Yes" && p.featured) ||
        (featured === "No" && !p.featured);
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [products, search, category, status, featured]);

  const clearFilters = () => reset(filterDefaults);

  const allSelected = filteredProducts.length > 0 && selected.length === filteredProducts.length;

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : filteredProducts.map((p) => p.id));
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExport = () => {
    const headers = ["Product Name", "Category", "SKU / Code", "Price", "Status", "Featured", "Last Updated"];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.category,
      p.sku,
      `${p.price} / ${p.priceUnit}`,
      p.status === "Active" ? "Published" : "Draft",
      p.featured ? "Yes" : "No",
      `${p.lastUpdated} ${p.lastUpdatedTime}`,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteProduct(deleteTarget.id));
      setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const confirmBulkDelete = () => {
    dispatch(deleteProducts(selected));
    setSelected([]);
    setBulkDeleteOpen(false);
  };

  return (
    <AdminLayout title="Content Management">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Products</span>
            <ChevronRight size={12} />
            <span className="text-gray-600">Product List</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Product List</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50"
          >
            <Download size={15} />
            Export
          </button>
          <button className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-3.5 py-2 rounded-lg hover:bg-primary-light">
            <Layers size={15} />
            Add Product in Bulk
          </button>
          <button
            onClick={() => navigate("/content/products/add")}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
          >
            <Plus size={15} />
            Add Product
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
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <select
            {...register("category")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Categories</option>
            {productCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            {...register("status")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

          <select
            {...register("featured")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All</option>
            <option value="Yes">Featured</option>
            <option value="No">Not Featured</option>
          </select>

          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
            <SlidersHorizontal size={14} />
            More Filters
          </button>

          <button onClick={clearFilters} className="text-xs font-medium text-primary ml-auto">
            Clear
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-primary-light border border-primary/30 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-sm text-primary font-medium">{selected.length} selected</span>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-danger"
          >
            <Trash2 size={13} />
            Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary/30"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">SKU / Code</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Last Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleSelectOne(product.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-gray-600">{product.sku}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ₹{product.price} / {product.priceUnit}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{product.lastUpdated}</p>
                    <p className="text-xs text-gray-400">
                      {product.lastUpdatedTime} · {product.lastUpdatedBy}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewProduct(product)}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <ActionsMenu
                        onEdit={() => navigate(`/content/products/edit/${product.id}`)}
                        onDelete={() => setDeleteTarget(product)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No products match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {viewProduct && (
        <Modal title="Product Details" onClose={() => setViewProduct(null)}>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Product Name</span><span className="text-gray-800 font-medium">{viewProduct.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">SKU / Code</span><span className="text-gray-800">{viewProduct.sku}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="text-gray-800">{viewProduct.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Unit Type</span><span className="text-gray-800">{viewProduct.unitType}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="text-gray-800">₹{viewProduct.price} / {viewProduct.priceUnit}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">GST Rate</span><span className="text-gray-800">{viewProduct.gstRate}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><StatusBadge status={viewProduct.status} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Featured</span><span className="text-gray-800">{viewProduct.featured ? "Yes" : "No"}</span></div>
            <div>
              <span className="text-gray-400 block mb-1">Short Description</span>
              <p className="text-gray-700">{viewProduct.shortDescription}</p>
            </div>
            {viewProduct.tags?.length > 0 && (
              <div>
                <span className="text-gray-400 block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewProduct.tags.map((t) => (
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
          title="Delete Product"
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
            Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.name}</span>? This action cannot be undone.
          </p>
        </Modal>
      )}

      {bulkDeleteOpen && (
        <Modal
          title="Delete Products"
          onClose={() => setBulkDeleteOpen(false)}
          footer={
            <>
              <button
                onClick={() => setBulkDeleteOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-800">{selected.length} product{selected.length > 1 ? "s" : ""}</span>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
