import { useSelector } from "react-redux";
import { ShieldCheck } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";

export default function Profile() {
  const currentUser = useSelector((state) => state.auth.currentUser);

  return (
    <AdminLayout title="Profile">
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-light text-primary font-semibold flex items-center justify-center text-lg">
            AK
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{currentUser?.name || "Admin User"}</p>
            <p className="text-sm text-gray-400">{currentUser?.role || "Super Admin"}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-400">User ID</span>
            <span className="text-gray-800 font-medium">{currentUser?.userId || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-400">Role</span>
            <span className="text-gray-800 font-medium">{currentUser?.role || "Super Admin"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs pt-2">
            <ShieldCheck size={13} />
            Secure access. All activities are monitored and logged.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
