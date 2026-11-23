
import {
    LayoutGrid,
    Users,
    FileText,
    Database,
    Store,
    Globe,
    Navigation,
    Wrench,
    UserCircle,
    Shield,
    ClipboardList,
    LogOut,
    Settings,
    Scale,
    Zap,
    Package,
    Tags,
    BookOpen,
    MapPin,
    Building2,
    Weight,
    KeyRound,
    LockOpen,
    Layers,
    Activity,
    Map,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Field Visit Menu
|--------------------------------------------------------------------------
*/

const fieldVisitPaths = [
    { label: "Retailer + Profiler", path: "/retailer-profiler", icon: Store, level: 0 },
    { label: "Fabricator", path: "/fabricator", icon: Wrench, level: 0 },
];

/*
|--------------------------------------------------------------------------
| Content Management
|--------------------------------------------------------------------------
*/

const contentsPaths = [
    { label: "Products", path: "/content/products", icon: Package, level: 0 },
    { label: "Schemes", path: "/content/schemes", icon: Tags, level: 0 },
    { label: "Knowledge Base", path: "/content/knowledge-base", icon: BookOpen, level: 0 },
];

/*
|--------------------------------------------------------------------------
| Master Data
|--------------------------------------------------------------------------
*/

const masterDataPaths = [
    { label: "District Master", path: "/district-master", icon: MapPin, level: 0 },
    { label: "Store Type Breakup", path: "/store-type-breakup", icon: Store, level: 0 },
    { label: "Universe Master", path: "/universe-master", icon: Globe, level: 0 },
    // { label: "Field Visit Tracker", icon: Navigation, children: fieldVisitPaths, level: 0 },
    { label: "Product Weight Allocation", path: "/product-weight-allocation", icon: Scale, level: 0 },
];

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const configurationPaths = [
    { label: "Privilege Master", path: "/privilege-master", icon: Shield, level: 0 },
    { label: "Role Master", path: "/role-master", icon: Users, level: 0 },
    { label: "Permission Master", path: "/permission-master", icon: LockOpen, level: 0 },
    { label: "Thickness Master", path: "/thickness-master", icon: Layers, level: 0 },
    { label: "Metric Master", path: "/metric-master", icon: Activity, level: 0 },
    { label: "KB Category Master", path: "/kb-category-master", icon: BookOpen, level: 1 },
    { label: "API Client Master", path: "/api-client-master", icon: KeyRound, level: 1 },
];

/*
|--------------------------------------------------------------------------
| Activities
|--------------------------------------------------------------------------
*/

const activitiesPaths = [
    { label: "Field Visit Tracker", icon: Navigation, children: fieldVisitPaths, level: 0 },
    { label: "Visit", path: "/visits", icon: ClipboardList, level: 0 },
];

/*
|--------------------------------------------------------------------------
| Main Menu Tree
|--------------------------------------------------------------------------
*/

export const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid, level: 0 },
    { label: "User & Mapping", path: "/users", icon: Users, level: 0 },
    { label: "Content Management", path: "/content", icon: FileText, children: contentsPaths, level: 0 },
    { label: "Master Data", icon: Database, children: masterDataPaths, level: 0 },
    { label: "Profile", path: "/profile", icon: UserCircle, level: 0 },
    { label: "Configuration", icon: Settings, children: configurationPaths, level: 0 },
    { label: "Activities", icon: Zap, children: activitiesPaths, level: 0 },
    { label: "Logout", icon: LogOut, action: "logout", level: 0 },
];

/*
|--------------------------------------------------------------------------
| Privilege Helpers
|--------------------------------------------------------------------------
*/

/**
 * Get the authenticated user's privilege hierarchy.
 *
 * Supports both:
 *   privilege.heirarchy
 *   privilege.hierarchy
 *
 * Returns null when privilege information is unavailable.
 */
export const getUserPrivilegeHierarchy = (user) => {
    const privilege =
        user?.privilege ??
        user?.account?.privilege ??
        null;

    const hierarchy =
        privilege?.heirarchy ??
        privilege?.hierarchy ??
        user?.privilegeHierarchy ??
        null;

    if (
        hierarchy === null ||
        hierarchy === undefined ||
        hierarchy === ""
    ) {
        return null;
    }

    const parsedHierarchy = Number(hierarchy);

    return Number.isFinite(parsedHierarchy) && parsedHierarchy > 0
        ? parsedHierarchy
        : null;
};

/**
 * Check whether a user can access a menu item.
 *
 * level = 0: Accessible to everyone.
 * level > 0: User hierarchy must be <= menu level.
 */
export const hasPrivilegeAccess = (userHierarchy, menuLevel = 0) => {
    const requiredLevel = Number(menuLevel ?? 0);

    if (!Number.isFinite(requiredLevel) || requiredLevel < 0) {
        return false;
    }

    if (requiredLevel === 0) {
        return true;
    }

    if (
        userHierarchy === null ||
        userHierarchy === undefined
    ) {
        return false;
    }

    return Number(userHierarchy) <= requiredLevel;
};

/**
 * Recursively filter the menu tree based on user privilege.
 */
export const filterMenuItems = (items, userHierarchy) => {
    return items.reduce((filteredItems, item) => {
        if (!hasPrivilegeAccess(userHierarchy, item.level)) {
            return filteredItems;
        }

        const filteredChildren = item.children
            ? filterMenuItems(item.children, userHierarchy)
            : [];

        // A parent without a route and without accessible children
        // should not appear in the sidebar.
        if (
            item.children &&
            filteredChildren.length === 0 &&
            !item.path
        ) {
            return filteredItems;
        }

        filteredItems.push({
            ...item,
            children: item.children ? filteredChildren : undefined,
        });

        return filteredItems;
    }, []);
};
