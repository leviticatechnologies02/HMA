import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Bot, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "../../api/public.api";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export const chatbotOptions = [
  "Room Allocation",
  "Fees & Payment",
  "Payment Receipt",
  "Complaints",
  "Room Change",
  "Notices",
  "Mess & Food",
  "My Profile",
  "Warden Contact",
  "Check-in / Check-out",
  "Visitors",
  "Wi-Fi",
  "Emergency Help",
  "Laundry",
  "Hostel Rules",
  "Leave / Outing",
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"options" | "text">("text");
  const [inputText, setInputText] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
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

  const sendMessageToAPI = async (text: string, fallbackResponse?: string) => {

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const data = await sendChatMessage(text);
      const replyText = data?.reply || data?.answer || data?.message || data?.response || fallbackResponse || "I am sorry, I couldn't understand that.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("ChatBot API error:", error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse || "I am having trouble connecting to the server right now. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (optionLabel: string) => {
    setShowOptions(false);
    sendMessageToAPI(optionLabel);
  };

  const handleTextSubmit = () => {
    if (!inputText.trim() || isTyping) return;
    const text = inputText;
    setInputText("");
    sendMessageToAPI(text);
  };


  return (
    <>

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


      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 sm:w-[400px] sm:h-[600px] max-h-[100dvh] sm:max-h-[calc(100vh-200px)] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-40 sm:border border-slate-200 overflow-hidden"
          >

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


            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white text-dark border border-slate-200 rounded-tl-none"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-dark px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>


            <div className="bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)] z-10 flex flex-col">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setInputMode("options")}
                  className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${inputMode === "options"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  Quick Options
                </button>
                <button
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${inputMode === "text"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  Type Message
                </button>
              </div>


              {inputMode === "options" ? (
                showOptions ? (
                  <div className="p-3 sm:p-4 overflow-y-auto max-h-[35vh] sm:max-h-[220px] flex flex-wrap gap-2">
                    {chatbotOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-primary hover:text-white text-slate-700 rounded-full transition-colors border border-slate-200"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white shrink-0 flex justify-center">
                    <button
                      onClick={() => setShowOptions(true)}
                      className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors py-1 px-4"
                    >
                      Ask another question
                    </button>
                  </div>
                )
              ) : (
                <div className="p-3 sm:p-4 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleTextSubmit();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 input bg-slate-50 py-2.5 px-4 rounded-full text-sm border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isTyping}
                      className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hover:bg-primary-hover transition-colors shadow-md"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
