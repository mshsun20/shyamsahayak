import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  Pencil,
  IdCard,
  UserCircle2,
  Phone,
  Calendar,
  Mail,
  Clock,
  CircleDot,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Modal from "../../components/Modal";
// import { updateProfile, changePin } from "../../redux/store";
import { activityLog } from "../../data/profile";

const PAGE_SIZE = 5;

function InfoRow({ icon: Icon, label, value, valueNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        {valueNode || <p className="text-sm font-medium text-gray-800">{value}</p>}
      </div>
    </div>
  );
}

export default function Profile() {
  const profile = [];
  const dispatch = useDispatch();

  const [editOpen, setEditOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [pinError, setPinError] = useState("");
  const [page, setPage] = useState(1);

  const editForm = useForm({
    defaultValues: { fullName: profile.fullName, email: profile.email, mobile: profile.mobile },
  });
  const pinForm = useForm({ defaultValues: { currentPin: "", newPin: "", confirmPin: "" } });

  const totalPages = Math.ceil(activityLog.length / PAGE_SIZE);
  const pagedActivity = useMemo(
    () => activityLog.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page]
  );

  const openEdit = () => {
    editForm.reset({ fullName: profile.fullName, email: profile.email, mobile: profile.mobile });
    setEditOpen(true);
  };

  const onSaveProfile = (data) => {
    // dispatch(updateProfile(data));
    setEditOpen(false);
  };

  const openPinModal = () => {
    setPinError("");
    pinForm.reset({ currentPin: "", newPin: "", confirmPin: "" });
    setPinOpen(true);
  };

  const onChangePin = (data) => {
    if (data.currentPin !== profile.pin) {
      setPinError("Current PIN is incorrect.");
      return;
    }
    if (!/^\d{4}$/.test(data.newPin)) {
      setPinError("New PIN must be exactly 4 digits.");
      return;
    }
    if (data.newPin !== data.confirmPin) {
      setPinError("New PIN and confirmation do not match.");
      return;
    }
    // dispatch(changePin(data.newPin));
    setPinOpen(false);
  };

  return (
    <AdminLayout title="Profile">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
        <span>Home</span>
        <ChevronRight size={12} />
        <span>Profile</span>
        <ChevronRight size={12} />
        <span className="text-gray-600">My Profile</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
      <p className="text-sm text-gray-400 mt-0.5 mb-4">
        View and manage your personal information, account security and recent account activities.
      </p>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-6 relative">
        <button
          onClick={openEdit}
          className="absolute top-5 right-5 flex items-center gap-1.5 text-xs font-medium text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primary-light"
        >
          <Pencil size={12} />
          Edit Profile
        </button>

        <div className="flex flex-col items-center gap-2 sm:w-40 shrink-0">
          <div className="w-16 h-16 rounded-full bg-primary-light text-primary font-bold text-xl flex items-center justify-center">
            AU
          </div>
          <p className="text-sm font-semibold text-gray-800 text-center">{profile.fullName}</p>
          <span className="px-2.5 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">{profile.role}</span>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <p className="sm:col-span-2 text-sm font-semibold text-gray-800 -mb-1">Personal Information</p>
          <InfoRow icon={IdCard} label="Employee ID" value={profile.employeeId} />
          <InfoRow icon={Phone} label="Mobile Number" value={profile.mobile} />
          <InfoRow icon={UserCircle2} label="Full Name" value={profile.fullName} />
          <InfoRow icon={Calendar} label="Date of Joining" value={profile.dateOfJoining} />
          <InfoRow icon={UserCircle2} label="Role" value={profile.role} />
          <InfoRow icon={Clock} label="Last Login" value={profile.lastLogin} />
          <InfoRow icon={Mail} label="Email Address" value={profile.email} />
          <InfoRow
            icon={CircleDot}
            label="Status"
            valueNode={
              <span className="inline-flex px-2 py-0.5 bg-green-50 text-success text-xs font-medium rounded-full mt-0.5">
                {profile.status}
              </span>
            }
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
        <p className="text-sm font-semibold text-gray-800">Security</p>
        <p className="text-xs text-gray-400 mb-4">Manage your account security.</p>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <ShieldCheck size={16} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Change PIN</p>
              <p className="text-xs text-gray-400">Update your 4-digit PIN regularly for better security.</p>
            </div>
          </div>
          <button
            onClick={openPinModal}
            className="text-sm font-medium text-primary border border-primary rounded-lg px-3.5 py-1.5 hover:bg-primary-light shrink-0"
          >
            Change PIN
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Last PIN Changed
          <br />
          <span className="text-sm text-gray-700 font-medium">{profile.lastPinChanged}</span>
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 mt-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Recent Activity (Activity Log)</p>
          <p className="text-xs text-gray-400">Your latest account activities.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold">Activity</th>
                <th className="px-5 py-3 font-semibold">Module</th>
                <th className="px-5 py-3 font-semibold">Details</th>
                <th className="px-5 py-3 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedActivity.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{a.dateTime}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{a.activity}</td>
                  <td className="px-5 py-3 text-gray-600">{a.module}</td>
                  <td className="px-5 py-3 text-gray-600">{a.details}</td>
                  <td className="px-5 py-3 text-gray-500">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, activityLog.length)} of {activityLog.length} activities
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-medium ${
                  p === page ? "bg-primary text-white" : "text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <Modal
          title="Edit Profile"
          onClose={() => setEditOpen(false)}
          footer={
            <>
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editForm.handleSubmit(onSaveProfile)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
              >
                Save Changes
              </button>
            </>
          }
        >
          <form className="space-y-3" onSubmit={editForm.handleSubmit(onSaveProfile)}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                {...editForm.register("fullName", { required: true })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                {...editForm.register("email", { required: true })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Mobile Number</label>
              <input
                {...editForm.register("mobile", { required: true })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {pinOpen && (
        <Modal
          title="Change PIN"
          onClose={() => setPinOpen(false)}
          footer={
            <>
              <button
                onClick={() => setPinOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={pinForm.handleSubmit(onChangePin)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
              >
                Change PIN
              </button>
            </>
          }
        >
          <p className="text-xs text-gray-400 mb-4">Update your 4-digit PIN regularly for better security.</p>
          <form className="space-y-3" onSubmit={pinForm.handleSubmit(onChangePin)}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Current PIN *</label>
              <div className="relative">
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  {...pinForm.register("currentPin", { required: true })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPins((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPins ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">New PIN *</label>
              <input
                type={showPins ? "text" : "password"}
                maxLength={4}
                {...pinForm.register("newPin", { required: true })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-[11px] text-gray-400 mt-1">4-digit PIN</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm New PIN *</label>
              <input
                type={showPins ? "text" : "password"}
                maxLength={4}
                {...pinForm.register("confirmPin", { required: true })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {pinError && <p className="text-xs text-danger">{pinError}</p>}
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
