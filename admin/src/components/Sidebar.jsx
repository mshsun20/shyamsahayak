import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  Database,
  ChevronDown,
  MapPin,
  Store,
  Globe,
  Navigation,
  Store as StoreIcon,
  Wrench,
  UserCircle,
  Shield,
} from "lucide-react";
import Logo from "./Logo";

const navItemBase =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
const navItemInactive = "text-gray-600 hover:bg-gray-100";
const navItemActive = "bg-primary-light text-primary";

function NavItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const masterDataPaths = ["/district-master", "/store-type-breakup", "/universe-master"];
  const fieldVisitPaths = ["/retailer-profiler", "/fabricator"];

  const [masterDataOpen, setMasterDataOpen] = useState(
    masterDataPaths.includes(location.pathname)
  );
  const [fieldVisitOpen, setFieldVisitOpen] = useState(
    fieldVisitPaths.includes(location.pathname)
  );

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <Logo className="h-9 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" />
        <NavItem to="/users" icon={Users} label="Users & Mapping" />
        <NavItem to="/content" icon={FileText} label="Content Management" />

        <div>
          <button
            onClick={() => setMasterDataOpen((v) => !v)}
            className={`${navItemBase} ${navItemInactive} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <Database size={18} />
              Master Data
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${masterDataOpen ? "rotate-180" : ""}`}
            />
          </button>
          {masterDataOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
              <NavLink
                to="/district-master"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <MapPin size={15} />
                District Master
              </NavLink>
              <NavLink
                to="/store-type-breakup"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <Store size={15} />
                Store Type Breakup
              </NavLink>
              <NavLink
                to="/universe-master"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <Globe size={15} />
                Universe Master
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setFieldVisitOpen((v) => !v)}
            className={`${navItemBase} ${navItemInactive} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <Navigation size={18} />
              Field Visit Tracker
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${fieldVisitOpen ? "rotate-180" : ""}`}
            />
          </button>
          {fieldVisitOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
              <NavLink
                to="/retailer-profiler"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <StoreIcon size={15} />
                Retailer + Profiler
              </NavLink>
              <NavLink
                to="/fabricator"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <Wrench size={15} />
                Fabricator
              </NavLink>
            </div>
          )}
        </div>

        <NavItem to="/profile" icon={UserCircle} label="Profile" />
      </nav>

      <div className="p-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
            <Shield size={14} className="text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-800">Admin Portal</p>
            <p className="text-[11px] text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
