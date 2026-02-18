const Expense = require('../models/Expense');

// Helper function to convert Decimal128 to number
const convertExpenseAmount = (expense) => {
  if (!expense) return expense;
  const obj = expense.toObject ? expense.toObject() : expense;
  if (obj.amount) {
    obj.amount = parseFloat(obj.amount.toString());
  }
  return obj;
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validation
    if (!amount || !category || !description || !date) {
      return res
        .status(400)
        .json({ 
          success: false, 
          message: 'Please provide all required fields: amount, category, description, date' 
        });
    }

    // Validate amount is positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Amount must be a positive number' });
    }

    // Validate date is valid
    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide a valid date' });
    }

    const expense = await Expense.create({
      amount: parseFloat(amount),
      category,
      description,
      date: expenseDate,
      userId: req.userId,
    });

    const convertedExpense = convertExpenseAmount(expense);
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: convertedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all expenses with filtering and sorting
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { category, sort } = req.query;

    // Build filter object
    const filter = { userId: req.userId };
    if (category) {
      filter.category = category;
    }

    // Build sort object
    let sortObj = { date: -1 }; // Default: newest first
    if (sort === 'date_desc') {
      sortObj = { date: -1 };
    } else if (sort === 'date_asc') {
      sortObj = { date: 1 };
    }

    const expenses = await Expense.find(filter).sort(sortObj);

    // Convert Decimal128 to number
    const convertedExpenses = expenses.map(convertExpenseAmount);

    // Calculate total
    const total = convertedExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount || 0);
    }, 0);

    res.status(200).json({
      success: true,
      count: convertedExpenses.length,
      total: total.toFixed(2),
      data: convertedExpenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }

    // Check if user owns the expense
    if (expense.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to access this expense' });
    }

    const convertedExpense = convertExpenseAmount(expense);
    res.status(200).json({
      success: true,
      data: convertedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update expense (Idempotent)
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }

    // Check if user owns the expense
    if (expense.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this expense' });
    }

    // Validate amount if provided
    if (req.body.amount && (isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0)) {
      return res
        .status(400)
        .json({ success: false, message: 'Amount must be a positive number' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const convertedExpense = convertExpenseAmount(expense);
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: convertedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete expense (Idempotent)
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      // Idempotent: Return success even if already deleted
      return res.status(204).send();
    }

    // Check if user owns the expense
    if (expense.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    // Idempotent: Return 204 No Content
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get expense summary by category
// @route   GET /api/expenses/summary/by-category
// @access  Private
exports.getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
