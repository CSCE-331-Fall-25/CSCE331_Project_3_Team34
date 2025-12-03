import React, { useState } from 'react';

export default function SimpleChat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  function handleSend(e) {
    e.preventDefault();
    setOutput(input); // Replace with chat bot response logic
    setInput('');
  }

  return (
    <div style={{ maxWidth: 320, margin: '24px auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Output:</div>
        <div
          style={{
            minHeight: 32,
            maxHeight: 120,
            background: '#f8f8f8',
            padding: 8,
            borderRadius: 4,
            overflowY: 'auto',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {output}
        </div>
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff' }}>
          Send
        </button>
      </form>
    </div>
  );
}
