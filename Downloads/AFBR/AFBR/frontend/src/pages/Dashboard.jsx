// frontend/src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="page">
      <section className="card" style={{ width: '100%' }}>
        <div className="section-title">Demo Console</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Use this page as a guide while presenting:
        </p>
        <ul style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
          <li>Start on the Chat tab and ask for “formal shirts under ₹2000 for office”.</li>
          <li>Show recommendations and stock status updates in real time.</li>
          <li>Add a product to the cart and complete a mock payment.</li>
          <li>Switch to the Kiosk tab to demonstrate context continuity.</li>
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
