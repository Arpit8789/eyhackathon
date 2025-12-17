// frontend/src/pages/KioskPage.jsx
import React from 'react';
import ChatPage from './ChatPage.jsx';
import KioskInterface from '../components/KioskInterface.jsx';

const KioskPage = () => {
  return (
    <div className="page">
      <KioskInterface>
        <div style={{ flex: 1 }}>
          <ChatPage />
        </div>
      </KioskInterface>
    </div>
  );
};

export default KioskPage;
