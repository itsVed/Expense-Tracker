import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshExpenses, setRefreshExpenses] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleExpenseCreated = () => {
    setRefreshExpenses((prev) => prev + 1);
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-container">
        <ExpenseForm onExpenseCreated={handleExpenseCreated} />
        <ExpenseList refreshTrigger={refreshExpenses} />
      </main>
    </div>
  );
}

export default App;
