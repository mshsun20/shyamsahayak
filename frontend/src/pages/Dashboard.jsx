import React from "react";
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
} from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../config/axiosInstance";
import ChatScreen from "./ChatScreen";


// ---------------------------------------------------------------------------
// Shared bot-response logic
// ---------------------------------------------------------------------------

// function getCannedReply(text) {
//     const lower = text.toLowerCase();

//     if (lower.includes("price")) {
//         return {
//             text: "Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.",
//             card: "product",
//         };
//     }

//     if (lower.includes("scheme")) {
//         return {
//             text: "Here are the ongoing schemes for May 2025.",
//             card: "scheme",
//         };
//     }

//     if (lower.includes("install")) {
//         return {
//             text: "Sure! Clean and align the base structure, fix the sheets with anti-corrosive screws at the recommended pitch, and overlap sheets by at least one corrugation. Want the full step-by-step guide?",
//         };
//     }

//     if (lower.includes("warranty")) {
//         return {
//             text: "Tiger Premium Roofing Sheets come with a standard warranty against manufacturing defects and coating failure. Coverage varies by thickness — want the exact period for a specific variant?",
//         };
//     }

//     if (lower.includes("compar") || lower.includes("competitor")) {
//         return {
//             text: "Tiger Premium sheets use AZ150 Zinc-Aluminium coating for stronger corrosion resistance than standard GI sheets or most competitor brands. Want a detailed side-by-side comparison?",
//         };
//     }

//     if (lower.includes("dealer")) {
//         return {
//             text: "Happy to help you find a dealer! Could you share your city or PIN code so I can look up the nearest one for you?",
//         };
//     }

//     return {
//         text: "Thanks for your question! Let me pull up the latest details on that for you.",
//     };
// }


function formatTime(date = new Date()) {
    const currentDate = new Date(date);
    if (Number.isNaN(currentDate.getTime())) return "";
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}


function formatConversationTime(date) {
    const conversationDate = new Date(date);
    if (Number.isNaN(conversationDate.getTime())) return "";
    const now = new Date();
    const isToday = conversationDate.toDateString() === now.toDateString();
    if (isToday) return `Today, ${formatTime(conversationDate)}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (conversationDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${formatTime(conversationDate)}`;
    }

    return conversationDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


// ---------------------------------------------------------------------------
// Screen 2 — ChatScreen
// ---------------------------------------------------------------------------
// const SAMPLE_MESSAGES = [
//     {
//         id: "m1",
//         from: "user",
//         text: "What is the price of Tiger Premium Roofing Sheet?",
//         time: "10:30 AM",
//     },
//     {
//         id: "m2",
//         from: "bot",
//         text: "Here is the latest price for Tiger Premium Roofing Sheet as on 7 May 2025.",
//         time: "10:30 AM",
//         card: "product",
//         suggestions: ["Current Schemes", "Warranty Info", "Installation Guide"],
//     },
//     {
//         id: "m3",
//         from: "user",
//         text: "What schemes are available this month?",
//         time: "10:31 AM",
//     },
//     {
//         id: "m4",
//         from: "bot",
//         text: "Here are the ongoing schemes for May 2025.",
//         time: "10:31 AM",
//         card: "scheme",
//     },
// ];


// const QUICK_ACTIONS = [
//     "How to install?",
//     "Compare with other sheets",
//     "Find dealer near me",
// ];


// const SUGGESTION_ICONS = {
//     "Current Schemes": Gift,
//     "Warranty Info": ShieldCheck,
//     "Installation Guide": Wrench,
//     "Compare with other sheets": Users,
// };


// function ProductCard() {
//     const rows = [
//         ["0.45 mm", "₹96.50", "₹393.00"],
//         ["0.50 mm", "₹107.00", "₹435.00"],
//         ["0.60 mm", "₹128.50", "₹522.00"],
//     ];

//     return (
//         <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden bg-white">
//             <div className="flex gap-3 p-3">
//                 <div className="w-16 h-16 rounded-lg bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
//                     <HomeIcon
//                         className="w-7 h-7 text-white"
//                         strokeWidth={1.75}
//                     />
//                 </div>

