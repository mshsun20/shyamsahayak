import React from 'react'
import {
  Bot,
  ChevronRight,
  Gift,
  Mic,
  Phone,
  Send,
  Shield,
  Sparkles,
  Tag,
  Users,
  Wrench,
  X,
} from "lucide-react";
import "../styles/dashboard.css";
import { useNavigate } from 'react-router';

/* =========================================================
   STATIC DATA
========================================================= */

const INITIAL_POPULAR_QUESTIONS = [
  {
    id: 1,
    title: "Product Price",
    description: "Check latest prices",
    icon: Tag,
    iconClass: "orange",
    question: "What is the latest price of Tiger Premium Roofing Sheet?",
  },
  {
    id: 2,
    title: "Current Schemes",
    description: "View active schemes",
    icon: Gift,
    iconClass: "green",
    question: "What schemes are currently available?",
  },
  {
    id: 3,
    title: "Warranty Info",
    description: "Warranty details",
    icon: Shield,
    iconClass: "blue",
    question: "What is the warranty period for roofing sheets?",
  },
  {
    id: 4,
    title: "Installation Guide",
    description: "How to install",
    icon: Wrench,
    iconClass: "purple",
    question: "How should roofing sheets be installed properly?",
  },
  {
    id: 5,
    title: "Competitor Info",
    description: "Compare products",
    icon: Users,
    iconClass: "orange",
    question: "Compare Tiger roofing sheets with competitor products.",
  },
  {
    id: 6,
    title: "Dealer Contact",
    description: "Find nearest dealer",
    icon: Phone,
    iconClass: "green",
    question: "Find the nearest Tiger roofing sheet dealer.",
  },
];

const INITIAL_RECENT_CONVERSATIONS = [
  {
    id: 1,
    question: "What is the price of Tiger Premium Roofing Sheet?",
    time: "Today, 10:30 AM",
  },
  {
    id: 2,
    question: "What schemes are available this month?",
    time: "Yesterday, 04:15 PM",
  },
  {
    id: 3,
    question: "How to install roofing sheets properly?",
    time: "2 days ago",
  },
];

