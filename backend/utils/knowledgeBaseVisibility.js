const normalizeVisibility = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

export const isPublicKnowledgeBaseVisibility = (value) => {
    const normalized = normalizeVisibility(value);

    return [
        "all users",
        "visible to all users",
    ].includes(normalized);
};

export const canonicalKnowledgeBaseVisibility = (value) => {
    if (isPublicKnowledgeBaseVisibility(value)) {
        return "Visible to all users";
    }

    return String(value || "").trim();
};
