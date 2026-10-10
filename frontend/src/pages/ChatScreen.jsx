import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    Mic,
    Send,
    CheckCheck,
    Gift,
    ShieldCheck,
    Wrench,
    Users,
    Bot,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeBottom } from "../animations/allVariants";
import axiosInstance from "../config/axiosInstance";
import { socket } from "../socket/socket";

const QUICK_ACTIONS = [
    "How to install?",
    "Compare with other sheets",
    "Find dealer near me",
];

const SUGGESTION_ICONS = {
    "Current Schemes": Gift,
    "Warranty Info": ShieldCheck,
    "Installation Guide": Wrench,
    "Compare with other sheets": Users,
};

function formatTime(date = new Date()) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    let hours = value.getHours();
    const minutes = String(value.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
}

function getMessageText(message) {
    if (typeof message === "string") {
        return message;
    }

    if (typeof message?.content === "string") {
        return message.content;
    }

    if (typeof message?.message === "string") {
        return message.message;
    }

    if (typeof message?.text === "string") {
        return message.text;
    }

    if (typeof message?.response === "string") {
        return message.response;
    }

    return "";
}

function normalizeConversationMessage(message) {
    const sender = String(message?.sender || message?.role || "").toLowerCase();

    return {
        id:
            message?.messageId ||
            message?._id ||
            `message-${Date.now()}-${Math.random()}`,
        from: sender === "user" ? "user" : "bot",
        text: getMessageText(message),
        time: formatTime(message?.createdAt || message?.timestamp),
        metadata: message?.metadata || null,
    };
}

function getErrorMessage(payload) {
    if (typeof payload === "string") {
        return payload;
    }

    return (
        payload?.message ||
        payload?.error ||
        payload?.data?.message ||
        "Unable to process your message. Please try again."
    );
}

