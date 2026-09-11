import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

/**
 * RecentConversationsScreen
 * --------------------------
 * Opens when the user taps "View all" next to Recent Conversations on the
 * home screen (Screen 3). Shows the full conversation history with search
 * and date filters.
 *
 * Drop this component into your app and wire up:
 *  - onBack               -> called when the back arrow is tapped
 *  - onSelectConversation -> called with the tapped conversation object,
 *                            typically used to re-open that chat thread
 */

const CONVERSATIONS = [
    {
        id: 'c1',
        title: 'Best roofing sheet for coastal areas',
        snippet: 'You: Which roofing sheet is best for salty, coastal weather?',
        time: '10:24 AM',
        category: 'today',
        icon: Layers,
    },
    {
        id: 'c2',
        title: 'Weight calculation for AZ150',
        snippet: 'You: Calculate the weight of 12 ft, 0.5 mm sheet',
        time: 'Yesterday',
        category: 'yesterday',
        icon: Calculator,
    },
    {
        id: 'c3',
        title: 'Warranty of Tiger Premium Sheets',
        snippet: 'You: What is the warranty period for Tiger sheets?',
        time: 'Yesterday',
        category: 'yesterday',
        icon: ShieldCheck,
    },
    {
        id: 'c4',
        title: 'Installation guidelines',
        snippet: 'You: How to install roofing sheets properly?',
        time: '26 May 2025',
        category: 'week',
        icon: Wrench,
    },
    {
        id: 'c5',
        title: 'About SEL Tiger product range',
        snippet: 'You: Tell me about the Tiger range of products',
        time: '25 May 2025',
        category: 'week',
        icon: Briefcase,
    },
    {
        id: 'c6',
        title: 'Delivery time to Gujarat',
        snippet: 'You: What is the delivery time for an order?',
        time: '24 May 2025',
        category: 'week',
        icon: Truck,
    },
];

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
];

const RecentConversationsScreen = ({ onBack = () => { }, onSelectConversation = () => { } }) => {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        return CONVERSATIONS.filter((c) => {
            const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
            let matchesFilter = true;
            if (filter === 'today') matchesFilter = c.category === 'today';
            else if (filter === 'yesterday') matchesFilter = c.category === 'yesterday';
            else if (filter === 'week') matchesFilter = ['today', 'yesterday', 'week'].includes(c.category);
            return matchesQuery && matchesFilter;
        });
    }, [query, filter]);

    return (
        <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-900" aria-label="Go back">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <p className="font-bold text-gray-900 text-lg">Recent Conversations</p>
            </div>

            <div className="px-4 pt-4 pb-2">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="text"
                        placeholder="Search conversations..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={
                                'flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ' +
                                (filter === f.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700')
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No conversations found</p>
                    </div>
                )}

                {filtered.map((c) => {
                    const Icon = c.icon;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelectConversation(c)}
                            className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{c.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-0.5">{c.snippet}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </button>
                    );
                })}

                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                        Tap on any conversation to continue chatting with Sahayak.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default React.memo(RecentConversationsScreen)