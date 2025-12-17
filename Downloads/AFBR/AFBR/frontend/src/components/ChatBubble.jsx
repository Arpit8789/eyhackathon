// frontend/src/components/ChatBubble.jsx
import React from 'react';

const ChatBubble = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`chat-bubble-row ${isUser ? 'right' : 'left'}`}
    >
      <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
        <div className="chat-content">{content}</div>
        {timestamp && (
          <div className="chat-meta">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
