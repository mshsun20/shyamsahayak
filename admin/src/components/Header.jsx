import { Search, Bell, ChevronDown, LogOut, HelpCircle } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { showSnackbar } from "../redux/slices/snackbarSlice";

export default function Header({ title }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user } = useSelector(state => state.auth);
  const userName = String(user?.fullName)?.split(" ")?.map((s, i) => i<2 ? s.slice(0, 1) : "")?.join("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = React.useCallback(async () => {
    try {
      await dispatch(logout());
      await dispatch(showSnackbar({ message: "Logout successful", type: "info" }))
    } catch (error) {
      console.error(error.message);
      await dispatch(showSnackbar({ message: error.message, type: "error" }))
    }
  }, [])

  return (
    <header className="h-13.75 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <HelpCircle size={16} />
          Help
        </button>

        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={19} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-semibold text-xs flex items-center justify-center">
              {userName}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-gray-800">{String(user?.fullName).split(" ")?.map((s, i) => i<2 ? s : "")?.join(" ")}</p>
              <p className="text-[11px] text-gray-400 capitalize">{String(user?.privilege?.name)}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
