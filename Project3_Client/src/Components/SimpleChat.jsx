import React, { useState } from 'react';
import './SimpleChat.css';

export default function SimpleChat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  function handleSend(e) {
    e.preventDefault();
    setOutput(input); // Replace with chat bot response logic
    setInput('');
  }

  return (
    <div className="simple-chat-container">
      <div className="simple-chat-output-wrap">
        <div className="simple-chat-output-label">Output:</div>
        <div className="simple-chat-output">{output}</div>
      </div>
      <form className="simple-chat-form" onSubmit={handleSend}>
        <input
          className="simple-chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="simple-chat-send">
          Send
        </button>
      </form>
    </div>
  );
}
