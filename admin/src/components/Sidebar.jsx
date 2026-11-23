
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Shield } from "lucide-react";

import Logo from "./Logo";
import { logout } from "../redux/slices/authSlice";

import {
  menuItems,
  getUserPrivilegeHierarchy,
  filterMenuItems,
} from "../data/menuItems";

// Update this import path according to your folder structure.

const navItemBase =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";

const navItemInactive =
  "text-gray-600 hover:bg-gray-100";

const navItemActive =
  "bg-primary-light text-primary";

const subLinkBase =
  "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors";

const subLinkInactive =
  "text-gray-500 hover:text-gray-800 hover:bg-gray-50";

const subLinkActive =
  "text-primary font-medium bg-primary-light";

const configLinkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors";

const configLinkActive =
  "bg-primary-light text-primary font-medium";

const configLinkInactive =
  "text-gray-500 hover:text-gray-800 hover:bg-gray-50";

/*
|--------------------------------------------------------------------------
| Route Matching
|--------------------------------------------------------------------------
*/

const isPathActive = (path, currentPath) => {
  if (!path) return false;

  return (
    currentPath === path ||
    currentPath.startsWith(`${path}/`)
  );
};

/*
|--------------------------------------------------------------------------
| Recursive Active Menu Detection
|--------------------------------------------------------------------------
*/

const isMenuItemActive = (item, currentPath) => {
  if (item.path && isPathActive(item.path, currentPath)) {
    return true;
  }

  if (item.children?.length) {
    return item.children.some((child) =>
      isMenuItemActive(child, currentPath)
    );
  }

  return false;
};

/*
|--------------------------------------------------------------------------
| Dynamic Menu Item Component
|--------------------------------------------------------------------------
*/

function MenuTreeItem({
  item,
  level = 0,
  location,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = Boolean(
    item.children?.length
  );

  const isActive = isMenuItemActive(
    item,
    location.pathname
  );

  const Icon = item.icon;

  // Automatically expand parent menus when a child route is active.
  useEffect(() => {
    if (isActive && hasChildren) {
      setIsOpen(true);
    }
  }, [isActive, hasChildren]);

  /*
  |--------------------------------------------------------------------------
  | Logout Menu Item
  |--------------------------------------------------------------------------
  */

  if (item.action === "logout") {
    return (
      <button
        type="button"
        onClick={onLogout}
        className={`${navItemBase} ${navItemInactive} w-full text-left`}
      >
        {Icon && <Icon size={18} />}
        <span>{item.label}</span>
      </button>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Menu Styling Based on Nesting Level
  |--------------------------------------------------------------------------
  */

  const menuClass =
    level === 0
      ? `${navItemBase} ${
          isActive ? navItemActive : navItemInactive
        }`
      : `${subLinkBase} ${
          isActive ? subLinkActive : subLinkInactive
        }`;

  const iconSize =
    level === 0 ? 18 : level === 1 ? 15 : 14;

  /*
  |--------------------------------------------------------------------------
  | Menu With Children
  |--------------------------------------------------------------------------
  */

  if (hasChildren) {
    return (
      <div>
        <div className="flex items-center gap-1">
          {item.path ? (
            <NavLink
              to={item.path}
              className={`${menuClass} flex-1 min-w-0`}
            >
              {Icon && <Icon size={iconSize} />}
              <span className="flex-1 truncate">
                {item.label}
              </span>
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() =>
                setIsOpen((previous) => !previous)
              }
              className={`${menuClass} flex-1 w-full justify-between`}
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 min-w-0">
                {Icon && <Icon size={iconSize} />}
                <span className="truncate">
                  {item.label}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {item.path && (
            <button
              type="button"
              onClick={() =>
                setIsOpen((previous) => !previous)
              }
              className={`p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary hover:bg-primary-light"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label={`Toggle ${item.label} submenu`}
              aria-expanded={isOpen}
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {isOpen && (
          <div
            className={`${
              level === 0
                ? "ml-4 mt-1 border-l border-gray-100 pl-3"
                : "ml-4 mt-1 border-l border-gray-100 pl-3"
            } space-y-1`}
          >
            {item.children.map((child, index) => (
              <MenuTreeItem
                key={`${child.path || child.label}-${index}`}
                item={child}
                level={level + 1}
                location={location}
                onLogout={onLogout}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normal Menu Item Without Children
  |--------------------------------------------------------------------------
  */

  if (!item.path) {
    return null;
  }

  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive: routeActive }) => {
        const active = routeActive || isActive;

        if (level === 0) {
          return `${navItemBase} ${
            active ? navItemActive : navItemInactive
          }`;
        }

        if (level === 1) {
          return `${subLinkBase} ${
            active ? subLinkActive : subLinkInactive
          }`;
        }

        return `${configLinkBase} ${
          active
            ? configLinkActive
            : configLinkInactive
        }`;
      }}
    >
      {Icon && <Icon size={iconSize} />}
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

/*
|--------------------------------------------------------------------------
| Main Sidebar Component
|--------------------------------------------------------------------------
*/

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /*
   * Adjust this selector if your authSlice stores the
   * authenticated user under a different property.
   */
  const user = useSelector(
    (state) =>
      state.auth?.user ??
      state.auth?.account ??
      state.auth?.userDtl ??
      null
  );

  /*
  |--------------------------------------------------------------------------
  | User Privilege
  |--------------------------------------------------------------------------
  */

  const userHierarchy = useMemo(
    () => getUserPrivilegeHierarchy(user),
    [user]
  );

  /*
  |--------------------------------------------------------------------------
  | Filter Menu Based on Privilege
  |--------------------------------------------------------------------------
  */

  const accessibleMenuItems = useMemo(
    () => filterMenuItems(menuItems, userHierarchy),
    [userHierarchy]
  );

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <aside className="w-70 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Logo className="h-9 w-auto" />
      </div>

      {/* Dynamic Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">

        {accessibleMenuItems.map((item, index) => (
          <MenuTreeItem
            key={`${item.path || item.label}-${index}`}
            item={item}
            level={0}
            location={location}
            onLogout={handleLogout}
          />
        ))}

      </nav>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">

          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
            <Shield
              size={14}
              className="text-primary"
            />
          </div>

          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-800">
              Admin Portal
            </p>

            <p className="text-[11px] text-gray-400">
              Version 1.0.0
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
}
