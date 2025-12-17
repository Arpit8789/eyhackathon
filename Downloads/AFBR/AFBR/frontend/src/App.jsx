// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ChatPage from './pages/ChatPage.jsx';
import KioskPage from './pages/KioskPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

const App = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">AIGentAgent</div>
        <nav>
          <NavLink to="/" end>Chat</NavLink>
          <NavLink to="/kiosk">Kiosk</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