//                 <div className="min-w-0">
//                     <p className="font-bold text-gray-900 leading-snug">
//                         Tiger Premium Roofing Sheet
//                     </p>

//                     <p className="text-xs text-gray-500 mt-1">
//                         AZ150 • Zinc-Aluminium Coated
//                     </p>
//                 </div>
//             </div>

//             <div className="border-t border-gray-100">
//                 <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-500 font-medium">
//                     <span>Thickness</span>
//                     <span className="text-right">
//                         Price / Meter
//                     </span>
//                     <span className="text-right">
//                         Price / Sq.Mtr.
//                     </span>
//                 </div>

//                 {rows.map((row) => (
//                     <div
//                         key={row[0]}
//                         className="grid grid-cols-3 px-3 py-2 text-sm text-gray-800 border-t border-gray-50"
//                     >
//                         <span className="font-medium">
//                             {row[0]}
//                         </span>

//                         <span className="text-right">
//                             {row[1]}
//                         </span>

//                         <span className="text-right">
//                             {row[2]}
//                         </span>
//                     </div>
//                 ))}
//             </div>

//             <p className="px-3 py-2 text-xs text-gray-400 italic border-t border-gray-50">
//                 *Prices are inclusive of taxes and subject to change.
//             </p>
//         </div>
//     );
// }


// function SchemeCard() {
//     return (
//         <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3">
//             <div className="flex items-start gap-3">
//                 <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
//                     <Megaphone className="w-5 h-5 text-orange-500" />
//                 </div>

//                 <div className="min-w-0 flex-1">
//                     <div className="flex items-center justify-between gap-2">
//                         <p className="font-bold text-gray-900">
//                             ROAR May Bonanza
//                         </p>

//                         <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full shrink-0">
//                             Active
//                         </span>
//                     </div>

//                     <p className="text-sm text-gray-600 mt-1">
//                         Get assured rewards on every purchase of Tiger Premium Roofing Sheets.
//                     </p>
//                 </div>
//             </div>

//             <div className="mt-3 space-y-2 text-sm">
//                 <div className="flex items-center gap-2 text-gray-600">
//                     <Calendar className="w-4 h-4 text-gray-400 shrink-0" />

//                     <span className="text-gray-400 w-24 shrink-0">
//                         Valid Till
//                     </span>

//                     <span className="text-gray-800 font-medium">
//                         31 May 2025
//                     </span>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-600">
//                     <Gift className="w-4 h-4 text-gray-400 shrink-0" />

//                     <span className="text-gray-400 w-24 shrink-0">
//                         Benefit
//                     </span>

//                     <span className="text-gray-800 font-medium">
//                         Up to ₹5,000 assured rewards
//                     </span>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-600">
//                     <FileText className="w-4 h-4 text-gray-400 shrink-0" />

//                     <span className="text-gray-400 w-24 shrink-0">
//                         Applicable
//                     </span>

//                     <span className="text-gray-800 font-medium">
//                         Tiger Premium Sheets Only
//                     </span>
//                 </div>
//             </div>

//             <button className="mt-3 w-full flex items-center justify-center gap-1 border border-orange-500 text-orange-600 font-semibold text-sm rounded-lg py-2.5 hover:bg-orange-100 transition-colors">
//                 View all schemes
//                 <ChevronRight className="w-4 h-4" />
//             </button>
//         </div>
//     );
// }


// ---------------------------------------------------------------------------
// Convert API message to existing UI message format
// ---------------------------------------------------------------------------

// function normalizeConversationMessage(message) {
//     const isUser = message?.sender === "user";
//     let text = message?.content || "";
//     if (!text && message?.response && typeof message.response === "string") {
//         text = message.response;
//     }

//     if (!text && message?.response && typeof message.response === "object") {
//         text = message.response.summary || message.response.message || "";
//     }

//     return {
//         id: message?.messageId || message?._id || `message-${Date.now()}-${Math.random()}`,
//         from: isUser ? "user" : "bot",
//         text,
//         time: formatTime(message?.createdAt),
//         card: message?.response?.type === "product"
//             ? "product"
//             : message?.response?.type === "scheme" ? "scheme" : undefined,
//         response: message?.response || null,
//         metadata: message?.metadata || null,
//     };
// }


