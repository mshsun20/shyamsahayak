import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  AlertTriangle,
  FileText,
  Zap,
  UserPlus,
  Package,
  Gift,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";

const fieldNetwork = [
  { label: "DGOs", value: "312", icon: Users },
  { label: "TMs", value: "120", icon: UserCheck },
  { label: "Fabricators", value: "2,842", icon: Package },
  { label: "Counters", value: "8,976", icon: FileText },
  { label: "Visits This Month", value: "12,842", icon: Zap },
];

const recentActivity = [
  { action: "User updated", module: "Users & Mapping", color: "bg-green-500" },
  { action: "Scheme updated", module: "Schemes", color: "bg-amber-500" },
  { action: "Article published", module: "Knowledge Base", color: "bg-blue-500" },
  { action: "Product updated", module: "Products", color: "bg-primary" },
  { action: "New user added", module: "Users & Mapping", color: "bg-purple-500" },
];

const quickActions = [
  { label: "Add User", desc: "Create a new user account", icon: UserPlus, path: "/users/add" },
  { label: "Add Product", desc: "Add a new product", icon: Package, path: "/content/products/add" },
  { label: "Add Scheme", desc: "Create a new scheme / offer", icon: Gift, path: "/content/schemes" },
  { label: "Add Article", desc: "Add knowledge base article", icon: BookOpen, path: "/content/knowledge-base" },
];

export default function Dashboard() {
  const users = useSelector((state) => state.users);
  const navigate = useNavigate();

  const total = users.length;
  const active = users.filter((u) => u.status === "Active").length;
  const inactive = users.filter((u) => u.status === "Inactive").length;
  const unmapped = users.filter((u) => !u.territory).length;

  const pct = (n) => (total ? ((n / total) * 100).toFixed(1) : "0.0");

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={total.toLocaleString()}
          description="All registered users"
          actionLabel="View all users"
          color="primary"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={active.toLocaleString()}
          description={`${pct(active)}% of total users`}
          actionLabel="View active users"
          color="success"
        />
        <StatCard
          icon={UserMinus}
          label="Inactive Users"
          value={inactive.toLocaleString()}
          description={`${pct(inactive)}% of total users`}
          actionLabel="View inactive users"
          color="warning"
        />
        <StatCard
          icon={UserX}
          label="Unmapped Users"
          value={unmapped.toLocaleString()}
          description={`${pct(unmapped)}% of total users`}
          actionLabel="View unmapped users"
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
        <p className="text-sm font-semibold text-gray-800 mb-4">Field Network Overview</p>
        <div className="flex justify-around flex-wrap gap-8">
          {fieldNetwork.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon size={26} className="text-primary" />
              <div>
                <p className="text-base font-bold text-gray-900 leading-none">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Attention Required */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <p className="text-sm font-semibold text-gray-800">Attention Required</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{inactive} Inactive Users</p>
                <p className="text-xs text-gray-400">Users currently inactive</p>
              </div>
              <button
                onClick={() => navigate("/users")}
                className="text-xs font-medium text-primary shrink-0"
              >
                View Users
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">6 Draft Content Items</p>
                <p className="text-xs text-gray-400">Content not yet published</p>
              </div>
              <button
                onClick={() => navigate("/content")}
                className="text-xs font-medium text-primary shrink-0"
              >
                Review Content
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">18 Draft Articles</p>
                <p className="text-xs text-gray-400">Articles awaiting review</p>
              </div>
              <button
                onClick={() => navigate("/content")}
                className="text-xs font-medium text-primary shrink-0"
              >
                Review Content
              </button>
            </div>
          </div>
          <button className="text-xs font-medium text-primary mt-4">View All Alerts →</button>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Recent Admin Activity</p>
            <button className="text-xs font-medium text-primary flex items-center gap-0.5">
              View All Activity <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-sm text-gray-700">{item.action}</p>
                  <p className="text-xs text-gray-400">{item.module}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-primary" />
            <p className="text-sm font-semibold text-gray-800">Quick Actions</p>
          </div>
          <div className="space-y-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => navigate(qa.path)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <qa.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{qa.label}</p>
                  <p className="text-xs text-gray-400 truncate">{qa.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
