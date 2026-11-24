'use client';

import React from 'react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  return (
    <div className="toast-notification visible" role="alert" aria-live="assertive">
      {toastMessage}
    </div>
  );
}
