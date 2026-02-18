export const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDateForInput = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const formatDateForDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(numAmount);
};

export const validateExpenseForm = (data) => {
  const errors = {};
  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.amount = 'Amount must be positive';
  }
  if (!data.category) {
    errors.category = 'Category is required';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!data.date) {
    errors.date = 'Date is required';
  }
  return errors;
};
