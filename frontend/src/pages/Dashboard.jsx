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
import RecentConversationMessage from "./RecentConversationsScreen";


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

    const fetchRecentConversations = React.useCallback(async () => {
        try {
            setIsLoadingRecent(true);
            setRecentError(null);
            const response = await axiosInstance.get("/conversations", { params: { limit: 3 } });
            const apiData = response?.data?.data || [];
            setRecentConversations(apiData.map(normalizeConversation));
        } catch (error) {
            console.error("Failed to fetch recent conversations:", error);
            setRecentError(error?.response?.data?.message || "Unable to load recent conversations.");
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
            if (recognitionRef.current) {
                // Prevent navigation if the component unmounts while listening.
                voiceRecognitionFailedRef.current = true;
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
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

                {voiceError && (
                    <p className="text-xs text-red-500 mt-2 px-1" role="alert">
                        {voiceError}
                    </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                    <span>
                        Type your question or use{" "}
                    </span>

                    <span
                        className={`font-medium cursor-pointer ${
                            isListening ? "text-red-500" : "text-orange-500"
                        }`}
                        onClick={handleVoiceSearch}
                    >
                        {isListening ? "Stop voice input" : "Voice to ask"}
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
                        onClick={onOpenHistory}
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

                    {!isLoadingRecent && recentError && (
                        <div className="text-sm text-red-400 py-4 text-center">
                            {recentError}
                        </div>
                    )}

                    {!isLoadingRecent && !recentError && recentConversations.length === 0 && (
                        <div className="text-sm text-gray-400 py-4 text-center">
                            No recent conversations
                        </div>
                    )}

                    {!isLoadingRecent && !recentError && recentConversations.map(
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
    const openHistory = () => setScreen("history");
    const goHome = () => setScreen("home");


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
            <RecentConversationMessage
                onBack={goHome}
                onSelectConversation={(conversation) => openChat("", conversation.conversationId || conversation.id)}
                limit={50}
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
