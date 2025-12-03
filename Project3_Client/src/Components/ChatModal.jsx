import { useState, useEffect, useRef } from "react";
import pandaLogo from "../assets/PandaLogo.svg"; // translucent logo

export default function ChatModal({ onClose }) {
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { role: "user", text: input }
    ]);

    setInput("");

    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Panda AI is thinking..." }
      ]);
    }, 600);
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
