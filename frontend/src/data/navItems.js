import {
  BellDot,
  Bot,
  BarChart3,
  Calculator,
  BookOpen,
} from "lucide-react";

export const topNavItems = [
  { id: "notification", label: "Notification", url: "#", level: 0, icon: BellDot },
  { id: "profile", label: "Profile", url: "/profile", level: 0 },
]

export const bottomNavItems = [
  { id: "assistant", label: "Ask Sahayak", url: "/dashboard", level: 0, icon: Bot },
  { id: "performance", label: "Performance", url: "/performance", level: 0, icon: BarChart3 },
  { id: "calculator", label: "Calculator", url: "/calculator", level: 0, icon: Calculator },
  { id: "knowledge", label: "Knowledge Base", url: "/knowledge-base", level: 0, icon: BookOpen },
]