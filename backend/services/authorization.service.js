export const getEffectivePermissions = (account) => {
    const permissions = [
        ...(account.permissions || []),
        ...(account.role?.permissions || []),
        ...(account.privilege?.permissions || []),
    ];

    return [
        ...new Set(
            permissions.map((permission) => permission.code)
        ),
    ];
};