import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Pencil, ArrowLeft } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge } from "./privilegeUtils";

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-32 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="text-sm font-medium text-gray-900 min-w-0">{children}</div>
    </div>
  );
}

export default function PrivilegeDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [privilege, setPrivilege] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/privileges/${id}`);
      const data = response?.data?.data;
      setPrivilege(data || null);

      const assigned = data?.permissions || [];
      const needsLookup = assigned.some((p) => typeof p !== "object");
      if (needsLookup) {
        // permissions came back as ids – resolve names/descriptions from Permission Master
        try {
          const permRes = await axiosInstance.get(`/permissions`);
          const permData = permRes?.data?.data;
          const all = Array.isArray(permData) ? permData : permData?.permissions || [];
          setPermissions(
            assigned.map((p) => {
              const pid = typeof p === "object" ? p._id : p;
              return all.find((x) => x._id === pid) || { _id: pid, name: pid, description: "" };
            })
          );
        } catch {
          setPermissions(assigned.map((p) => (typeof p === "object" ? p : { _id: p, name: p, description: "" })));
        }
      } else {
        setPermissions(assigned);
      }
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <Link to="/privilege-master" className="hover:text-primary">Privilege Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Privilege Details</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Privilege Details</h2>
          <p className="text-xs text-gray-500 mt-1">View complete information about the selected privilege.</p>
        </div>
        <button
          onClick={() => navigate(`/privilege-master/edit/${id}`)}
          className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {privilege && (
        <div className="space-y-5 mt-4">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Basic Information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5 px-7 py-6">
              <div className="space-y-5">
                <InfoRow label="Name">{privilege.name}</InfoRow>
                <InfoRow label="Hierarchy">{privilege.hierarchy}</InfoRow>
                <InfoRow label="Same Level">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {privilege.sameLevel ? "Yes" : "No"}
                  </span>
                </InfoRow>
                <InfoRow label="Description">{privilege.description || "-"}</InfoRow>
              </div>
              <div className="space-y-5">
                <InfoRow label="Status">
                  <PrivilegeStatusBadge status={privilege.status} />
                </InfoRow>
                <InfoRow label="Created On">{formatDate(privilege.createdAt, true)}</InfoRow>
                <InfoRow label="Last Updated">{formatDate(privilege.updatedAt, true)}</InfoRow>
              </div>
            </div>
          </div>

          {/* Assigned Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">Assigned Permissions</p>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700">
                {permissions.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-700 border-b border-gray-100">
                    <th className="px-7 py-3 font-semibold w-20">#</th>
                    <th className="px-4 py-3 font-semibold w-1/3">Permission Name</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {permissions.map((permission, index) => (
                    <tr key={permission._id || index}>
                      <td className="px-7 py-3.5 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-900">{permission.name}</td>
                      <td className="px-4 py-3.5 text-gray-600">{permission.description || "-"}</td>
                    </tr>
                  ))}
                  {permissions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                        No permissions assigned to this privilege.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!privilege && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400 mt-4">
          Privilege not found.
        </div>
      )}

      <button
        onClick={() => navigate("/privilege-master")}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <ArrowLeft size={15} />
        Back to List
      </button>
    </AdminLayout>
  );
}
