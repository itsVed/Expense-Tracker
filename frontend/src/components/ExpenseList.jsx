import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { formatDateForDisplay, formatCurrency } from '../utils/helpers';
import '../styles/ExpenseList.css';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'];

const ExpenseList = ({ refreshTrigger }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger, selectedCategory, sortOrder]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await expenseAPI.getExpenses(selectedCategory, sortOrder);
      setExpenses(response.data.data || []);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id);
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount);
      return isNaN(amount) ? sum : sum + amount;
    }, 0);
  };

  const total = calculateTotal();

  return (
    <div className="expense-list-container">
      <h2>Your Expenses</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>

      <div className="total-box">
        <h3>Total: {formatCurrency(total)}</h3>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">No expenses yet. Add one! 💰</div>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{formatDateForDisplay(expense.date)}</td>
                <td><span className={`badge cat-${expense.category.toLowerCase()}`}>{expense.category}</span></td>
                <td>{expense.description}</td>
                <td className="amount">{formatCurrency(expense.amount)}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteExpense(expense._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseList;
