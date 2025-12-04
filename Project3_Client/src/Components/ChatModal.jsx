import { useState, useEffect, useRef } from "react";
import pandaLogo from "../assets/PandaLogo.svg"; // translucent logo

export default function ChatModal({ onClose }) {
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchAIResponse(prompt_text) {
    try {
      const response = await fetch('/api/ask-gen-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_text })
      });
      const data = await response.json();
      return data.response_text;
    } catch (error) {
      console.error('Error:', error);
      return "Error fetching AI response.";
    }
  }


  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { role: "user", text: input }
    ]);

    // Show thinking message
    setMessages(prev => [
      ...prev,
      { role: "ai", text: "Panda AI is thinking..." }
    ]);

    setInput("");

    // Fetch AI response
    let aiReply = await fetchAIResponse(input);

    // Remove thinking message and add AI reply
    setMessages(prev => [
      ...prev.filter(msg => msg.text !== "Panda AI is thinking..."),
      { role: "ai", text: aiReply }
    ]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks inside modal from closing */}
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="chat-header">
          <span>Panda AI Assistant</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* MESSAGES */}
        <div className={`chat-messages ${messages.length === 0 ? "empty" : ""}`}>
          
          {/* Empty State Text */}
          {messages.length === 0 && (
            <div className="chat-watermark">
              <p>Ask Panda AI anything</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              {msg.text}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="chat-input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>

      </div>
    </div>
  );
}
