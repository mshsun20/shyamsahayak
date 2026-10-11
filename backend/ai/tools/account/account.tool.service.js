
import mongoose from "mongoose";

import {
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
} from "../../../services/account.service.js";

// Ensure referenced Mongoose models are registered for populate().
import "../../../models/role.model.js";
import "../../../models/privilege.model.js";
import "../../../models/permission.model.js";

const PAGE_SIZE = 200;
const MAX_SCAN = 5000;
const MAX_RESULTS = 25;

const normalize = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim().toLowerCase();
};

const idOf = (value) => {
    if (value === null || value === undefined) return null;

    const id = value?._id ?? value;
    return id === null || id === undefined ? null : String(id);
};

const textMatches = (value, term) => {
    if (!term) return true;
    return normalize(value).includes(normalize(term));
};

const matchesAccountSearch = (account, search) => {
    if (!search) return true;

    const fields = [
        account.userId,
        account.fullName,
        account.email,
        account.phone,
        account.username,
        account.employeeId,
        account.status,
        account.role?.name,
        account.role?.code,
        account.privilege?.name,
        account.privilege?.description,
        ...((account.reportingDetails || []).flatMap((item) => [
            item.territory,
            item.district,
            item.reportingManager?.fullName,
            item.reportingManager?.userId,
        ])),
    ];

    return fields.some((value) => textMatches(value, search));
};

const getPermissionEntries = (account) => {
    const entries = [];

    for (const permission of account.permissions || []) {
        if (permission && typeof permission === "object") {
            entries.push({ permission, source: "direct" });
        }
    }

    if (account.role && typeof account.role === "object") {
        for (const permission of account.role.permissions || []) {
            if (permission && typeof permission === "object") {
                entries.push({ permission, source: "role" });
            }
        }
    }

    if (account.privilege && typeof account.privilege === "object") {
        for (const permission of account.privilege.permissions || []) {
            if (permission && typeof permission === "object") {
                entries.push({ permission, source: "privilege" });
            }
        }
    }

    return entries;
};

const permissionIsEffective = (account, entry) => {
    if (account.status !== "Active") return false;
    if (entry.permission.status !== "Active") return false;

    if (entry.source === "role" && account.role?.status !== "Active") {
        return false;
    }

    if (
        entry.source === "privilege" &&
        account.privilege?.status !== "Active"
    ) {
        return false;
    }

    return true;
};

const permissionMatches = (
    permission,
    { permission: term, module, action } = {}
) => {
    if (term) {
        const fields = [
            permission.code,
            permission.name,
            permission.module,
            permission.action,
            permission.description,
        ];

        if (!fields.some((value) => textMatches(value, term))) {
            return false;
        }
    }

    if (module && !textMatches(permission.module, module)) {
        return false;
    }

    if (action && !textMatches(permission.action, action)) {
        return false;
    }

    return true;
};

const getEffectivePermissions = (account) => {
    const unique = new Map();

    for (const entry of getPermissionEntries(account)) {
        if (!permissionIsEffective(account, entry)) continue;

        const permission = entry.permission;
        const key = normalize(permission.code || idOf(permission));

        if (!key) continue;

        if (!unique.has(key)) {
            unique.set(key, {
                id: idOf(permission),
                code: permission.code ?? null,
                name: permission.name ?? null,
                module: permission.module ?? null,
                action: permission.action ?? null,
                status: permission.status ?? null,
                sources: [],
            });
        }

        const result = unique.get(key);

        if (!result.sources.includes(entry.source)) {
            result.sources.push(entry.source);
        }
    }

    return [...unique.values()];
};

const sanitizeAccount = (account) => {
    const reportingDetails = (account.reportingDetails || []).map((item) => ({
        reportingManager: item.reportingManager
            ? {
                id: idOf(item.reportingManager),
                userId: item.reportingManager.userId ?? null,
                fullName: item.reportingManager.fullName ?? null,
            }
            : null,
        territory: item.territory ?? null,
        district: item.district ?? null,
    }));

    return {
        id: idOf(account),
        userId: account.userId ?? null,
        fullName: account.fullName ?? null,
        email: account.email ?? null,
        phone: account.phone ?? null,
        username: account.username ?? null,
        employeeId: account.employeeId ?? null,
        status: account.status ?? null,

        role: account.role
            ? {
                id: idOf(account.role),
                code: account.role.code ?? null,
                name: account.role.name ?? null,
                status: account.role.status ?? null,
            }
            : null,

        privilege: account.privilege
            ? {
                id: idOf(account.privilege),
                name: account.privilege.name ?? null,
                hierarchy: account.privilege.heirarchy ?? null,
                status: account.privilege.status ?? null,
            }
            : null,

        reportingDetails,
        effectivePermissions: getEffectivePermissions(account),
        createdAt: account.createdAt ?? null,
        updatedAt: account.updatedAt ?? null,
    };
};

