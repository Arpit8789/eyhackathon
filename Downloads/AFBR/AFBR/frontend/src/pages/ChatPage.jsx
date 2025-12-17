// src/pages/ChatPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiArrowDown, FiUser, FiShoppingBag, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Priya Sharma',
    loyaltyTier: 'Gold',
    loyaltyPoints: 2450
  });
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userData.name}! 👋 I'm your AI shopping assistant. I can help you find the perfect outfits, check inventory at nearby stores, and complete your purchase seamlessly. What would you like to explore today?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [userData.name]);

  // Socket connection
  useEffect(() => {
    const userId = `user_${Date.now()}`;
    const socket = socketService.connect(userId);

    socketService.on('message', (data) => {
      setIsTyping(false);
      const newMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.content || data.message,
        timestamp: new Date().toISOString(),
        type: data.type || 'text',
        products: data.products || null
      };
      setMessages(prev => [...prev, newMessage]);
    });

    socketService.on('session_created', (data) => {
      setSessionId(data.sessionId);
      console.log('Session created:', data.sessionId);
    });

    socketService.on('typing', () => {
      setIsTyping(true);
    });

    return () => {
      socketService.removeAllListeners('message');
      socketService.removeAllListeners('session_created');
      socketService.removeAllListeners('typing');
    };
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll for "scroll to bottom" button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    // Send via socket or API
    if (socketService.isConnected()) {
      socketService.emit('chat_message', {
        message: input,
        sessionId,
        userId: userData.name
      });
      setIsTyping(true);
    } else {
      // Fallback: mock response for demo
      setTimeout(() => {
        const mockResponse = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `I found some great options for you! Here are the top formal shirts under ₹2000...`,
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        setMessages(prev => [...prev, mockResponse]);
      }, 1500);
    }

    setInput('');
  }, [input, sessionId, userData.name]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: '👔', text: 'Show formal shirts', query: 'Show me formal shirts under ₹2000' },
    { icon: '👖', text: 'Trending jeans', query: 'What jeans are trending this season?' },
    { icon: '📍', text: 'Check store inventory', query: 'Check inventory at nearby store' },
    { icon: '🎁', text: 'My rewards', query: 'Show my loyalty rewards and offers' }
  ];

  const handleQuickAction = (query) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat Header */}
        <motion.div 
          className="chat-header glass"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-info">
            <div className="user-avatar">
              <FiUser size={20} />
            </div>
            <div>
              <h3>{userData.name}</h3>
              <div className="status-row">
                <span className="badge badge-success">
                  {userData.loyaltyTier} Member
                </span>
                <span className="points">{userData.loyaltyPoints} pts</span>
              </div>
            </div>
          </div>
          {sessionId && (
            <div className="session-info">
              <span className="session-id">Session: {sessionId.slice(-8)}</span>
            </div>
          )}
        </motion.div>

        {/* Messages Area */}
        <div 
          className="messages-container"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="typing-indicator"
            >
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">AI is thinking...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (shown when no messages) */}
        {messages.length <= 1 && (
          <motion.div 
            className="quick-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="quick-actions-title">Quick actions to get started:</p>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  className="quick-action-btn glass"
                  onClick={() => handleQuickAction(action.query)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-text">{action.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              className="scroll-to-bottom btn-primary"
              onClick={scrollToBottom}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiArrowDown size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <motion.div 
          className="chat-input-container glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Ask for formal shirts under ₹2000 for office..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <motion.button
            className="send-btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, index }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`message-bubble ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="bubble-content">
        {!isUser && (
          <div className="assistant-avatar">
            <span className="gradient-text">AI</span>
          </div>
        )}
        <div className={`bubble-text ${isUser ? 'glass' : ''}`}>
          <p>{message.content}</p>
          {message.products && (
            <div className="products-grid">
              {message.products.map((product, idx) => (
                <ProductCard key={idx} product={product} />
              ))}
            </div>
          )}
          <span className="timestamp">
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  return (
    <motion.div
      className="product-card glass"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="product-image">
        <img 
          src={product.image || 'https://via.placeholder.com/200'} 
          alt={product.name}
          loading="lazy"
        />
        {product.discount && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <div className="price-row">
          {product.originalPrice && (
            <span className="original-price">₹{product.originalPrice}</span>
          )}
          <span className="final-price">₹{product.price}</span>
        </div>
        <div className="product-meta">
          <span className="badge badge-success">
            <FiMapPin size={12} /> Store-007
          </span>
        </div>
        <div className="product-actions">
          <button className="btn-secondary">Reserve</button>
          <button className="btn-primary">Add to Cart</button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