const Dashboard = () => {
  const [question, setQuestion] = React.useState("");
  const [popularQuestions, setPopularQuestions] = React.useState(
    INITIAL_POPULAR_QUESTIONS
  );

  const [recentConversations, setRecentConversations] = React.useState(
    INITIAL_RECENT_CONVERSATIONS
  );

  const [showAllPopular, setShowAllPopular] = React.useState(false);
  const [showAllRecent, setShowAllRecent] = React.useState(false);

  const [isListening, setIsListening] = React.useState(false);
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [showAssistantInfo, setShowAssistantInfo] = React.useState(false);

  const recognitionRef = React.useRef(null);
  // const navig = useNavigate()

  /* =======================================================
     VOICE SEARCH
  ======================================================= */

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      Window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setQuestion(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  /* =======================================================
     SEND QUESTION
  ======================================================= */

  const handleSubmit = (event) => {
    event?.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    const newConversation = {
      id: Date.now(),
      question: trimmedQuestion,
      time: "Just now",
    };

    setRecentConversations((previous) => [
      newConversation,
      ...previous,
    ]);

    setQuestion("");

    /*
      Replace this section with your API call later.

      Example:

      await axios.post("/api/chat", {
        message: trimmedQuestion
      });
    */

    setSelectedConversation({
      ...newConversation,
      answer:
        "This is a static test response. Connect your Claude/AI API here to return the actual answer.",
    });
  };

  /* =======================================================
     POPULAR QUESTION CLICK
  ======================================================= */

  const handlePopularQuestion = (item) => {
    setQuestion(item.question);
  };

  /* =======================================================
     RECENT CONVERSATION CLICK
  ======================================================= */

  // const handleConversations = () => {
  //   navig("/recent-conversations");
  // }

  const handleRecentConversation = (conversation) => {
    setSelectedConversation({
      ...conversation,
      answer:
        "This is a static conversation response. Your actual AI conversation can be loaded here.",
    });
  };

  /* =======================================================
     DATA TO DISPLAY
  ======================================================= */

  const displayedPopular = showAllPopular
    ? popularQuestions
    : popularQuestions.slice(0, 6);

  const displayedRecent = showAllRecent
    ? recentConversations
    : recentConversations.slice(0, 3);

  return (
    <main className="sahayak-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="sahayak-header">
        <h1>
          Hi Raj! <span className="wave">👋</span>
        </h1>

        <p>How can I help you today?</p>
      </section>

      {/* =====================================================
          QUESTION BOX
      ===================================================== */}

      <section className="question-card">

        <form onSubmit={handleSubmit}>

          <div className="question-input-row">

            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything..."
              aria-label="Ask anything"
            />

            <button
              type="button"
              className={`voice-button ${isListening ? "voice-active" : ""
                }`}
              onClick={handleVoiceSearch}
              aria-label="Voice search"
            >
              <Mic size={27} strokeWidth={2.2} />
            </button>

            <button
              type="submit"
              className="send-button"
              aria-label="Send question"
            >
              <Send size={29} strokeWidth={2.2} />
            </button>

          </div>

          <div className="question-helper">

            <Sparkles
              size={21}
              strokeWidth={2.5}
              className="sparkle-icon"
            />

            <span>Type your question or use</span>

            <button
              type="button"
              onClick={handleVoiceSearch}
              className="voice-link"
            >
              voice to ask
            </button>

            <span>Sahayak AI</span>

          </div>

        </form>
      </section>

      {/* =====================================================
          POPULAR QUESTIONS
      ===================================================== */}

      <section className="section-block">

        <div className="section-heading">

          <h2>Popular Questions</h2>

          <button
            className="view-all-button"
            onClick={() => setShowAllPopular((value) => !value)}
          >
            {showAllPopular ? "Show less" : "View all"}
          </button>

        </div>

        <div className="popular-grid">

          {displayedPopular.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className="popular-card"
                onClick={() => handlePopularQuestion(item)}
              >

                <span
                  className={`popular-icon ${item.iconClass}`}
                >
                  <Icon size={27} strokeWidth={2.4} />
                </span>

                <span className="popular-content">

                  <strong>{item.title}</strong>

                  <small>{item.description}</small>

                </span>

              </button>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          RECENT CONVERSATIONS
      ===================================================== */}

      <section className="section-block recent-section">

        <div className="section-heading">

          <h2>Recent Conversations</h2>

          <button
            className="view-all-button"
            onClick={() => setShowAllRecent((value) => !value)}
            // onClick={() => handleConversations()}
          >
            {showAllRecent ? "Show less" : "View all"}
          </button>

        </div>

        <div className="recent-list">

          {displayedRecent.map((conversation) => (

            <button
              key={conversation.id}
              className="recent-card"
              onClick={() =>
                handleRecentConversation(conversation)
              }
            >

              <span className="recent-bot-icon">
                <Bot size={28} strokeWidth={2.2} />
              </span>

              <span className="recent-content">

                <strong>{conversation.question}</strong>

                <small>{conversation.time}</small>

              </span>

              <ChevronRight
                className="recent-arrow"
                size={31}
                strokeWidth={2}
              />

            </button>

          ))}

        </div>
      </section>

      {/* =====================================================
          AI FIELD ASSISTANT
      ===================================================== */}

      <button
        className="assistant-card"
        onClick={() => setShowAssistantInfo(true)}
      >

        <span className="assistant-icon">
          <Shield size={34} strokeWidth={2.2} />
        </span>

        <span className="assistant-content">

          <strong>Your AI Field Assistant</strong>

          <span>
            Fast answers, accurate info, always with you.
          </span>

        </span>

      </button>

      {/* =====================================================
          CONVERSATION MODAL
      ===================================================== */}

      {selectedConversation && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedConversation(null)}
        >

          <div
            className="conversation-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setSelectedConversation(null)}
            >
              <X size={24} />
            </button>

            <div className="modal-bot-icon">
              <Bot size={30} />
            </div>

            <h3>{selectedConversation.question}</h3>

            <span className="modal-time">
              {selectedConversation.time}
            </span>

            <div className="modal-answer">
              {selectedConversation.answer}
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          AI ASSISTANT MODAL
      ===================================================== */}

      {showAssistantInfo && (

        <div
          className="modal-overlay"
          onClick={() => setShowAssistantInfo(false)}
        >

          <div
            className="assistant-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowAssistantInfo(false)}
            >
              <X size={24} />
            </button>

            <div className="assistant-modal-icon">
              <Shield size={38} />
            </div>

            <h3>Your AI Field Assistant</h3>

            <p>
              Sahayak AI helps you quickly access product prices,
              schemes, warranty information, installation guidance
              and dealer information.
            </p>

            <button
              className="assistant-start-button"
              onClick={() => {
                setShowAssistantInfo(false);

                document
                  .querySelector(".question-card")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
            >
              Ask Sahayak AI
            </button>

          </div>

        </div>
      )}

    </main>
  )
}

export default React.memo(Dashboard)








