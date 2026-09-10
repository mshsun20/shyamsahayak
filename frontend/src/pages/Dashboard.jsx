import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    Mic,
    Send,
    CheckCheck,
    Tag,
    Gift,
    ShieldCheck,
    Wrench,
    Users,
    Phone,
    Calendar,
    FileText,
    ChevronRight,
    Megaphone,
    Bot,
    Home as HomeIcon,
    Search,
    Layers,
    Calculator,
    Briefcase,
    Truck,
    Sparkles,
} from 'lucide-react';

/**
 * Sahayak AI — mobile demo
 * ------------------------
 * This single file wires together three screens so the requested navigation
 * can be seen working end to end:
 *
 *   1. HomeScreen    – the existing "Hi Raj!" landing screen (lightweight
 *                       recreation, included only so the demo has somewhere
 *                       to navigate from).
 *   2. ChatScreen     – opens when the home screen's send button is tapped,
 *                       a Popular Question card is tapped, or a Recent
 *                       Conversation preview item is tapped.
 *   3. HistoryScreen  – opens when "View all" next to Recent Conversations
 *                       is tapped.
 *
 * In your real app, ChatScreen and HistoryScreen live in their own files
 * (see ChatScreen.jsx and RecentConversationsScreen.jsx) — this file just
 * inlines everything into one artifact so it can be previewed and clicked
 * through in one place.
 */

// ---------------------------------------------------------------------------
// Shared bot-response logic (used by both the home screen's quick cards and
// the chat screen's own input bar, so answers are consistent either way)
// ---------------------------------------------------------------------------

function getCannedReply(text) {
    const lower = text.toLowerCase();
    if (lower.includes('price')) {
        return { text: 'Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.', card: 'product' };
    }
    if (lower.includes('scheme')) {
        return { text: 'Here are the ongoing schemes for May 2025.', card: 'scheme' };
    }
    if (lower.includes('install')) {
        return {
            text: 'Sure! Clean and align the base structure, fix the sheets with anti-corrosive screws at the recommended pitch, and overlap sheets by at least one corrugation. Want the full step-by-step guide?',
        };
    }
    if (lower.includes('warranty')) {
        return {
            text: 'Tiger Premium Roofing Sheets come with a standard warranty against manufacturing defects and coating failure. Coverage varies by thickness — want the exact period for a specific variant?',
        };
    }
    if (lower.includes('compar') || lower.includes('competitor')) {
        return {
            text: 'Tiger Premium sheets use AZ150 Zinc-Aluminium coating for stronger corrosion resistance than standard GI sheets or most competitor brands. Want a detailed side-by-side comparison?',
        };
    }
    if (lower.includes('dealer')) {
        return { text: 'Happy to help you find a dealer! Could you share your city or PIN code so I can look up the nearest one for you?' };
    }
    return { text: 'Thanks for your question! Let me pull up the latest details on that for you.' };
}

function formatTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Screen 2 — ChatScreen
// ---------------------------------------------------------------------------

const SAMPLE_MESSAGES = [
    { id: 'm1', from: 'user', text: 'What is the price of Tiger Premium Roofing Sheet?', time: '10:30 AM' },
    {
        id: 'm2',
        from: 'bot',
        text: 'Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.',
        time: '10:30 AM',
        card: 'product',
        suggestions: ['Current Schemes', 'Warranty Info', 'Installation Guide'],
    },
    { id: 'm3', from: 'user', text: 'What schemes are available this month?', time: '10:31 AM' },
    {
        id: 'm4',
        from: 'bot',
        text: 'Here are the ongoing schemes for May 2025.',
        time: '10:31 AM',
        card: 'scheme',
    },
];

const QUICK_ACTIONS = ['How to install?', 'Compare with other sheets', 'Find dealer near me'];

const SUGGESTION_ICONS = {
    'Current Schemes': Gift,
    'Warranty Info': ShieldCheck,
    'Installation Guide': Wrench,
    'Compare with other sheets': Users,
};

