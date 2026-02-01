"use client";

import React from 'react';

/**
 * Sidebar navigation. Contains workspace selector, navigation links,
 * settings and premium upgrade card. The parent controls visibility via
 * CSS on the ``dashboard-container``.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="nav-section">
          <div className="nav-title">Workspace</div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Uxerflow</strong>
          </div>
        </div>
        <div className="nav-section">
          <div className="nav-title">Navigation</div>
          <ul>
            <li>
              <a href="#">
                <span className="icon">🏠</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">📦</span>
                Products
              </a>
            </li>
            <li>
              <a href="#" className="active">
                <span className="icon">🧾</span>
                Orders
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">💰</span>
                Sales
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">👥</span>
                Customers
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">📊</span>
                Reports
              </a>
            </li>
          </ul>
          {/* Orders sub-menu */}
          <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
            <li>
              <a href="#" className="active">
                <span className="icon">📄</span>
                All Orders
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">↩️</span>
                Returns
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">📍</span>
                Order Tracking
              </a>
            </li>
          </ul>
        </div>
        <div className="nav-section">
          <div className="nav-title">Settings</div>
          <ul>
            <li>
              <a href="#">
                <span className="icon">🛒</span>
                Marketplace Sync
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">💳</span>
                Payment Gateways
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">⚙️</span>
                Settings
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">❓</span>
                Help Center
              </a>
            </li>
          </ul>
        </div>
        {/* Dark mode toggle (non functional) */}
        <div className="nav-section">
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Toggle Dark Mode</button>
        </div>
      </div>
      {/* Premium upgrade card */}
      <div className="premium-card">
        <div className="title">Upgrade to Premium</div>
        <div>Unlock more features and integrations.</div>
        <div className="expire">Expires in 3 days</div>
      </div>
    </aside>
  );
}
