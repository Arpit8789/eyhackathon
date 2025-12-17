// frontend/src/components/PaymentForm.jsx
import React, { useState } from 'react';

const PaymentForm = ({ total, onPay }) => {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay?.({ method, upiId });
  };

  return (
    <form className="card payment-form" onSubmit={handleSubmit}>
      <div className="section-title">Payment</div>
      <div className="form-row">
        <label>Amount</label>
        <div className="amount">₹ {total}</div>
      </div>
      <div className="form-row">
        <label>Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="UPI">UPI</option>
          <option value="card">Card</option>
          <option value="gift_card">Gift Card</option>
        </select>
      </div>
      {method === 'UPI' && (
        <div className="form-row">
          <label>UPI ID</label>
          <input
            type="text"
            placeholder="you@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        </div>
      )}
      <button type="submit" className="btn-primary full-width">
        Pay now
      </button>
    </form>
  );
};

export default PaymentForm;
