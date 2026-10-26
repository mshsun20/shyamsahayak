import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutGrid,
  Users,
  FileText,
  Database,
  ChevronDown,
  Store,
  Globe,
  Navigation,
  Store as StoreIcon,
  Wrench,
  UserCircle,
  Shield,
  ClipboardList,
  LogOut,
  Settings,
  Scale,
  Zap,
} from "lucide-react";
import Logo from "./Logo";
import { logout } from "../redux/slices/authSlice"

const navItemBase =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
const navItemInactive = "text-gray-600 hover:bg-gray-100";
const navItemActive = "bg-primary-light text-primary";

const subLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
    isActive ? "text-primary font-medium" : "text-gray-500 hover:text-gray-800"
  }`;

const configLinkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg text-sm ${
    isActive ? "bg-primary-light text-primary font-medium" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
  }`;

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

// Sub-link that shows a small dot marker instead of an icon when active,
// matching the Content Management sub-menu in the reference screenshots.
function DotSubLink({ to, label }) {
  return (
    <NavLink to={to} className={subLinkClass}>
      {({ isActive }) => (
        <>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isActive ? "bg-primary" : "bg-transparent"
            }`}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const contentPaths = ["/content/products", "/content/schemes", "/content/knowledge-base"];
  const masterDataPaths = [
    "/district-master",
    "/store-type-breakup",
    "/universe-master",
    "/retailer-profiler",
    "/fabricator",
    "/product-weight-allocation",
  ];
  const fieldVisitPaths = ["/retailer-profiler", "/fabricator"];
  const configurationPaths = ["/privilege-master", "/role-master", "/permission-master", "/thickness-master", "/metric-master"];

  const isContentActive =
    location.pathname === "/content" ||
    contentPaths.some((p) => location.pathname.startsWith(p));
  const isMasterDataActive = masterDataPaths.some((p) => location.pathname.startsWith(p));

  const isConfigurationActive = configurationPaths.some((p) => location.pathname.startsWith(p));
  const [configurationOpen, setConfigurationOpen] = useState(isConfigurationActive);
  const activitiesPaths = ["/field-visit-tracker", "/visits"];
  const isActivitiesActive = activitiesPaths.some((p) => location.pathname.startsWith(p));
  const [activitiesOpen, setActivitiesOpen] = useState(isActivitiesActive);
  const [contentOpen, setContentOpen] = useState(isContentActive);
  const [masterDataOpen, setMasterDataOpen] = useState(isMasterDataActive);
  const [fieldVisitOpen, setFieldVisitOpen] = useState(
    fieldVisitPaths.includes(location.pathname)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-[280px] shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <Logo className="h-9 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" />
        <NavItem to="/users" icon={Users} label="Users & Mapping" />

        <div>
          <NavLink
            to="/content"
            className={`${navItemBase} ${isContentActive ? navItemActive : navItemInactive} w-full flex items-center justify-between`}
          >
            <span className="flex items-center gap-3">
              <FileText size={18} />
              Content Management
            </span>
            <ChevronDown
              size={16}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContentOpen((v) => !v);
              }}
              className={`transition-transform ${contentOpen ? "rotate-180" : "-rotate-90"}`}
            />
          </NavLink>
          {contentOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
              <DotSubLink to="/content/products" label="Products" />
              <DotSubLink to="/content/schemes" label="Schemes" />
              <DotSubLink to="/content/knowledge-base" label="Knowledge Base" />
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setMasterDataOpen((v) => !v)}
            className={`${navItemBase} ${isMasterDataActive ? navItemActive : navItemInactive} w-full justify-between`}
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
              <NavLink to="/store-type-breakup" className={subLinkClass}>
                <Store size={15} />
                Store Type Breakup
              </NavLink>
              <NavLink to="/universe-master" className={subLinkClass}>
                <Globe size={15} />
                Universe Master
              </NavLink>

              <div>
                <button
                  onClick={() => setFieldVisitOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-500 hover:text-gray-800 w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Navigation size={15} />
                    Field Visit Tracker
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${fieldVisitOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {fieldVisitOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
                    <NavLink to="/retailer-profiler" className={subLinkClass}>
                      <StoreIcon size={14} />
                      Retailer + Profiler
                    </NavLink>
                    <NavLink to="/fabricator" className={subLinkClass}>
                      <Wrench size={14} />
                      Fabricator
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink to="/district-master" className={subLinkClass}>
                <ClipboardList size={15} />
                District Master
              </NavLink>
              <NavLink to="/product-weight-allocation" className={subLinkClass}>
                <Scale size={15} />
                Product Weight Allocation
              </NavLink>
            </div>
          )}
        </div>

        <NavItem to="/profile" icon={UserCircle} label="Profile" />

        <div>
          <button
            onClick={() => setConfigurationOpen((v) => !v)}
            className={`${navItemBase} ${isConfigurationActive ? "text-primary font-semibold hover:bg-gray-100" : navItemInactive} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Configuration
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${configurationOpen ? "rotate-180" : ""}`}
            />
          </button>
          {configurationOpen && (
            <div className="mt-1 space-y-1 pl-2">
              <NavLink to="/privilege-master" className={configLinkClass}>
                Privilege Master
              </NavLink>
              <NavLink to="/role-master" className={configLinkClass}>
                Role Master
              </NavLink>
              <NavLink to="/permission-master" className={configLinkClass}>
                Permission Master
              </NavLink>
              <NavLink to="/thickness-master" className={configLinkClass}>
                Thickness Master
              </NavLink>
              <NavLink to="/metric-master" className={configLinkClass}>
                Metric Master
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setActivitiesOpen((v) => !v)}
            className={`${navItemBase} ${isActivitiesActive ? "text-primary font-semibold hover:bg-gray-100" : navItemInactive} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <Zap size={18} />
              Activities
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${activitiesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {activitiesOpen && (
            <div className="mt-1 space-y-1 pl-2">
              <NavLink to="/field-visit-tracker" className={configLinkClass}>
                Field Visit Tracker
              </NavLink>
              <NavLink to="/visits" className={configLinkClass}>
                Visit
              </NavLink>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`${navItemBase} ${navItemInactive} w-full text-left`}
        >
          <LogOut size={18} />
          Logout
        </button>
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
