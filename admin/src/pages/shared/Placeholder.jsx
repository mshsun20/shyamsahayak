import { Construction } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

export default function Placeholder({ title }) {
  return (
    <AdminLayout title={title}>
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
          <Construction size={22} />
        </div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">Coming Soon</p>
      </div>
    </AdminLayout>
  );
}
