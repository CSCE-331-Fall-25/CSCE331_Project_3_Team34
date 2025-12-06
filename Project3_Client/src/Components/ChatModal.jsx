import { useState, useEffect, useRef } from "react";
import pandaLogo from "../assets/PandaLogo.svg"; // translucent logo

export default function ChatModal({ onClose, onAddOrder }) {
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text:  <span>Welcome to Panda Express, I am Bob Ross Panda! Please let me know how can I assist you today!</span>
      }
    ]);
  }, []);

  
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

    // Check for JSON block (Markdown format)
    let jsonMatch = aiReply.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : null;
    let matchSource = jsonMatch ? jsonMatch[0] : null;

    // Fallback: Check for raw JSON if Markdown is missing
    if (!jsonString) {
        // Match either "add_order" or "add_orders"
        const rawMatch = aiReply.match(/(\{[\s\S]*"action":\s*"add_orders?"[\s\S]*\})/);
        if (rawMatch) {
            jsonString = rawMatch[1];
            matchSource = rawMatch[0];
        }
    }

    if (jsonString) {
        try {
            const command = JSON.parse(jsonString);
            if (command.action === "add_order" && onAddOrder) {
                // Legacy support or single item
                onAddOrder([command.order]);
                aiReply = aiReply.replace(matchSource, "").trim();
                aiReply += "\n\n(Order added to cart)";
            } else if (command.action === "add_orders" && onAddOrder) {
                // New support for multiple items
                onAddOrder(command.orders);
                aiReply = aiReply.replace(matchSource, "").trim();
                aiReply += "\n\n(Orders added to cart)";
            }
        } catch (e) {
            console.error("Failed to parse AI command", e);
        }
    }

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
