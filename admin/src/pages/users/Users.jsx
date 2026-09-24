import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Search, Eye, Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Modal from "../../components/Modal";
// import { deleteUser } from "../../redux/store";
import { roles, territories } from "../../data/users";


const avatarColors = [
  "bg-[#fff0dc] text-[#f97316]",
  "bg-[#fff9c7] text-[#ca8a04]",
  "bg-[#f0e7ff] text-[#9333ea]",
  "bg-[#e1edff] text-[#2563eb]",
  "bg-[#dcfce7] text-[#16a34a]",
  "bg-[#ffe5f1] text-[#db2777]",
];

const getAvatarColor = (name = "") => {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarColors.length;

  return avatarColors[index];
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};


const filterDefaults = {
  search: "",
  role: "All Roles",
  status: "All Status",
  territory: "All Territories",
};

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-50 text-success" : "bg-red-50 text-danger"
      }`}
    >
      {status}
    </span>
  );
}

export default function Users() {
  const users = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [viewUser, setViewUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, watch, reset } = useForm({ defaultValues: filterDefaults });
  const { search, role, status, territory } = watch();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.employeeId.toLowerCase().includes(q);

      const matchesRole = role === "All Roles" || user.role === role;
      const matchesStatus = status === "All Status" || user.status === status;
      const matchesTerritory = territory === "All Territories" || user.territory === territory;

      return matchesSearch && matchesRole && matchesStatus && matchesTerritory;
    });
  }, [users, search, role, status, territory]);

  const clearFilters = () => reset(filterDefaults);

  const handleExport = () => {
    const headers = [
      "Employee Name",
      "Employee ID",
      "Role",
      "Reporting Manager",
      "Assigned Territory",
      "Status",
      "Last Login",
    ];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.employeeId,
      u.role,
      u.reportingManager,
      u.territory,
      u.status,
      u.lastLogin,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // const confirmDelete = () => {
  //   if (deleteTarget) {
  //     dispatch(deleteUser(deleteTarget.id));
  //     setDeleteTarget(null);
  //   }
  // };

  return (
    <AdminLayout title="Users & Mapping">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          All Users ({users.length.toLocaleString()})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => navigate("/users/add")}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
          >
            <Plus size={15} />
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by name, email, or employee ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <SlidersHorizontal size={13} />
            Filters
          </span> */}

          <select
            {...register("role")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Roles</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <select
            {...register("status")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <select
            {...register("territory")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Territories</option>
            {territories.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="text-xs font-medium text-primary">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Employee Name</th>
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Reporting Manager</th>
                <th className="px-4 py-3 font-semibold">Assigned Territory</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Login</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 align-middle">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`
                  flex
                  h-[27px]
                  w-[27px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-[10px]
                  font-medium
                  ${getAvatarColor(user.name)}
                `}
              >
                {getInitials(user.name)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold leading-[15px] text-[#1f2937]">
                  {user.name}
                </p>

                <p className="truncate text-[10px] leading-[14px] text-[#8a94a6]">
                  {user.email}
                </p>
              </div>
            </div>
          </td>
                  <td className="px-4 py-3 text-gray-600">{user.employeeId}</td>
                  <td className="px-4 py-3 text-gray-600">{user.role}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{user.reportingManager}</p>
                    <p className="text-xs text-gray-400">{user.reportingManagerId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.territory}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{user.lastLogin}</p>
                    <p className="text-xs text-gray-400">{user.loginTime}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewUser(user)}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)}>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Full Name</span><span className="text-gray-800 font-medium">{viewUser.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Employee ID</span><span className="text-gray-800">{viewUser.employeeId}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-800">{viewUser.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-800">{viewUser.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-gray-800">{viewUser.role}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Reporting Manager</span><span className="text-gray-800">{viewUser.reportingManager}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Territory</span><span className="text-gray-800">{viewUser.territory}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">District</span><span className="text-gray-800">{viewUser.district}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><StatusBadge status={viewUser.status} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Last Login</span><span className="text-gray-800">{viewUser.lastLogin} · {viewUser.loginTime}</span></div>
            {viewUser.remarks && (
              <div>
                <span className="text-gray-400 block mb-1">Remarks</span>
                <p className="text-gray-700">{viewUser.remarks}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete User"
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
    </AdminLayout>
  );
}
