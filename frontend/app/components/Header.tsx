"use client";

import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Top bar containing logo, collapse button, search and user actions.
 */
export default function Header({ onToggleSidebar, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="left">
        <button className="collapse-button" onClick={onToggleSidebar}>☰</button>
        <div className="logo">
          <span className="icon"></span>
          Prodex
        </div>
        <div className="page-title">Orders</div>
      </div>
      <div className="right">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
          />
          <span>⌘K</span>
        </div>
        <div className="avatars">
          <div className="avatar">A</div>
          <div className="avatar">B</div>
          <div className="avatar more">+2</div>
        </div>
        <div className="notifications">
          <span className="bell">🔔</span>
          <span className="badge">3</span>
        </div>
        <div className="profile-dropdown">
          <div className="avatar">U</div>
          <div className="menu">
            <a href="#">Profile</a>
            <a href="#">Settings</a>
            <a href="#">Logout</a>
          </div>
        </div>
      </div>
    </header>
  );
}
