// frontend/src/pages/ChatPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatBubble from '../components/ChatBubble.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import ProductCard from '../components/ProductCard.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import {
  addMessage,
  setSessionId,
  setTyping
} from '../store/chatSlice.js';
import { setUser } from '../store/userSlice.js';
import {
  sendChatMessage,
  listProducts,
  createOrder,
  registerUser
} from '../services/apiService.js';
import {
  initSocket,
  joinChatRoom,
  onChatMessage,
  offChatMessage
} from '../services/socketService.js';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { sessionId, messages, isTyping, channel } = useSelector((s) => s.chat);
  const user = useSelector((s) => s.user);

  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);
  const [demoCart, setDemoCart] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    const socket = initSocket();

    const handler = (msg) => {
      if (!msg || !msg.content) return;
      dispatch(
        addMessage({
          id: `${Date.now()}-${Math.random()}`,
          role: msg.role || 'assistant',
          content: msg.content,
          intent: msg.intent,
          timestamp: new Date().toISOString()
        })
      );
      dispatch(setTyping(false));
    };

    onChatMessage(handler);

    return () => {
      offChatMessage(handler);
    };
  }, [dispatch]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const demoName = 'Priya (Demo)';
        const demoEmail = `demo-${Date.now()}@example.com`;
        const res = await registerUser({ name: demoName, email: demoEmail });
        const u = res.data;

        dispatch(
          setUser({
            id: u.id,
            name: u.name,
            email: u.email,
            loyaltyTier: u.loyaltyTier,
            loyaltyPoints: u.loyaltyPoints
          })
        );

        const prodRes = await listProducts({});
        setProducts(prodRes.data || []);
      } catch (e) {
        console.error('Bootstrap error', e);
      }
    };

    bootstrap();
  }, [dispatch]);

  useEffect(() => {
    if (!sessionId) return;
    joinChatRoom(sessionId);
  }, [sessionId]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const now = new Date().toISOString();
    const userMsg = {
      id: `${now}-user`,
      role: 'user',
      content: input,
      timestamp: now
    };
    dispatch(addMessage(userMsg));
    dispatch(setTyping(true));

    try {
      const res = await sendChatMessage({
        message: input,
        sessionId,
        userId: user.id,
        channel
      });

      const data = res.data;
      if (data.sessionId && data.sessionId !== sessionId) {
        dispatch(setSessionId(data.sessionId));
      }
    } catch (e) {
      console.error('Chat send error', e);
      dispatch(setTyping(false));
    }

    setInput('');
  }, [input, sessionId, user.id, channel, dispatch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddToCart = (product) => {
    setDemoCart((prev) => {
      const existing = prev.find((p) => p.sku === product.sku);
      if (existing) {
        return prev.map((p) =>
          p.sku === product.sku ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePay = async ({ method }) => {
    if (!demoCart.length) return;

    try {
      const payload = {
        userId: user.id,
        fulfillmentType: 'pickup',
        items: demoCart.map((item) => ({
          sku: item.sku,
          quantity: item.quantity
        }))
      };

      const orderRes = await createOrder(payload);
      setLatestOrder(orderRes.data);

      const paymentMessage = `I want to pay for my order by ${method}`;
      await handleSendPaymentIntent(paymentMessage);
    } catch (e) {
      console.error('Payment flow error', e);
    }
  };

  const handleSendPaymentIntent = async (messageText) => {
    const now = new Date().toISOString();
    dispatch(
      addMessage({
        id: `${now}-user-payment`,
        role: 'user',
        content: messageText,
        timestamp: now
      })
    );
    dispatch(setTyping(true));

    try {
      const res = await sendChatMessage({
        message: messageText,
        sessionId,
        userId: user.id,
        channel
      });
      const data = res.data;
      if (data.sessionId && data.sessionId !== sessionId) {
        dispatch(setSessionId(data.sessionId));
      }
    } catch (e) {
      console.error('Payment intent error', e);
      dispatch(setTyping(false));
    }
  };

  const cartTotal = demoCart.reduce(
    (sum, item) => sum + (item.final_price || item.price) * item.quantity,
    0
  );

  return (
    <div className="page chat-page">
      <div className="chat-layout">
        <section className="card chat-panel">
          <div className="section-title">
            Omnichannel Sales Assistant
            <span className="tag">Web</span>
          </div>

          <div className="chat-messages">
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                role={m.role}
                content={m.content}
                timestamp={m.timestamp}
              />
            ))}
            {isTyping && (
              <div className="chat-bubble-row left">
                <TypingIndicator />
              </div>
            )}
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask for formal shirts under ₹2000 for office..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </section>

        <section className="card">
          <div className="section-title">
            Products & Cart
            <span className="tag subtle">
              {user.loyaltyTier} • {user.loyaltyPoints} pts
            </span>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-subtitle">Featured products</div>
            <div className="sidebar-list">
              {products.map((p) => (
                <ProductCard
                  key={p.sku}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-subtitle">
              Demo cart ({demoCart.length} items)
            </div>
            <div className="sidebar-list cart-list">
              {demoCart.map((item) => (
                <div key={item.sku} className="cart-row">
                  <span>{item.name}</span>
                  <span>
                    x{item.quantity} • ₹ {item.final_price || item.price}
                  </span>
                </div>
              ))}
              {!demoCart.length && (
                <div className="empty">Add products to cart to demo payment.</div>
              )}
            </div>
          </div>

          <PaymentForm total={cartTotal} onPay={handlePay} />

          {latestOrder && (
            <div className="card" style={{ marginTop: '0.75rem' }}>
              <div className="sidebar-subtitle">Last order</div>
              <div className="order-summary">
                <div>ID: {latestOrder.order_id}</div>
                <div>Total: ₹ {latestOrder.final_total}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