function ProductCard() {
    const rows = [
        ['0.45 mm', '₹96.50', '₹393.00'],
        ['0.50 mm', '₹107.00', '₹435.00'],
        ['0.60 mm', '₹128.50', '₹522.00'],
    ];
    return (
        <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div className="flex gap-3 p-3">
                <div className="w-16 h-16 rounded-lg bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                    <HomeIcon className="w-7 h-7 text-white" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 leading-snug">Tiger Premium Roofing Sheet</p>
                    <p className="text-xs text-gray-500 mt-1">AZ150 • Zinc-Aluminium Coated</p>
                </div>
            </div>
            <div className="border-t border-gray-100">
                <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-500 font-medium">
                    <span>Thickness</span>
                    <span className="text-right">Price / Meter</span>
                    <span className="text-right">Price / Sq.Mtr.</span>
                </div>
                {rows.map((row) => (
                    <div key={row[0]} className="grid grid-cols-3 px-3 py-2 text-sm text-gray-800 border-t border-gray-50">
                        <span className="font-medium">{row[0]}</span>
                        <span className="text-right">{row[1]}</span>
                        <span className="text-right">{row[2]}</span>
                    </div>
                ))}
            </div>
            <p className="px-3 py-2 text-xs text-gray-400 italic border-t border-gray-50">
                *Prices are inclusive of taxes and subject to change.
            </p>
        </div>
    );
}

