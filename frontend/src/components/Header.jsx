import React from 'react';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">💰 Expense Tracker</h1>
        <div className="user-section">
          <span className="user-name">{user?.name}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
