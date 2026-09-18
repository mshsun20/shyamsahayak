import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  AlertTriangle,
  FileText,
  UserPlus,
  Package,
  Gift,
  BookOpen,
  ChevronRight,
  History,
  Factory,
  Store,
  MapPin,
  Tag,
  UserRound,
  FilePlus2,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";

const fieldNetwork = [
  { label: "DGOs", value: "312", icon: UserRound },
  { label: "TMs", value: "120", icon: Users },
  { label: "Fabricators", value: "2,842", icon: Factory },
  { label: "Counters", value: "8,976", icon: Store },
  { label: "Visits This Month", value: "12,842", icon: MapPin },
];

const recentActivity = [
  { action: "User updated", module: "Users & Mapping", icon: UserRound, tone: "green" },
  { action: "Scheme updated", module: "Schemes", icon: Tag, tone: "amber" },
  { action: "Article published", module: "Knowledge Base", icon: FileText, tone: "blue" },
  { action: "Product updated", module: "Products", icon: Package, tone: "orange" },
  { action: "New user added", module: "Users & Mapping", icon: UserPlus, tone: "purple" },
];

const quickActions = [
  {
    label: "Add User",
    desc: "Create a new user account",
    icon: UserPlus,
    path: "/users/add",
    tone: "red",
  },
  {
    label: "Add Product",
    desc: "Add a new product",
    icon: Package,
    path: "/content/products/add",
    tone: "green",
  },
  {
    label: "Add Scheme",
    desc: "Create a new scheme / offer",
    icon: Tag,
    path: "/content/schemes",
    tone: "amber",
  },
  {
    label: "Add Article",
    desc: "Add knowledge base article",
    icon: FileText,
    path: "/content/knowledge-base",
    tone: "blue",
  },
];

const activityTone = {
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

const quickTone = {
  red: "bg-red-50 text-red-500",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-500",
  blue: "bg-blue-50 text-blue-600",
};

export default function Dashboard() {
  const users = useSelector((state) => state.users);
  const navigate = useNavigate();

  // Dashboard reference values. Keep these independent from the small local seed
  // data used by the Users page so the dashboard matches the supplied design.
  const stats = {
    total: 1248,
    active: 1102,
    inactive: 98,
    unmapped: 48,
  };

  const pct = (value) => ((value / stats.total) * 100).toFixed(1);

  return (
    <AdminLayout title="Dashboard">
      <div className="w-full">
        {/* Top statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.total.toLocaleString()}
            description="All registered users"
            actionLabel="View all users"
            color="primary"
            onClick={() => navigate("/users")}
          />
          <StatCard
            icon={UserRound}
            label="Active Users"
            value={stats.active.toLocaleString()}
            description={`${pct(stats.active)}% of total users`}
            actionLabel="View active users"
            color="success"
            onClick={() => navigate("/users")}
          />
          <StatCard
            icon={UserMinus}
            label="Inactive Users"
            value={stats.inactive.toLocaleString()}
            description={`${pct(stats.inactive)}% of total users`}
            actionLabel="View inactive users"
            color="warning"
            onClick={() => navigate("/users")}
          />
          <StatCard
            icon={UserX}
            label="Unmapped Users"
            value={stats.unmapped.toLocaleString()}
            description={`${pct(stats.unmapped)}% of total users`}
            actionLabel="View unmapped users"
            color="purple"
            onClick={() => navigate("/users")}
          />
        </div>

        {/* Field Network Overview */}
        <section className="mt-5 rounded-xl border border-gray-200 bg-white px-5 py-5">
          <h2 className="text-sm font-semibold text-gray-900">Field Network Overview</h2>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-5">
            {fieldNetwork.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 px-3 ${
                    index !== 0 ? "border-l border-gray-100" : ""
                  } ${index === 4 ? "col-span-2 md:col-span-1" : ""}`}
                >
                  <Icon size={17} strokeWidth={2.1} className="shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[21px] font-bold leading-6 tracking-tight text-gray-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom dashboard panels */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Attention Required */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} strokeWidth={2.3} className="text-red-500" />
              <h2 className="text-sm font-semibold text-gray-900">Attention Required</h2>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex min-h-[108px] items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                    <UserRound size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-4 text-gray-900">
                      98 Inactive Users
                    </p>
                    <p className="mt-1 text-[10px] leading-3 text-gray-500">
                      Users currently inactive
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/users")}
                  className="shrink-0 rounded-md bg-white px-2.5 py-1.5 text-[10px] font-medium text-primary shadow-sm"
                >
                  View Users <ChevronRight size={10} className="inline" />
                </button>
              </div>

              <div className="flex min-h-[108px] items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <FilePlus2 size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-4 text-gray-900">
                      6 Draft Content Items
                    </p>
                    <p className="mt-1 text-[10px] leading-3 text-gray-500">
                      Content not...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/content")}
                  className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-500"
                >
                  Review Content
                </button>
              </div>

              <div className="flex min-h-[108px] items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-4 text-gray-900">
                      18 Draft Articles Items
                    </p>
                    <p className="mt-1 text-[10px] leading-3 text-gray-500">
                      Content not...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/content")}
                  className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-500"
                >
                  Review Content
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/users")}
              className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-4 text-xs font-medium text-primary"
            >
              View All Alerts <ChevronRight size={13} />
            </button>
          </section>

          {/* Recent Admin Activity */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <History size={17} strokeWidth={2.1} className="mt-0.5 text-gray-500" />
                <h2 className="text-sm font-semibold leading-5 text-gray-900">
                  Recent Admin
                  <br />
                  Activity
                </h2>
              </div>

              <button className="flex items-center gap-1 text-xs font-medium leading-4 text-primary">
                View All
                <br />
                Activity
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="mt-5 overflow-hidden">
              <div className="grid grid-cols-[1fr_86px] bg-gray-50 px-3 py-3 text-[11px] text-gray-500">
                <span>Activity</span>
                <span>Module</span>
              </div>

              <div>
                {recentActivity.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={`${item.action}-${item.module}`}
                      className="grid grid-cols-[1fr_86px] items-center border-b border-gray-100 px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activityTone[item.tone]}`}
                        >
                          <Icon size={13} />
                        </span>
                        <span className="truncate text-xs text-gray-700">{item.action}</span>
                      </div>
                      <span className="truncate text-[11px] text-gray-500">{item.module}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold leading-none text-gray-900">ϟ</span>
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex min-h-[61px] w-full items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${quickTone[item.tone]}`}
                    >
                      <Icon size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold leading-4 text-gray-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-4 text-gray-500">
                        {item.desc}
                      </span>
                    </span>

                    <ChevronRight size={15} className="shrink-0 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
