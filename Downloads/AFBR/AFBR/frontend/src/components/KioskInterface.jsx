// frontend/src/components/KioskInterface.jsx
import React from 'react';

const KioskInterface = ({ children }) => {
  return (
    <div className="kiosk-shell">
      <div className="kiosk-header">
        <div className="kiosk-brand">In-Store Kiosk</div>
        <div className="kiosk-subtitle">Seamless online to offline journey</div>
      </div>
      <div className="kiosk-body">
        {children}
      </div>
    </div>
  );
};

export default KioskInterface;