// const ChatScreen = ({
//     onBack,
//     initialQuestion,
//     conversationId,
//     onConversationCreated,
// }) => {
//     const [messages, setMessages] = React.useState([]);
//     const [input, setInput] = React.useState("");
//     const [isTyping, setIsTyping] = React.useState(false);
//     const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
//     const [historyError, setHistoryError] = React.useState(null);
//     const bottomRef = React.useRef(null);

//     /*
//     |--------------------------------------------------------------------------
//     | Load existing conversation
//     |--------------------------------------------------------------------------
//     */
//     React.useEffect(() => {
//         let isMounted = true;
//         const loadConversationMessages = async () => {
//             if (!conversationId) {
//                 /*
//                  * New conversation.
//                  *
//                  * Keep existing behavior for now.
//                  */
//                 if (initialQuestion) {
//                     const reply = getCannedReply(initialQuestion);
//                     if (!isMounted) return;
//                     setMessages([
//                         {
//                             id: `q-${Date.now()}`,
//                             from: "user",
//                             text: initialQuestion,
//                             time: formatTime(),
//                         },
//                         {
//                             id: `a-${Date.now()}`,
//                             from: "bot",
//                             text: reply.text,
//                             card: reply.card,
//                             time: formatTime(),
//                         },
//                     ]);
//                 } else {
//                     setMessages(SAMPLE_MESSAGES);
//                 }

//                 return;
//             }

//             try {
//                 setIsLoadingHistory(true);
//                 setHistoryError(null);
//                 const response = await axiosInstance.get(`/conversations/${conversationId}/messages`, { params: { limit: 100 } });
//                 if (!isMounted) return;
//                 const apiMessages = response?.data?.data || [];
//                 setMessages(apiMessages.map(normalizeConversationMessage));
//             } catch (error) {
//                 console.error("Failed to load conversation messages:", error);
//                 if (!isMounted) return;
//                 setHistoryError(error?.response?.data?.message || "Unable to load conversation.");
//                 setMessages([]);
//             } finally {
//                 if (isMounted) {
//                     setIsLoadingHistory(false);
//                 }
//             }
//         };

//         loadConversationMessages();
//         return () => {
//             isMounted = false;
//         };
//     }, [conversationId, initialQuestion]);


//     /*
//     |--------------------------------------------------------------------------
//     | Scroll to bottom
//     |--------------------------------------------------------------------------
//     */
//     React.useEffect(() => {
//         bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages, isTyping, isLoadingHistory]);


//     /*
//     |--------------------------------------------------------------------------
//     | Existing temporary message behavior
//     |--------------------------------------------------------------------------
//     |
//     | IMPORTANT:
//     | This is intentionally kept unchanged for now.
//     |
//     | In the next phase this function will be replaced by:
//     |
//     | socket.emit("chat:query", {...})
//     |
//     */
//     const sendMessage = (text) => {
//         const trimmed = text.trim();
//         if (!trimmed || isTyping) return;
//         const userMsg = {
//             id: `u-${Date.now()}`,
//             from: "user",
//             text: trimmed,
//             time: formatTime(),
//         };
//         setMessages((prev) => [...prev, userMsg]);
//         setInput("");
//         setIsTyping(true);
//         setTimeout(() => {
//             const reply = getCannedReply(trimmed);
//             const botMsg = {
//                 id: `b-${Date.now()}`,
//                 from: "bot",
//                 text: reply.text,
//                 card: reply.card,
//                 time: formatTime(),
//             };
//             setMessages((prev) => [...prev, botMsg]);
//             setIsTyping(false);
//         }, 900 + Math.random() * 500);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         sendMessage(input);
//     };


//     return (
//         <div className="w-full min-h-screen bg-gray-50 flex flex-col relative">

//             {/* Header */}

//             <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">

//                 <button
//                     onClick={onBack}
//                     className="p-1 -ml-1 text-gray-900"
//                     aria-label="Go back"
//                 >
//                     <ArrowLeft className="w-5 h-5" />
//                 </button>

//                 <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
//                     <Bot className="w-5 h-5 text-white" />
//                 </div>

