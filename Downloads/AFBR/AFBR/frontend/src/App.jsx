// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { FiMessageCircle, FiMonitor, FiBarChart2, FiMoon, FiSun, FiMenu, FiX } from 'react-icons/fi';
import ChatPage from './pages/ChatPage';
import KioskPage from './pages/KioskPage';
import Dashboard from './pages/Dashboard';
import './styles/global.css';
import './styles/App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  const navItems = [
    { path: '/', icon: FiMessageCircle, label: 'Chat', end: true },
    { path: '/kiosk', icon: FiMonitor, label: 'Kiosk' },
    { path: '/dashboard', icon: FiBarChart2, label: 'Dashboard' }
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="app-root">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--dark-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glassmorphism-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }
        }}
      />

      <header className="app-header glass">
        <div className="header-container">
          <motion.div 
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-icon gradient-text">AI</div>
            <div className="logo-text">
              <span className="gradient-text">GentAgent</span>
              <span className="logo-subtitle">Omnichannel Sales</span>
            </div>
          </motion.div>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="theme-toggle btn-ghost"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            <button
              className="mobile-menu-toggle btn-ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="page-container"
          >
            <Routes location={location}>
              <Route path="/" element={<ChatPage />} />
              <Route path="/kiosk" element={<KioskPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Gradient Effects */}
      <div className="bg-gradient gradient-1"></div>
      <div className="bg-gradient gradient-2"></div>
      <div className="bg-gradient gradient-3"></div>
    </div>
  );
};

export default App;