function SchemeCard() {
    return (
        <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Megaphone className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900">ROAR May Bonanza</p>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full shrink-0">
                            Active
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Get assured rewards on every purchase of Tiger Premium Roofing Sheets.
                    </p>
                </div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-400 w-24 shrink-0">Valid Till</span>
                    <span className="text-gray-800 font-medium">31 May 2025</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Gift className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-400 w-24 shrink-0">Benefit</span>
                    <span className="text-gray-800 font-medium">Up to ₹5,000 assured rewards</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-400 w-24 shrink-0">Applicable</span>
                    <span className="text-gray-800 font-medium">Tiger Premium Sheets Only</span>
                </div>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1 border border-orange-500 text-orange-600 font-semibold text-sm rounded-lg py-2.5 hover:bg-orange-100 transition-colors">
                View all schemes
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

function ChatScreen({ onBack, initialQuestion }) {
    const [messages, setMessages] = useState(() => {
        if (!initialQuestion) return SAMPLE_MESSAGES;
        const reply = getCannedReply(initialQuestion);
        return [
            { id: 'q-1', from: 'user', text: initialQuestion, time: formatTime() },
            { id: 'a-1', from: 'bot', text: reply.text, card: reply.card, time: formatTime() },
        ];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const userMsg = { id: `u-${Date.now()}`, from: 'user', text: trimmed, time: formatTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            const reply = getCannedReply(trimmed);
            const botMsg = { id: `b-${Date.now()}`, from: 'bot', text: reply.text, card: reply.card, time: formatTime() };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 900 + Math.random() * 500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col relative">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-900" aria-label="Go back">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 leading-tight truncate">Sahayak AI</p>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-500">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg) =>
                    msg.from === 'user' ? (
                        <div key={msg.id} className="flex justify-end">
                            <div className="bg-orange-100 rounded-2xl rounded-br-md px-4 py-3" style={{ maxWidth: '80%' }}>
                                <p className="text-sm text-gray-900">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                    <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0" style={{ maxWidth: '85%' }}>
                                <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3">
                                    <p className="text-sm text-gray-800">{msg.text}</p>
                                    {msg.card === 'product' && <ProductCard />}
                                    {msg.card === 'scheme' && <SchemeCard />}
                                    <p className="text-xs text-gray-400 text-right mt-2">{msg.time}</p>
                                </div>
                                {msg.suggestions && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-2">You can also ask:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {msg.suggestions.map((s) => {
                                                const Icon = SUGGESTION_ICONS[s] || Gift;
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => sendMessage(s)}
                                                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}

                {isTyping && (
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Contextual quick-action chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                {QUICK_ACTIONS.map((q) => (
                    <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2">
                <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        placeholder="Ask anything..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                </div>
                <button
                    type="button"
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
                    aria-label="Voice input"
                >
                    <Mic className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Screen 3 — HistoryScreen ("View all" Recent Conversations)
// ---------------------------------------------------------------------------

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

function HistoryScreen({ onBack, onSelectConversation }) {
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
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-900" aria-label="Go back">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <p className="font-bold text-gray-900 text-lg">Recent Conversations</p>
            </div>

            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="text"
                        placeholder="Search conversations..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={
                                'shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ' +
                                (filter === f.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700')
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

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
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{c.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-0.5">{c.snippet}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </button>
                    );
                })}

                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
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

// ---------------------------------------------------------------------------
// Screen 1 — HomeScreen (lightweight recreation, just to power the demo)
// ---------------------------------------------------------------------------

const POPULAR_QUESTIONS = [
    { title: 'Product Price', subtitle: 'Check latest prices', icon: Tag, question: 'What is the price of Tiger Premium Roofing Sheet?', tint: 'bg-orange-50 text-orange-500' },
    { title: 'Current Schemes', subtitle: 'View active schemes', icon: Gift, question: 'What schemes are available this month?', tint: 'bg-green-50 text-green-500' },
    { title: 'Warranty Info', subtitle: 'Warranty details', icon: ShieldCheck, question: 'What is the warranty period for Tiger sheets?', tint: 'bg-blue-50 text-blue-500' },
    { title: 'Installation Guide', subtitle: 'How to install', icon: Wrench, question: 'How to install roofing sheets properly?', tint: 'bg-purple-50 text-purple-500' },
    { title: 'Competitor Info', subtitle: 'Compare products', icon: Users, question: 'How do Tiger sheets compare to competitor brands?', tint: 'bg-orange-50 text-orange-500' },
    { title: 'Dealer Contact', subtitle: 'Find nearest dealer', icon: Phone, question: 'Find my nearest Tiger dealer', tint: 'bg-green-50 text-green-500' },
];

const RECENT_PREVIEW = [
    { title: 'What is the price of Tiger Premium Roofing Sheet?', time: 'Today, 10:30 AM' },
    { title: 'What schemes are available this month?', time: 'Yesterday, 04:15 PM' },
    { title: 'How to install roofing sheets properly?', time: '2 days ago' },
];

function HomeScreen({ onOpenChat, onOpenHistory }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onOpenChat(input.trim());
        setInput('');
    };

    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6">
                <h1 className="text-2xl font-bold text-gray-900">Hi Raj! 👋</h1>
                <p className="text-gray-500 mt-1">How can I help you today?</p>

                <form onSubmit={handleSubmit} className="mt-5 border border-gray-100 rounded-2xl p-2 bg-white shadow-sm">
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            placeholder="Ask anything..."
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                        />
                        <button type="button" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0" aria-label="Voice input">
                            <Mic className="w-4 h-4" />
                        </button>
                        <button type="submit" className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors" aria-label="Send message">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
                <p className="text-xs text-gray-400 mt-2">
                    Type your question or use <span className="text-orange-500 font-medium">voice to ask</span> Sahayak AI
                </p>

                <div className="flex items-center justify-between mt-7">
                    <h2 className="font-bold text-gray-900 text-lg">Popular Questions</h2>
                    <span className="text-orange-500 text-sm font-medium">View all</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    {POPULAR_QUESTIONS.map((q) => {
                        const Icon = q.icon;
                        return (
                            <button
                                key={q.title}
                                onClick={() => onOpenChat(q.question)}
                                className="text-left border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors"
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${q.tint}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm leading-snug">{q.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{q.subtitle}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-7">
                    <h2 className="font-bold text-gray-900 text-lg">Recent Conversations</h2>
                    <button onClick={onOpenHistory} className="text-orange-500 text-sm font-medium">
                        View all
                    </button>
                </div>
                <div className="flex flex-col gap-3 mt-3">
                    {RECENT_PREVIEW.map((r) => (
                        <button
                            key={r.title}
                            onClick={() => onOpenChat(r.title)}
                            className="w-full text-left flex items-center gap-3 border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-900 truncate">{r.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{r.time}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </button>
                    ))}
                </div>

                <div className="mt-7 rounded-2xl bg-orange-50 border border-orange-100 p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="font-bold text-orange-600 text-sm">Your AI Field Assistant</p>
                        <p className="text-xs text-gray-500 mt-0.5">Fast answers, accurate info, always with you.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// App — simple screen router tying the three screens together
// ---------------------------------------------------------------------------

const Dashboard = () => {
    const [screen, setScreen] = useState('home'); // 'home' | 'chat' | 'history'
    const [chatQuestion, setChatQuestion] = useState('');

    const openChat = (question) => {
        setChatQuestion(question || '');
        setScreen('chat');
    };

    const openHistory = () => setScreen('history');
    const goHome = () => setScreen('home');

    if (screen === 'chat') {
        return <ChatScreen onBack={goHome} initialQuestion={chatQuestion} />;
    }
    if (screen === 'history') {
        return (
            <HistoryScreen
                onBack={goHome}
                onSelectConversation={(c) => openChat(c.title)}
            />
        );
    }
    return <HomeScreen onOpenChat={openChat} onOpenHistory={openHistory} />;
}

export default React.memo(Dashboard);