//                 <div className="min-w-0">
//                     <p className="font-bold text-gray-900 leading-tight truncate">
//                         Sahayak AI
//                     </p>

//                     <div className="flex items-center gap-1">
//                         <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

//                         <span className="text-xs text-gray-500">
//                             Online
//                         </span>
//                     </div>
//                 </div>
//             </div>


//             {/* Loading existing conversation */}

//             {isLoadingHistory && (
//                 <div className="px-4 pt-3">
//                     <div className="text-xs text-gray-400 text-center">
//                         Loading conversation...
//                     </div>
//                 </div>
//             )}


//             {/* History error */}

//             {historyError && (
//                 <div className="px-4 pt-3">
//                     <div className="text-xs text-red-500 text-center">
//                         {historyError}
//                     </div>
//                 </div>
//             )}


//             {/* Messages */}

//             <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

//                 {messages.map((msg) =>
//                     msg.from === "user" ? (
//                         <div
//                             key={msg.id}
//                             className="flex justify-end"
//                         >
//                             <div
//                                 className="bg-orange-100 rounded-2xl rounded-br-md px-4 py-3"
//                                 style={{
//                                     maxWidth: "80%",
//                                 }}
//                             >
//                                 <p className="text-sm text-gray-900">
//                                     {msg.text}
//                                 </p>

//                                 <div className="flex items-center justify-end gap-1 mt-1">

//                                     <span className="text-xs text-gray-500">
//                                         {msg.time}
//                                     </span>

//                                     <CheckCheck className="w-3.5 h-3.5 text-orange-500" />

//                                 </div>
//                             </div>
//                         </div>
//                     ) : (
//                         <div
//                             key={msg.id}
//                             className="flex gap-2"
//                         >
//                             <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
//                                 <Bot className="w-4 h-4 text-white" />
//                             </div>

//                             <div
//                                 className="min-w-0"
//                                 style={{
//                                     maxWidth: "85%",
//                                 }}
//                             >
//                                 <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3">

//                                     <p className="text-sm text-gray-800">
//                                         {msg.text}
//                                     </p>

//                                     {msg.card === "product" && (
//                                         <ProductCard />
//                                     )}

//                                     {msg.card === "scheme" && (
//                                         <SchemeCard />
//                                     )}

//                                     <p className="text-xs text-gray-400 text-right mt-2">
//                                         {msg.time}
//                                     </p>
//                                 </div>

//                                 {msg.suggestions && (
//                                     <div className="mt-2">

//                                         <p className="text-xs text-gray-500 mb-2">
//                                             You can also ask:
//                                         </p>

//                                         <div className="flex flex-wrap gap-2">

//                                             {msg.suggestions.map(
//                                                 (s) => {
//                                                     const Icon =
//                                                         SUGGESTION_ICONS[
//                                                         s
//                                                         ] || Gift;

//                                                     return (
//                                                         <button
//                                                             key={s}
//                                                             onClick={() =>
//                                                                 sendMessage(
//                                                                     s
//                                                                 )
//                                                             }
//                                                             className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
//                                                         >
//                                                             <Icon className="w-3.5 h-3.5" />

//                                                             {s}
//                                                         </button>
//                                                     );
//                                                 }
//                                             )}

//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )
//                 )}


//                 {isTyping && (
//                     <div className="flex gap-2">

//                         <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
//                             <Bot className="w-4 h-4 text-white" />
//                         </div>

//                         <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-1">

//                             <span
//                                 className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
//                                 style={{
//                                     animationDelay: "0ms",
//                                 }}
//                             />

//                             <span
//                                 className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
//                                 style={{
//                                     animationDelay: "150ms",
//                                 }}
//                             />

//                             <span
//                                 className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
//                                 style={{
//                                     animationDelay: "300ms",
//                                 }}
//                             />

//                         </div>
//                     </div>
//                 )}

//                 <div ref={bottomRef} />

//             </div>


//             {/* Contextual quick-action chips */}

//             <div
//                 className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar"
//                 style={{
//                     scrollbarWidth: "none",
//                 }}
//             >
//                 {QUICK_ACTIONS.map((q) => (
//                     <button
//                         key={q}
//                         onClick={() => sendMessage(q)}
//                         className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:text-orange-600 transition-colors"
//                     >
//                         {q}
//                     </button>
//                 ))}
//             </div>