const ChatScreen = ({
    onBack = () => {},
    initialQuestion = "",
    conversationId: initialConversationId = null,
}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const [chatError, setChatError] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [activeConversationId, setActiveConversationId] = useState(
        initialConversationId
    );

    const bottomRef = useRef(null);
    const initialQuestionSentRef = useRef(false);
    const pendingQuestionRef = useRef(initialQuestion);
    const pendingMessageRef = useRef(null);
    const activeConversationIdRef = useRef(initialConversationId);
    const typingRef = useRef(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const voiceTranscriptRef = useRef("");

    const updateConversationId = useCallback((id) => {
        if (!id) return;

        activeConversationIdRef.current = id;
        setActiveConversationId(id);
    }, []);

    const setTyping = useCallback((value) => {
        typingRef.current = value;
        setIsTyping(value);
    }, []);

    /*
     * Socket connection and chat event listeners.
     *
     * Register listeners before sending the initial question.
     */
    useEffect(() => {
        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const handleConnectError = (error) => {
            setIsConnected(false);
            console.error("Socket connection error:", error.message);
        };

        const handleChatStarted = (payload = {}) => {
            const id = payload?.conversationId || payload?.data?.conversationId;
            if (id) {
                updateConversationId(id);
            }

            const userMessageId = payload?.userMessageId ||
                payload?.messageId ||
                payload?.data?.userMessageId ||
                payload?.data?.messageId;

            if (userMessageId && pendingMessageRef.current) {
                const pendingId = pendingMessageRef.current;
                setMessages((previous) => previous.map((message) =>
                    message.id === pendingId ? { ...message, id: userMessageId } : message
                ));
                pendingMessageRef.current = userMessageId;
            }

            setChatError("");
        };

        const handleChatCompleted = (payload = {}) => {
            const id = payload?.conversationId || payload?.data?.conversationId;
            if (id) updateConversationId(id);

            const assistantMessage = payload?.message && typeof payload.message === "object"
                ? payload.message
                : payload?.data?.message && typeof payload.data.message === "object" ? payload.data.message : null;

            const text = getMessageText(assistantMessage) ||
                getMessageText(payload?.message) ||
                getMessageText(payload?.data?.message) ||
                getMessageText(payload?.text) ||
                getMessageText(payload?.data?.text);

            if (text) {
                const messageId = assistantMessage?.messageId ||
                    assistantMessage?._id ||
                    payload?.messageId ||
                    payload?.data?.messageId ||
                    `assistant-${Date.now()}`;

                setMessages((previous) => {
                    // Avoid appending the same server message twice.
                    if (previous.some((message) => message.id === messageId)) return previous;

                    return [
                        ...previous,
                        {
                            id: messageId,
                            from: "bot",
                            text,
                            time: formatTime(assistantMessage?.createdAt || new Date()),
                            metadata: assistantMessage?.metadata || payload?.metadata || null,
                        },
                    ];
                });
            } else {
                console.warn("chat:completed received without a readable response:", payload);
                setChatError("The server completed the request but returned no readable message.");
            }

            pendingMessageRef.current = null;
            setTyping(false);
        };

        const handleChatError = (payload) => {
            setChatError(getErrorMessage(payload));
            pendingMessageRef.current = null;
            setTyping(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("chat:started", handleChatStarted);
        socket.on("chat:completed", handleChatCompleted);
        socket.on("chat:error", handleChatError);

        setIsConnected(socket.connected);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("chat:started", handleChatStarted);
            socket.off("chat:completed", handleChatCompleted);
            socket.off("chat:error", handleChatError);
        };
    }, [setTyping, updateConversationId]);

    /*
     * Load persisted messages when opening an existing conversation.
     */
    useEffect(() => {
        let cancelled = false;

        const loadHistory = async () => {
            if (!initialConversationId) {
                setMessages([]);
                setHistoryError("");
                setIsLoadingHistory(false);
                return;
            }

            try {
                setIsLoadingHistory(true);
                setHistoryError("");
                const response = await axiosInstance.get(`/conversations/${initialConversationId}/messages`, { params: { limit: 100 } });
                if (cancelled) return;
                const apiMessages = response?.data?.data || [];

                setMessages(apiMessages.map(normalizeConversationMessage).filter((message) => message.text));
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to load conversation:", error);
                setHistoryError(error?.response?.data?.message || "Unable to load conversation.");
            } finally {
                if (!cancelled) {
                    setIsLoadingHistory(false);
                }
            }
        };

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [initialConversationId]);


    /*
     * Send a message through the backend AI socket handler.
     */
    const sendMessage = useCallback((text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed || typingRef.current) return;
        if (!socket.connected) {
            setChatError("The chat connection is unavailable. Please wait for it to reconnect.");
            return;
        }

        const optimisticId = `user-${Date.now()}`;
        pendingMessageRef.current = optimisticId;
        setMessages((previous) => [
            ...previous,
            {
                id: optimisticId,
                from: "user",
                text: trimmed,
                time: formatTime(),
                metadata: null,
            },
        ]);

        setInput("");
        setChatError("");
        setTyping(true);

        const payload = {
            message: trimmed,
            ...(activeConversationIdRef.current
                ? { conversationId: activeConversationIdRef.current }
                : {}),
        };
        console.log("[CHAT UI] Emitting chat:query:", payload);
        socket.timeout(10000).emit("chat:query", payload, (error, acknowledgement) => {
            if (error) {
                console.error("[CHAT UI] Server acknowledgement timed out.");
                setChatError("The server did not acknowledge your message. Please try again.");
                pendingMessageRef.current = null;
                setTyping(false);
                return;
            }

            console.log("[CHAT UI] Backend acknowledgement:", acknowledgement);
        });
    }, [setTyping]);


    /*
     * Automatically submit the question that opened a new chat.
     * If the socket isn't connected yet, wait for the connect event.
     */
    useEffect(() => {
        if (
            !initialQuestion ||
            initialQuestionSentRef.current ||
            initialConversationId ||
            !isConnected
        ) return;

        if (!pendingQuestionRef.current) return;

        initialQuestionSentRef.current = true;
        const question = pendingQuestionRef.current;
        pendingQuestionRef.current = null;
        sendMessage(question);
    }, [
        initialQuestion,
        initialConversationId,
        isConnected,
        sendMessage,
    ]);

    /*
     * Scroll to the latest message.
     */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, isLoadingHistory]);


    // Voice search    
    const handleVoiceInput = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setChatError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN";
            recognition.interimResults = false;
            recognition.continuous = false;

            recognition.onstart = () => {
                voiceTranscriptRef.current = "";
                setIsListening(true);
                setChatError("");
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .slice(event.resultIndex)
                    .map((result) => result[0]?.transcript || "")
                    .join(" ")
                    .trim();

                if (transcript) {
                    voiceTranscriptRef.current = transcript;
                    setInput(transcript);
                }
            };

            recognition.onerror = (event) => {
                setIsListening(false);

                if (event.error !== "aborted") {
                    setChatError(event.error === "not-allowed"
                        ? "Microphone access was denied. Please allow microphone access in your browser."
                        : "Voice recognition failed. Please try again."
                    );
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                recognitionRef.current = null;
                const transcript = voiceTranscriptRef.current.trim();
                voiceTranscriptRef.current = "";
                if (transcript) {
                    sendMessage(transcript);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("Voice input error:", error);
            recognitionRef.current = null;
            setIsListening(false);
            setChatError("Unable to start voice recognition.");
        }
    }, [isListening, sendMessage]);

    // voice recognition cleanup
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            recognitionRef.current = null;
        };
    }, []);


    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(input);
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                variants={fadeBottom}
                initial="hidden"
                animate="show"
                className="w-full max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative"
            >
                <style>
                    {`.no-scrollbar::-webkit-scrollbar { display: none; }`}
                </style>

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1 -ml-1 text-gray-900"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 leading-tight truncate">
                            Sahayak AI
                        </p>

                        <div className="flex items-center gap-1">
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    isConnected
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            />

                            <span className="text-xs text-gray-500">
                                {isConnected ? "Connected" : "Connecting..."}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Connection status */}
                {!isConnected && (
                    <div className="px-4 pt-3">
                        <p className="text-xs text-amber-600 text-center">
                            Reconnecting to Sahayak AI...
                        </p>
                    </div>
                )}

                {/* Loading existing conversation */}
                {isLoadingHistory && (
                    <div className="px-4 pt-3">
                        <p className="text-xs text-gray-400 text-center">
                            Loading conversation...
                        </p>
                    </div>
                )}

                {/* History error */}
                {historyError && (
                    <div className="px-4 pt-3">
                        <p className="text-xs text-red-500 text-center">
                            {historyError}
                        </p>
                    </div>
                )}

                {/* Chat error */}
                {chatError && (
                    <div className="px-4 pt-3">
                        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                            {chatError}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {!isLoadingHistory && messages.length === 0 && (
                        <div className="py-10 text-center">
                            <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-orange-500" />
                            </div>

                            <p className="mt-3 text-sm font-medium text-gray-700">
                                How can I help you today?
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Ask about products, prices, schemes, or installation.
                            </p>
                        </div>
                    )}

                    {messages.map((message) =>
                        message.from === "user" ? (
                            <div
                                key={message.id}
                                className="flex justify-end"
                            >
                                <div
                                    className="bg-orange-100 rounded-2xl rounded-br-md px-4 py-3"
                                    style={{ maxWidth: "80%" }}
                                >
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                        {message.text}
                                    </p>

                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-xs text-gray-500">
                                            {message.time}
                                        </span>

                                        <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={message.id} className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>

                                <div
                                    className="min-w-0"
                                    style={{ maxWidth: "85%" }}
                                >
                                    <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                            {message.text}
                                        </p>

                                        <p className="text-xs text-gray-400 text-right mt-2">
                                            {message.time}
                                        </p>
                                    </div>

                                    {message.suggestions && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 mb-2">
                                                You can also ask:
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {message.suggestions.map((suggestion) => {
                                                    const Icon =
                                                        SUGGESTION_ICONS[
                                                            suggestion
                                                        ] || Gift;

                                                    return (
                                                        <button
                                                            key={suggestion}
                                                            onClick={() =>
                                                                sendMessage(
                                                                    suggestion
                                                                )
                                                            }
                                                            disabled={
                                                                isTyping ||
                                                                !isConnected
                                                            }
                                                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-50"
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            {suggestion}
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

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-white" />
                            </div>

                            <div className="bg-white rounded-2xl rounded-tl-md border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-1">
                                {[0, 150, 300].map((delay) => (
                                    <span
                                        key={delay}
                                        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                                        style={{
                                            animationDelay: `${delay}ms`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Quick actions */}
                <div
                    className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar"
                    style={{ scrollbarWidth: "none" }}
                >
                    {QUICK_ACTIONS.map((question) => (
                        <button
                            key={question}
                            onClick={() => sendMessage(question)}
                            disabled={
                                isTyping ||
                                !isConnected ||
                                isLoadingHistory
                            }
                            className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-50"
                        >
                            {question}
                        </button>
                    ))}
                </div>

                {/* Input bar */}
                <form
                    onSubmit={handleSubmit}
                    className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2"
                >
                    <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
                        <input
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            type="text"
                            maxLength={10000}
                            placeholder="Ask anything..."
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        disabled={isTyping || isLoadingHistory}
                        aria-label={isListening ? "Stop voice input" : "Start voice input"}
                        aria-pressed={isListening}
                        title={isListening ? "Stop voice input" : "Voice input"}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${
                            isListening
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>

                    <button
                        type="submit"
                        disabled={
                            isTyping ||
                            !isConnected ||
                            !input.trim() ||
                            isLoadingHistory
                        }
                        className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 hover:bg-orange-600 transition-colors disabled:opacity-50"
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default React.memo(ChatScreen);