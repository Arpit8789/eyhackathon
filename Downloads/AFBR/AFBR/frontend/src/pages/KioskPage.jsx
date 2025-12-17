// src/pages/KioskPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiClock, FiLogOut, FiUser, FiPhone } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import './KioskPage.css';

const KioskPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState(null);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Mock user data
  const mockUserData = {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    loyaltyTier: 'Gold',
    loyaltyPoints: 2450,
    reservedItems: [
      { id: 1, name: 'Blue Formal Shirt', size: 'M', price: 1499, image: 'https://via.placeholder.com/100' },
      { id: 2, name: 'Black Trousers', size: '32', price: 1899, image: 'https://via.placeholder.com/100' }
    ],
    recentOrders: [
      { id: 'ORD-001', date: '2025-12-15', items: 3, total: 4599 },
      { id: 'ORD-002', date: '2025-12-10', items: 2, total: 2999 },
      { id: 'ORD-003', date: '2025-12-05', items: 1, total: 1499 }
    ]
  };

  // Auto-logout after 2 minutes of inactivity
  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        handleLogout();
        toast.error('Session expired due to inactivity');
      }, 120000); // 2 minutes

      setInactivityTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      const timer = setTimeout(() => {
        handleLogout();
        toast.error('Session expired due to inactivity');
      }, 120000);
      setInactivityTimer(timer);
    }
  }, [inactivityTimer]);

  useEffect(() => {
    if (isLoggedIn) {
      document.addEventListener('click', resetInactivityTimer);
      document.addEventListener('touchstart', resetInactivityTimer);

      return () => {
        document.removeEventListener('click', resetInactivityTimer);
        document.removeEventListener('touchstart', resetInactivityTimer);
      };
    }
  }, [isLoggedIn, resetInactivityTimer]);

  const handleLogin = () => {
    if (phoneNumber.length >= 10) {
      setUserData(mockUserData);
      setIsLoggedIn(true);
      toast.success(`Welcome back, ${mockUserData.name}!`);
      setPhoneNumber('');
    } else {
      toast.error('Please enter a valid phone number');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    toast.success('Logged out successfully');
  };

  const handleQRLogin = () => {
    // Simulate QR scan login
    setTimeout(() => {
      setUserData(mockUserData);
      setIsLoggedIn(true);
      setShowQR(false);
      toast.success(`Welcome back, ${mockUserData.name}!`);
    }, 2000);
  };

  const cartTotal = userData?.reservedItems.reduce((sum, item) => sum + item.price, 0) || 0;
  const loyaltyDiscount = Math.floor(cartTotal * 0.1); // 10% discount for Gold

  return (
    <div className="kiosk-page" onClick={resetInactivityTimer}>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <LoginScreen
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleLogin={handleLogin}
            showQR={showQR}
            setShowQR={setShowQR}
            handleQRLogin={handleQRLogin}
          />
        ) : (
          <DashboardScreen
            userData={userData}
            handleLogout={handleLogout}
            cartTotal={cartTotal}
            loyaltyDiscount={loyaltyDiscount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ phoneNumber, setPhoneNumber, handleLogin, showQR, setShowQR, handleQRLogin }) => {
  return (
    <motion.div
      className="login-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="kiosk-container">
        <motion.div
          className="kiosk-logo"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="logo-circle gradient-text">AI</div>
          <h1 className="gradient-text">GentAgent Kiosk</h1>
          <p className="store-location">
            <FiMapPin /> Store-007 • Phoenix Mall, Mumbai
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showQR ? (
            <motion.div
              className="login-form"
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2>Welcome!</h2>
              <p className="subtitle">Enter your phone number to continue</p>

              <div className="input-group">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  className="kiosk-input"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  autoFocus
                />
              </div>

              <motion.button
                className="kiosk-btn btn-primary"
                onClick={handleLogin}
                disabled={phoneNumber.length < 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>

              <div className="divider">or</div>

              <motion.button
                className="kiosk-btn btn-secondary"
                onClick={() => setShowQR(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Scan QR Code
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="qr-screen"
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2>Scan QR Code</h2>
              <p className="subtitle">Use your mobile app to scan and login</p>

              <div className="qr-container glass">
                <QRCodeSVG
                  value="https://aigentagent.com/kiosk/login?store=007"
                  size={200}
                  level="H"
                  includeMargin
                  fgColor="#667eea"
                />
              </div>

              <motion.button
                className="kiosk-btn btn-secondary"
                onClick={() => setShowQR(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Phone Login
              </motion.button>

              {/* Auto-login after 2 seconds for demo */}
              <p className="demo-note">Demo: Auto-logging in...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Dashboard Screen Component
const DashboardScreen = ({ userData, handleLogout, cartTotal, loyaltyDiscount }) => {
  return (
    <motion.div
      className="dashboard-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="kiosk-header glass">
        <div className="header-left">
          <div className="user-info">
            <div className="user-avatar">
              <FiUser size={24} />
            </div>
            <div>
              <h3>Welcome back, {userData.name}!</h3>
              <div className="loyalty-info">
                <span className="badge badge-warning">{userData.loyaltyTier} Member</span>
                <span className="points">{userData.loyaltyPoints} points</span>
              </div>
            </div>
          </div>
        </div>
        <motion.button
          className="logout-btn btn-ghost"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiLogOut /> Logout
        </motion.button>
      </div>

      <div className="kiosk-content">
        {/* Reserved Items */}
        <motion.section
          className="kiosk-section glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>
            <FiShoppingBag /> Your Reserved Items
          </h2>
          <div className="reserved-grid">
            {userData.reservedItems.map((item) => (
              <motion.div
                key={item.id}
                className="reserved-card"
                whileHover={{ scale: 1.02 }}
              >
                <img src={item.image} alt={item.name} />
                <div className="reserved-info">
                  <h4>{item.name}</h4>
                  <p>Size: {item.size}</p>
                  <p className="price">₹{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="summary-row discount">
              <span>Loyalty Discount ({userData.loyaltyTier}):</span>
              <span>-₹{loyaltyDiscount}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{cartTotal - loyaltyDiscount}</span>
            </div>

            <motion.button
              className="checkout-btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Checkout
            </motion.button>
          </div>
        </motion.section>

        {/* Recent Orders */}
        <motion.section
          className="kiosk-section glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>
            <FiClock /> Recent Orders
          </h2>
          <div className="orders-list">
            {userData.recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div>
                  <h4>{order.id}</h4>
                  <p>{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="order-details">
                  <span>{order.items} items</span>
                  <span className="order-total">₹{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Complete Look Suggestions */}
        <motion.section
          className="kiosk-section glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Complete Your Look</h2>
          <div className="suggestions-grid">
            {['Leather Belt', 'Formal Shoes', 'Tie & Pocket Square'].map((item, idx) => (
              <motion.div
                key={idx}
                className="suggestion-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="suggestion-icon">+</div>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default KioskPage;