//             {/* Input bar */}

//             <form
//                 onSubmit={handleSubmit}
//                 className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2"
//             >

//                 <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">

//                     <input
//                         value={input}
//                         onChange={(e) =>
//                             setInput(e.target.value)
//                         }
//                         type="text"
//                         placeholder="Ask anything..."
//                         className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
//                     />

//                 </div>

//                 <button
//                     type="button"
//                     className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
//                     aria-label="Voice input"
//                 >
//                     <Mic className="w-5 h-5" />
//                 </button>

//                 <button
//                     type="submit"
//                     disabled={isTyping}
//                     className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors disabled:opacity-50"
//                     aria-label="Send message"
//                 >
//                     <Send className="w-5 h-5" />
//                 </button>

//             </form>
//         </div>
//     );
// }


// ---------------------------------------------------------------------------
// Screen 3 — HistoryScreen
// ---------------------------------------------------------------------------

const FILTERS = [
    {
        id: "all",
        label: "All",
    },
    {
        id: "today",
        label: "Today",
    },
    {
        id: "yesterday",
        label: "Yesterday",
    },
    {
        id: "week",
        label: "This Week",
    },
];


function getConversationCategory(date) {
    const conversationDate = new Date(date);
    if (Number.isNaN(conversationDate.getTime())) return "week";
    const now = new Date();
    if (conversationDate.toDateString() === now.toDateString()) return "today";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (conversationDate.toDateString() === yesterday.toDateString()) return "yesterday";
    return "week";
}


function getConversationIcon(index) {
    const icons = [
        Layers,
        Calculator,
        ShieldCheck,
        Wrench,
        Briefcase,
        Truck,
    ];

    return icons[index % icons.length];
}


function normalizeConversation(conversation, index) {
    return {
        id: conversation?.conversationId || conversation?._id,
        conversationId: conversation?.conversationId,
        title: conversation?.title || "New Conversation",
        snippet: conversation?.lastMessage || conversation?.title || "Conversation",
        time: formatConversationTime(conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt),
        category: getConversationCategory(conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt),
        icon: getConversationIcon(index),
        messageCount: conversation?.messageCount || 0,
        status: conversation?.status || "Active",
    };
}


