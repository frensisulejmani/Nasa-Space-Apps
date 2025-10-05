import React, { useState, useEffect, useRef } from "react";

const DUMMY_API_KEY =
    "xxxx(api)";

function NasaChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I’m your NASA AI Expert. Ask me anything about planets, stars, or space exploration!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = { sender: "user", text: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DUMMY_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful and enthusiastic NASA expert. Keep answers concise, factual, and exciting.",
            },
            ...newMessages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

      const data = await res.json();
      const aiText =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn’t get a response right now.";

      setMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Error: ${error.message}. Check your internet or API key.`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950 p-4
                 border-2 border-[#573482] rounded-xl
                 shadow-[0_0_25px_#573482] transition">
      {/* Header with Close Button */}
      <div className="flex justify-between items-center mb-3 border-b-2 border-[#573482] pb-2">
        <h3 className="text-[#573482] font-semibold text-lg">
          NASA AI Assistant
        </h3>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-600 text-xl transition"
          title="Close Chat"
        >
          ✖
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-3 space-y-3 shadow-inner border border-[#573482]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm border-2 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white border-blue-600 rounded-br-none"
                  : "bg-[#573482] text-white border-[#573482] rounded-tl-none"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            isSending
              ? "Waiting for response..."
              : "Ask about space, planets, or NASA missions..."
          }
          disabled={isSending}
          className="flex-1 p-2.5 rounded-lg border border-[#573482] bg-gray-800 text-white placeholder-gray-400 focus:ring-[#573482] focus:border-[#573482] transition disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-[#573482] text-white font-semibold hover:bg-[#8663B0] transition disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default NasaChatbot;
