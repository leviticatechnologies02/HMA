import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export const chatbotResponses = [
  {
    keywords: ["hello", "hi", "hey"],
    answer: "Hello 👋 Welcome to Hostel Management System. How can I help you today?",
    label: "Hello",
  },
  {
    keywords: ["room", "room allocation", "allocated room"],
    answer: "You can view your allocated room by navigating to Student Dashboard → My Hostel. If no room is assigned, please contact the hostel administrator.",
    label: "Room Allocation",
  },
  {
    keywords: ["payment", "fees", "fee", "pay"],
    answer: "Go to Student Dashboard → Payments to pay your hostel fee online. You can also check your payment history there.",
    label: "Fees & Payment",
  },
  {
    keywords: ["receipt", "invoice", "payment receipt"],
    answer: "After a successful payment, your receipt will be available in Student Dashboard → Payments. You can download or print it anytime.",
    label: "Payment Receipt",
  },
  {
    keywords: ["complaint", "issue", "maintenance", "problem"],
    answer: "Go to Student Dashboard → Complaints → Create Complaint. Select the complaint category, provide details, and submit your request.",
    label: "Complaints",
  },
  {
    keywords: ["room change", "change room", "shift room"],
    answer: "To request a room change, go to Student Dashboard → Room Change Request (or contact your hostel administrator if this option is unavailable). Approval is required.",
    label: "Room Change",
  },
  {
    keywords: ["notice", "announcement", "notifications"],
    answer: "You can view all hostel notices and announcements in Student Dashboard → Notifications.",
    label: "Notices",
  },
  {
    keywords: ["mess", "food", "meal", "breakfast", "lunch", "dinner"],
    answer: "Mess Timings:\n\n🍳 Breakfast: 7:30 AM - 9:30 AM\n🍛 Lunch: 12:30 PM - 2:30 PM\n☕ Evening Snacks: 4:30 PM - 5:30 PM\n🍽 Dinner: 7:00 PM - 9:00 PM\n\nWeekly menu is available in the Mess section.",
    label: "Mess & Food",
  },
  {
    keywords: ["profile", "student profile", "my profile"],
    answer: "Go to Student Dashboard → My Profile to view or update your personal information such as phone number, address, emergency contact, and profile photo.",
    label: "My Profile",
  },
  {
    keywords: ["warden", "contact", "phone", "admin"],
    answer: "You can find the hostel warden's contact details in Student Dashboard → Contact Information or from the Hostel Office.",
    label: "Warden Contact",
  },
  {
    keywords: ["check in", "check-in", "check out", "checkout"],
    answer: "For hostel check-in or check-out, contact the hostel office and complete the required formalities. Make sure all pending dues are cleared before check-out.",
    label: "Check-in / Check-out",
  },
  {
    keywords: ["visitor", "guest", "parents"],
    answer: "Visitors are allowed only during approved visiting hours. Every visitor must register at the hostel entrance and follow hostel rules.",
    label: "Visitors",
  },
  {
    keywords: ["wifi", "internet", "network"],
    answer: "Wi-Fi is available throughout the hostel. If you face connectivity issues, please raise a maintenance complaint or contact the hostel administrator.",
    label: "Wi-Fi",
  },
  {
    keywords: ["security", "emergency", "help"],
    answer: "For emergencies, immediately contact the hostel warden or security staff. Emergency contact numbers are available in the Contact Information section.",
    label: "Emergency Help",
  },
  {
    keywords: ["laundry", "washing"],
    answer: "Laundry services are available on scheduled days. Please check the Laundry section or hostel notice board for timings.",
    label: "Laundry",
  },
  {
    keywords: ["hostel rules", "rules"],
    answer: "Hostel rules include maintaining cleanliness, avoiding noise after quiet hours, respecting hostel property, and following visitor and attendance regulations.",
    label: "Hostel Rules",
  },
  {
    keywords: ["leave", "outing", "permission"],
    answer: "To leave the hostel, submit an outing or leave request through the Student Dashboard (if enabled) or obtain permission from the hostel administrator.",
    label: "Leave / Outing",
  },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello 👋 Welcome to Hostel Management System. How can I help you today?",
      sender: "bot",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleOptionClick = (responseObj: typeof chatbotResponses[0]) => {
    setShowOptions(false);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: responseObj.label,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseObj.answer,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-hover transition-colors"
              aria-label="Open Chatbot"
            >
              <MessageSquare className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 sm:w-[400px] sm:h-[600px] max-h-[100dvh] sm:max-h-[calc(100vh-200px)] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-40 sm:border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">Nestora Assistant</h3>
                  <p className="text-xs text-white/80">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white text-dark border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Options Area (Replaces Text Input) */}
            {showOptions ? (
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 overflow-y-auto max-h-[40vh] sm:max-h-[250px] flex flex-wrap gap-2 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)] z-10">
                {chatbotResponses
                  .filter((r) => r.label !== "Hello") // Skip the basic hello button as it's just a greeting
                  .map((responseObj, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(responseObj)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-primary hover:text-white text-slate-700 rounded-full transition-colors border border-slate-200"
                  >
                    {responseObj.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white border-t border-slate-100 shrink-0 flex justify-center z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)]">
                <button
                  onClick={() => setShowOptions(true)}
                  className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors py-1 px-4"
                >
                  Ask another question
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