const HistoryScreen = ({ onBack, onSelectConversation }) => {
    const [query, setQuery] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [conversations, setConversations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);


    /*
    |--------------------------------------------------------------------------
    | Fetch conversations
    |--------------------------------------------------------------------------
    */

    React.useEffect(() => {
        let isMounted = true;

        const fetchConversations = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await axiosInstance.get(
                        "/conversations",
                        {
                            params: {
                                limit: 50,
                            },
                        }
                    );

                if (!isMounted) return;

                const apiData =
                    response?.data?.data || [];

                setConversations(
                    apiData.map(
                        normalizeConversation
                    )
                );

            } catch (error) {
                console.error(
                    "Failed to fetch conversations:",
                    error
                );

                if (!isMounted) return;

                setError(
                    error?.response?.data?.message ||
                    "Unable to load conversations."
                );

            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchConversations();

        return () => {
            isMounted = false;
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Search + filter
    |--------------------------------------------------------------------------
    */

    const filtered = React.useMemo(() => {
        const normalizedQuery =
            query.trim().toLowerCase();

        return conversations.filter((c) => {

            const matchesQuery =
                !normalizedQuery ||
                c.title
                    .toLowerCase()
                    .includes(normalizedQuery) ||
                c.snippet
                    .toLowerCase()
                    .includes(normalizedQuery);

            let matchesFilter = true;

            if (filter === "today") {
                matchesFilter =
                    c.category === "today";
            } else if (filter === "yesterday") {
                matchesFilter =
                    c.category === "yesterday";
            } else if (filter === "week") {
                matchesFilter = [
                    "today",
                    "yesterday",
                    "week",
                ].includes(c.category);
            }

            return (
                matchesQuery &&
                matchesFilter
            );
        });
    }, [
        conversations,
        query,
        filter,
    ]);


    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">

            {/* Header */}

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">

                <button
                    onClick={onBack}
                    className="p-1 -ml-1 text-gray-900"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <p className="font-bold text-gray-900 text-lg">
                    Recent Conversations
                </p>

            </div>


            <div className="px-4 pt-4 pb-2">

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3">

                    <Search className="w-4 h-4 text-gray-400 shrink-0" />

                    <input
                        value={query}
                        onChange={(e) =>
                            setQuery(e.target.value)
                        }
                        type="text"
                        placeholder="Search conversations..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />

                </div>


                <div
                    className="flex gap-2 mt-4 overflow-x-auto no-scrollbar"
                    style={{
                        scrollbarWidth: "none",
                    }}
                >
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() =>
                                setFilter(f.id)
                            }
                            className={
                                "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                                (
                                    filter === f.id
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-100 text-gray-700"
                                )
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

            </div>


            <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">

                {isLoading && (
                    <div className="text-center py-16">
                        <p className="text-sm text-gray-400">
                            Loading conversations...
                        </p>
                    </div>
                )}


                {!isLoading && error && (
                    <div className="text-center py-16">

                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />

                        <p className="text-sm text-red-400">
                            {error}
                        </p>

                    </div>
                )}


                {!isLoading &&
                    !error &&
                    filtered.length === 0 && (
                        <div className="text-center py-16">

                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />

                            <p className="text-sm text-gray-400">
                                No conversations found
                            </p>

                        </div>
                    )}


                {!isLoading &&
                    !error &&
                    filtered.map((c) => {

                        const Icon = c.icon;

                        return (
                            <button
                                key={c.id}
                                onClick={() =>
                                    onSelectConversation(c)
                                }
                                className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition-colors"
                            >

                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-orange-500" />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <div className="flex items-start justify-between gap-2">

                                        <p className="font-semibold text-gray-900 truncate">
                                            {c.title}
                                        </p>

                                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                                            {c.time}
                                        </span>

                                    </div>

                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {c.snippet}
                                    </p>

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
// Screen 1 — HomeScreen
// ---------------------------------------------------------------------------

const POPULAR_QUESTIONS = [
    {
        title: "Product Price",
        subtitle: "Check latest prices",
        icon: Tag,
        question: "What is the price of Tiger Premium Roofing Sheet?",
        tint: "bg-orange-50 text-orange-500",
    },

    {
        title: "Current Schemes",
        subtitle: "View active schemes",
        icon: Gift,
        question: "What schemes are available this month?",
        tint: "bg-green-50 text-green-500",
    },

    {
        title: "Warranty Info",
        subtitle: "Warranty details",
        icon: ShieldCheck,
        question: "What is the warranty period for Tiger sheets?",
        tint: "bg-blue-50 text-blue-500",
    },

    {
        title: "Installation Guide",
        subtitle: "How to install",
        icon: Wrench,
        question: "How to install roofing sheets properly?",
        tint: "bg-purple-50 text-purple-500",
    },

    {
        title: "Competitor Info",
        subtitle: "Compare products",
        icon: Users,
        question: "How do Tiger sheets compare to competitor brands?",
        tint: "bg-orange-50 text-orange-500",
    },

    {
        title: "Dealer Contact",
        subtitle: "Find nearest dealer",
        icon: Phone,
        question: "Find my nearest Tiger dealer",
        tint: "bg-green-50 text-green-500",
    },
];


const HomeScreen = ({ onOpenChat, onOpenHistory }) => {
    const { user } = useSelector((state) => state.auth);
    const [input, setInput] = React.useState("");
    const [recentConversations, setRecentConversations] = React.useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = React.useState(true);
    const [recentError, setRecentError] = React.useState(null);
    const [isListening, setIsListening] = React.useState(false);
    const [voiceError, setVoiceError] = React.useState("");
    const recognitionRef = React.useRef(null);
    const voiceTranscriptRef = React.useRef("");
    const voiceRecognitionFailedRef = React.useRef(false);
    const userFirstName = String(user?.fullName || "").split(" ")[0];


    /*
    |--------------------------------------------------------------------------
    | Fetch recent conversations
    |--------------------------------------------------------------------------
    */

    const fetchRecentConversations =
        React.useCallback(async () => {
            try {
                setIsLoadingRecent(true);
                setRecentError(null);

                const response =
                    await axiosInstance.get(
                        "/conversations",
                        {
                            params: {
                                limit: 3,
                            },
                        }
                    );

                const apiData =
                    response?.data?.data || [];

                setRecentConversations(
                    apiData.map(
                        normalizeConversation
                    )
                );

            } catch (error) {
                console.error(
                    "Failed to fetch recent conversations:",
                    error
                );

                setRecentError(
                    error?.response?.data?.message ||
                    "Unable to load recent conversations."
                );

                setRecentConversations([]);

            } finally {
                setIsLoadingRecent(false);
            }
        }, []);


    React.useEffect(() => {
        fetchRecentConversations();
    }, [fetchRecentConversations]);


    
    /*
    |--------------------------------------------------------------------------
    | Voice Search
    |--------------------------------------------------------------------------
    | Collect the complete spoken question, then open ChatScreen once
    | speech recognition ends.
    */
    const handleVoiceSearch = () => {
        // Clicking the microphone again stops the current recording.
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN";
            recognition.interimResults = false;
            recognition.continuous = false;
            voiceTranscriptRef.current = "";
            voiceRecognitionFailedRef.current = false;

            recognition.onstart = () => {
                setIsListening(true);
                setVoiceError("");
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map((result) => result[0]?.transcript || "")
                    .join(" ")
                    .trim();

                if (transcript) {
                    voiceTranscriptRef.current = transcript;
                    setInput(transcript);
                }
            };

            recognition.onerror = (event) => {
                voiceRecognitionFailedRef.current = true;
                setIsListening(false);

                if (event.error !== "aborted") {
                    setVoiceError(event.error === "not-allowed"
                        ? "Microphone access was denied. Please allow microphone access in your browser."
                        : `Voice recognition failed: ${event.error}`
                    );
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                if (recognitionRef.current === recognition) {
                    recognitionRef.current = null;
                }

                const transcript = voiceTranscriptRef.current.trim();
                voiceTranscriptRef.current = "";

                // Do not navigate after a recognition error.
                if (voiceRecognitionFailedRef.current) return;
                if (transcript) {
                    setInput("");
                    // Open ChatScreen once with the complete question.
                    onOpenChat(transcript);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("Dashboard voice search error:", error);
            recognitionRef.current = null;
            voiceTranscriptRef.current = "";
            setIsListening(false);
            setVoiceError("Unable to start voice recognition. Please try again.");
        }
    };

    React.useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!input.trim()) return;
        onOpenChat(input.trim());
        setInput("");
    };


    return (
        <div className="w-full min-h-screen bg-white flex flex-col">

            <style>
                {`.no-scrollbar::-webkit-scrollbar { display: none; }`}
            </style>


            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6">

                <h1 className="text-2xl font-bold capitalize text-gray-900">
                    Hi {userFirstName}! 👋
                </h1>

                <p className="text-gray-500 mt-1">
                    How can I help you today?
                </p>


                <form
                    onSubmit={handleSubmit}
                    className="mt-5 border border-gray-100 rounded-2xl p-2 bg-white shadow-sm"
                >

                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 gap-2">

                        <input
                            value={input}
                            onChange={(e) =>
                                setInput(
                                    e.target.value
                                )
                            }
                            type="text"
                            placeholder="Ask anything..."
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                        />

                        <button
                            type="button"
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${isListening
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            }`}
                            aria-label={isListening ? "Stop voice search" : "Start voice search"}
                            aria-pressed={isListening}
                            title={isListening ? "Stop voice search" : "Voice Search"}
                            onClick={handleVoiceSearch}
                        >
                            <Mic className="w-4 h-4" />
                        </button>

                        <button
                            type="submit"
                            className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors"
                            aria-label="Send message"
                            title="Send Message"
                        >
                            <Send className="w-4 h-4" />
                        </button>

                    </div>

                </form>


                <p className="text-xs text-gray-400 mt-2">

                    <span>
                        Type your question or use{" "}
                    </span>

                    <span
                        className="text-orange-500 font-medium cursor-pointer"
                        onClick={handleVoiceSearch}
                    >
                        Voice to ask
                    </span>

                    <span>
                        {" "}Sahayak AI
                    </span>

                </p>


                <div className="flex items-center justify-between mt-7">

                    <h2 className="font-bold text-gray-900 text-lg">
                        Popular Questions
                    </h2>

                    <span className="text-orange-500 text-sm font-medium">
                        View all
                    </span>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-3">

                    {POPULAR_QUESTIONS.map((q) => {

                        const Icon = q.icon;

                        return (
                            <button
                                key={q.title}
                                onClick={() =>
                                    onOpenChat(
                                        q.question
                                    )
                                }
                                className="text-left border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors"
                            >

                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${q.tint}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>

                                <p className="font-bold text-gray-900 text-sm leading-snug">
                                    {q.title}
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                    {q.subtitle}
                                </p>

                            </button>
                        );
                    })}

                </div>


                <div className="flex items-center justify-between mt-7">

                    <h2 className="font-bold text-gray-900 text-lg">
                        Recent Conversations
                    </h2>

                    <button
                        onClick={
                            onOpenHistory
                        }
                        className="text-orange-500 text-sm font-medium"
                    >
                        View all
                    </button>

                </div>


                <div className="flex flex-col gap-3 mt-3">

                    {isLoadingRecent && (
                        <div className="text-sm text-gray-400 py-4 text-center">
                            Loading recent conversations...
                        </div>
                    )}


                    {!isLoadingRecent &&
                        recentError && (
                            <div className="text-sm text-red-400 py-4 text-center">
                                {recentError}
                            </div>
                        )}


                    {!isLoadingRecent &&
                        !recentError &&
                        recentConversations.length === 0 && (
                            <div className="text-sm text-gray-400 py-4 text-center">
                                No recent conversations
                            </div>
                        )}


                    {!isLoadingRecent &&
                        !recentError &&
                        recentConversations.map(
                            (r) => (
                                <button
                                    key={
                                        r.conversationId
                                    }
                                    onClick={() =>
                                        onOpenChat(
                                            "",
                                            r.conversationId
                                        )
                                    }
                                    className="w-full text-left flex items-center gap-3 border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors"
                                >

                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-gray-500" />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <p className="text-sm text-gray-900 truncate">
                                            {r.title}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {r.time}
                                        </p>

                                    </div>

                                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />

                                </button>
                            )
                        )}

                </div>


                <div className="mt-7 rounded-2xl bg-orange-50 border border-orange-100 p-4 flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                    </div>

                    <div>

                        <p className="font-bold text-orange-600 text-sm">
                            Your AI Field Assistant
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Fast answers, accurate info, always with you.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}


// ---------------------------------------------------------------------------
// App — screen router
// ---------------------------------------------------------------------------

const Dashboard = () => {
    const [screen, setScreen] = React.useState("home");
    const [chatQuestion, setChatQuestion] = React.useState("");
    const [activeConversationId, setActiveConversationId] = React.useState(null);

    const openChat = (question = "", conversationId = null) => {
        setChatQuestion(question || "");
        setActiveConversationId(conversationId || null);
        setScreen("chat");
    };

    const openHistory = () => {
        setScreen("history");
    };

    const goHome = () => {
        setScreen("home");
    };


    /*
    |--------------------------------------------------------------------------
    | Chat screen
    |--------------------------------------------------------------------------
    */
    if (screen === "chat") {
        return (
            <ChatScreen
                onBack={goHome}
                initialQuestion={chatQuestion}
                conversationId={activeConversationId}
            />
        );
    }


    /*
    |--------------------------------------------------------------------------
    | History screen
    |--------------------------------------------------------------------------
    */
    if (screen === "history") {
        return (
            <HistoryScreen
                onBack={goHome}
                onSelectConversation={(conversation) =>
                    openChat("", conversation.conversationId)
                }
            />
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Home screen
    |--------------------------------------------------------------------------
    */
    return (
        <HomeScreen
            onOpenChat={openChat}
            onOpenHistory={openHistory}
        />
    );
};


export default React.memo(Dashboard);
