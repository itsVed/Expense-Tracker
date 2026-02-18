const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Expense routes
router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/summary/by-category', getExpenseSummary);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