const matchesAccount = (account, filters) => {
    const {
        search = "",
        role = "",
        privilege = "",
        permission = "",
        excludePermission = "",
        module = "",
        action = "",
        status = "",
    } = filters;

    if (!matchesAccountSearch(account, search)) return false;

    if (
        role &&
        ![account.role?.name, account.role?.code].some(
            (value) => textMatches(value, role)
        )
    ) {
        return false;
    }

    if (
        privilege &&
        ![
            account.privilege?.name,
            account.privilege?.description,
            account.privilege?.heirarchy,
        ].some((value) => textMatches(value, privilege))
    ) {
        return false;
    }

    if (status && normalize(account.status) !== normalize(status)) {
        return false;
    }

    const effectivePermissions = getEffectivePermissions(account);

    if (
        permission &&
        !effectivePermissions.some((item) =>
            permissionMatches(item, { permission, module, action })
        )
    ) {
        return false;
    }

    if (
        !permission &&
        (module || action) &&
        !effectivePermissions.some((item) =>
            permissionMatches(item, { module, action })
        )
    ) {
        return false;
    }

    if (
        excludePermission &&
        effectivePermissions.some((item) =>
            permissionMatches(item, {
                permission: excludePermission,
            })
        )
    ) {
        return false;
    }

    return true;
};

/**
 * Read-only Account lookup.
 *
 * Exact userId and ID lookups use existing service functions.
 * General queries scan existing paginated service results and
 * filter populated Role, Privilege, and Permission data.
 */
export const getAccounts = async ({
    id = "",
    userId = "",
    search = "",
    role = "",
    privilege = "",
    permission = "",
    excludePermission = "",
    module = "",
    action = "",
    status = "",
    limit = 10,
} = {}) => {
    const safeLimit = Math.min(
        Math.max(
            Number.isFinite(Number(limit))
                ? Math.floor(Number(limit))
                : 10,
            1
        ),
        MAX_RESULTS
    );

    const normalizedId = String(id || "").trim();
    const normalizedUserId = String(userId || "").trim();

    if (normalizedId && normalizedUserId) {
        throw new Error("Provide either Account ID or userId, not both.");
    }

    if (normalizedId) {
        if (!mongoose.isValidObjectId(normalizedId)) {
            throw new Error("Invalid Account ID.");
        }

        const account = await readByIdFunction(normalizedId);

        return {
            count: account ? 1 : 0,
            accounts: account ? [sanitizeAccount(account)] : [],
            scan: { truncated: false },
        };
    }

    if (normalizedUserId) {
        const account = await readByUniqueKeyFunction(normalizedUserId);

        return {
            count: account ? 1 : 0,
            accounts: account ? [sanitizeAccount(account)] : [],
            scan: { truncated: false },
        };
    }

    const filters = {
        search,
        role,
        privilege,
        permission,
        excludePermission,
        module,
        action,
        status,
    };

    const matched = [];
    let scanned = 0;
    let total = 0;
    let page = 1;

    while (scanned < MAX_SCAN) {
        const result = await readFunction({}, {
            page,
            limit: PAGE_SIZE,
        });

        const accounts = result.accounts || [];
        total = result.pagination?.total ?? accounts.length;

        if (accounts.length === 0) break;

        scanned += accounts.length;

        for (const account of accounts) {
            if (matchesAccount(account, filters)) {
                matched.push(account);
            }
        }

        const totalPages = result.pagination?.totalPages ?? page;

        if (page >= totalPages || scanned >= total) break;

        page += 1;
    }

    const truncated = scanned < total;
    const output = matched.slice(0, safeLimit);

    return {
        count: output.length,
        accounts: output.map(sanitizeAccount),
        scan: {
            scannedRecords: scanned,
            totalRecords: total,
            truncated,
            resultLimit: safeLimit,
        },
    };
};

export default { getAccounts };
