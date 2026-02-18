const Expense = require('../models/Expense');

const convertExpenseAmount = (expense) => {
  if (!expense) return expense;
  const obj = expense.toObject ? expense.toObject() : expense;
  if (obj.amount) {
    obj.amount = parseFloat(obj.amount.toString());
  }
  return obj;
};


exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !description || !date) {
      return res
        .status(400)
        .json({ 
          success: false, 
          message: 'Please provide all required fields: amount, category, description, date' 
        });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Amount must be a positive number' });
    }

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

exports.getExpenses = async (req, res) => {
  try {
    const { category, sort } = req.query;

    const filter = { userId: req.userId };
    if (category) {
      filter.category = category;
    }

    let sortObj = { date: -1 }; 
    if (sort === 'date_desc') {
      sortObj = { date: -1 };
    } else if (sort === 'date_asc') {
      sortObj = { date: 1 };
    }

    const expenses = await Expense.find(filter).sort(sortObj);

    const convertedExpenses = expenses.map(convertExpenseAmount);

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


exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }

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


exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }

    if (expense.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this expense' });
    }

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


exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(204).send();
    }

    if (expense.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


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
