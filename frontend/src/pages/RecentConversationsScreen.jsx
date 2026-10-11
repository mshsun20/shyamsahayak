
import React from "react";
import {
    ArrowLeft,
    Search,
    ChevronRight,
    Layers,
    Calculator,
    ShieldCheck,
    Wrench,
    Briefcase,
    Truck,
    Sparkles,
} from "lucide-react";

import axiosInstance from "../config/axiosInstance";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "week", label: "This Week" },
];

const CONVERSATION_ICONS = [
    Layers,
    Calculator,
    ShieldCheck,
    Wrench,
    Briefcase,
    Truck,
];

const getDateCategory = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "older";

    const now = new Date();
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const dayDifference = Math.floor(
        (startOfToday.getTime() - startOfDate.getTime()) /
            (24 * 60 * 60 * 1000)
    );

    if (dayDifference === 0) return "today";
    if (dayDifference === 1) return "yesterday";
    if (dayDifference >= 2 && dayDifference < 7) return "week";

    return "older";
};

const formatConversationTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    const category = getDateCategory(dateValue);

    if (category === "today" || category === "yesterday") {
        return `${category === "today" ? "Today" : "Yesterday"}, ${date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        )}`;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const normalizeConversation = (conversation, index) => {
    const conversationId =
        conversation?.conversationId || conversation?._id;

    const lastActivity =
        conversation?.lastMessageAt ||
        conversation?.updatedAt ||
        conversation?.createdAt;

    return {
        id: conversationId,
        conversationId,
        title: conversation?.title || "New Conversation",
        snippet:
            conversation?.lastMessage ||
            conversation?.title ||
            "No messages yet",
        time: formatConversationTime(lastActivity),
        category: getDateCategory(lastActivity),
        Icon: CONVERSATION_ICONS[index % CONVERSATION_ICONS.length],
        messageCount: conversation?.messageCount || 0,
        status: conversation?.status || "Active",
    };
};

const RecentConversationMessage = ({
    onBack = () => {},
    onSelectConversation = () => {},
    limit = 50,
}) => {
    const [query, setQuery] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [conversations, setConversations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const fetchConversations = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await axiosInstance.get("/conversations", { params: { limit } });

            const apiData = response?.data?.data;

            if (!Array.isArray(apiData)) {
                throw new Error("Invalid conversations response from server.");
            }

            setConversations(apiData.map(normalizeConversation));
        } catch (err) {
            console.error("Failed to fetch conversations:", err);

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load conversations."
            );
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    React.useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const filteredConversations = React.useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return conversations.filter((conversation) => {
            const matchesQuery =
                !normalizedQuery ||
                conversation.title.toLowerCase().includes(normalizedQuery) ||
                conversation.snippet.toLowerCase().includes(normalizedQuery);

            let matchesFilter = true;

            if (filter === "today" || filter === "yesterday") {
                matchesFilter = conversation.category === filter;
            } else if (filter === "week") {
                matchesFilter = ["today", "yesterday", "week"].includes(
                    conversation.category
                );
            }

            return matchesQuery && matchesFilter;
        });
    }, [conversations, query, filter]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="-ml-1 p-1 text-gray-900"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-lg font-bold text-gray-900">
                    Recent Conversations
                </h1>
            </div>

            {/* Search and filters */}
            <div className="px-4 pb-2 pt-4">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />

                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search conversations..."
                        aria-label="Search conversations"
                        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                </div>

                <div
                    className="no-scrollbar mt-4 flex gap-2 overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                >
                    {FILTERS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilter(item.id)}
                            aria-pressed={filter === item.id}
                            className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                                filter === item.id
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
                {isLoading && (
                    <div className="py-16 text-center text-sm text-gray-400">
                        Loading conversations...
                    </div>
                )}

                {!isLoading && error && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-red-500">{error}</p>

                        <button
                            type="button"
                            onClick={fetchConversations}
                            className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!isLoading &&
                    !error &&
                    filteredConversations.length === 0 && (
                        <div className="py-16 text-center">
                            <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                No conversations found
                            </p>
                        </div>
                    )}

                {!isLoading &&
                    !error &&
                    filteredConversations.map((conversation) => {
                        const Icon = conversation.Icon;

                        return (
                            <button
                                key={conversation.id}
                                type="button"
                                disabled={!conversation.conversationId}
                                onClick={() =>
                                    onSelectConversation(conversation)
                                }
                                className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:border-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                                    <Icon className="h-5 w-5 text-orange-500" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="truncate font-semibold text-gray-900">
                                            {conversation.title}
                                        </p>

                                        <span className="mt-0.5 shrink-0 whitespace-nowrap text-xs text-gray-400">
                                            {conversation.time}
                                        </span>
                                    </div>

                                    <p className="mt-0.5 truncate text-sm text-gray-500">
                                        {conversation.snippet}
                                    </p>
                                </div>

                                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                            </button>
                        );
                    })}

                {!isLoading && !error && conversations.length > 0 && (
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                            <Sparkles className="h-5 w-5 text-orange-500" />
                        </div>

                        <p className="text-sm font-medium text-gray-600">
                            Select a conversation to continue chatting with
                            Sahayak AI.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(RecentConversationMessage);
