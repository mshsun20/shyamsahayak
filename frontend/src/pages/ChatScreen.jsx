import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Mic,
    Send,
    CheckCheck,
    Gift,
    ShieldCheck,
    Wrench,
    Users,
    Calendar,
    FileText,
    ChevronRight,
    Megaphone,
    Bot,
    Home as HomeIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fadeBottom } from '../animations/allVariants';

/**
 * ChatScreen
 * -----------
 * The individual conversation screen (Screen 2). This opens when the user
 * sends a message from the home screen's "Ask anything..." bar, taps a
 * Popular Question card, or taps a Recent Conversation item.
 *
 * Drop this component into your app and wire up:
 *  - onBack            -> called when the back arrow is tapped
 *  - initialQuestion   -> (optional) the question that triggered this screen.
 *                         When provided, the chat opens with that question
 *                         already asked and answered. When omitted, a sample
 *                         conversation is shown (useful for previewing).
 */

const SAMPLE_MESSAGES = [
    {
        id: 'm1',
        from: 'user',
        text: 'What is the price of Tiger Premium Roofing Sheet?',
        time: '10:30 AM',
    },
    {
        id: 'm2',
        from: 'bot',
        text: 'Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.',
        time: '10:30 AM',
        card: 'product',
        suggestions: ['Current Schemes', 'Warranty Info', 'Installation Guide'],
    },
    {
        id: 'm3',
        from: 'user',
        text: 'What schemes are available this month?',
        time: '10:31 AM',
    },
    {
        id: 'm4',
        from: 'bot',
        text: 'Here are the ongoing schemes for May 2025.',
        time: '10:31 AM',
        card: 'scheme',
    },
];

const QUICK_ACTIONS = ['How to install?', 'Compare with other sheets', 'Find dealer near me'];

const CANNED_REPLIES = [
    { match: ['price'], text: 'Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.', card: 'product' },
    { match: ['scheme'], text: 'Here are the ongoing schemes for May 2025.', card: 'scheme' },
    {
        match: ['install'],
        text: 'Sure! Clean and align the base structure, fix the sheets with anti-corrosive screws at the recommended pitch, and overlap sheets by at least one corrugation. Want the full step-by-step guide?',
    },
    {
        match: ['warranty'],
        text: 'Tiger Premium Roofing Sheets come with a standard warranty against manufacturing defects and coating failure. Coverage varies by thickness — want the exact period for a specific variant?',
    },
    {
        match: ['compar'],
        text: 'Tiger Premium sheets use AZ150 Zinc-Aluminium coating for stronger corrosion resistance than standard GI sheets. I can pull up a side-by-side comparison if that helps.',
    },
    {
        match: ['dealer'],
        text: 'Happy to help you find a dealer! Could you share your city or PIN code so I can look up the nearest one for you?',
    },
];

function getCannedReply(text) {
    const lower = text.toLowerCase();
    const found = CANNED_REPLIES.find((r) => r.match.some((k) => lower.includes(k)));
    if (found) return { text: found.text, card: found.card };
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

const SUGGESTION_ICONS = {
    'Current Schemes': Gift,
    'Warranty Info': ShieldCheck,
    'Installation Guide': Wrench,
    'Compare with other sheets': Users,
};

const ChatScreen = ({ onBack = () => { }, initialQuestion = '' }) => {
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
        <AnimatePresence
            mode="wait"
            initial={false}
        >
            <motion.div
                variants={fadeBottom}
                initial="hidden"
                animate="show"
                className="w-full max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative"
            >
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

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
            </motion.div>
        </AnimatePresence>
        // <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative">
        //     <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        //     {/* Header */}
        //     <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        //         <button onClick={onBack} className="p-1 -ml-1 text-gray-900" aria-label="Go back">
        //             <ArrowLeft className="w-5 h-5" />
        //         </button>
        //         <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
        //             <Bot className="w-5 h-5 text-white" />
        //         </div>
        //         <div className="min-w-0">
        //             <p className="font-bold text-gray-900 leading-tight truncate">Sahayak AI</p>
        //             <div className="flex items-center gap-1">
        //                 <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        //                 <span className="text-xs text-gray-500">Online</span>
        //             </div>
        //         </div>
        //     </div>

        //     {/* Messages */}
        //     <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        //         {messages.map((msg) =>
        //             msg.from === 'user' ? (
        //                 <div key={msg.id} className="flex justify-end">
        //                     <div className="bg-orange-100 rounded-2xl rounded-br-md px-4 py-3" style={{ maxWidth: '80%' }}>
        //                         <p className="text-sm text-gray-900">{msg.text}</p>
        //                         <div className="flex items-center justify-end gap-1 mt-1">
        //                             <span className="text-xs text-gray-500">{msg.time}</span>
        //                             <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
        //                         </div>
        //                     </div>
        //                 </div>
        //             ) : (
        //                 <div key={msg.id} className="flex gap-2">
        //                     <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
        //                         <Bot className="w-4 h-4 text-white" />
        //                     </div>
        //                     <div className="min-w-0" style={{ maxWidth: '85%' }}>
        //                         <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3">
        //                             <p className="text-sm text-gray-800">{msg.text}</p>
        //                             {msg.card === 'product' && <ProductCard />}
        //                             {msg.card === 'scheme' && <SchemeCard />}
        //                             <p className="text-xs text-gray-400 text-right mt-2">{msg.time}</p>
        //                         </div>
        //                         {msg.suggestions && (
        //                             <div className="mt-2">
        //                                 <p className="text-xs text-gray-500 mb-2">You can also ask:</p>
        //                                 <div className="flex flex-wrap gap-2">
        //                                     {msg.suggestions.map((s) => {
        //                                         const Icon = SUGGESTION_ICONS[s] || Gift;
        //                                         return (
        //                                             <button
        //                                                 key={s}
        //                                                 onClick={() => sendMessage(s)}
        //                                                 className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
        //                                             >
        //                                                 <Icon className="w-3.5 h-3.5" />
        //                                                 {s}
        //                                             </button>
        //                                         );
        //                                     })}
        //                                 </div>
        //                             </div>
        //                         )}
        //                     </div>
        //                 </div>
        //             )
        //         )}

        //         {isTyping && (
        //             <div className="flex gap-2">
        //                 <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
        //                     <Bot className="w-4 h-4 text-white" />
        //                 </div>
        //                 <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-1">
        //                     <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        //                     <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        //                     <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        //                 </div>
        //             </div>
        //         )}
        //         <div ref={bottomRef} />
        //     </div>

        //     {/* Contextual quick-action chips */}
        //     <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        //         {QUICK_ACTIONS.map((q) => (
        //             <button
        //                 key={q}
        //                 onClick={() => sendMessage(q)}
        //                 className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:text-orange-600 transition-colors"
        //             >
        //                 {q}
        //             </button>
        //         ))}
        //     </div>

        //     {/* Input bar */}
        //     <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2">
        //         <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
        //             <input
        //                 value={input}
        //                 onChange={(e) => setInput(e.target.value)}
        //                 type="text"
        //                 placeholder="Ask anything..."
        //                 className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
        //             />
        //         </div>
        //         <button
        //             type="button"
        //             className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
        //             aria-label="Voice input"
        //         >
        //             <Mic className="w-5 h-5" />
        //         </button>
        //         <button
        //             type="submit"
        //             className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors"
        //             aria-label="Send message"
        //         >
        //             <Send className="w-5 h-5" />
        //         </button>
        //     </form>
        // </div>
    );
}

export default React.memo(ChatScreen);