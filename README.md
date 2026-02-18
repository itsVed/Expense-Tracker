###Expense Tracker

A full-stack web application for tracking and managing personal expenses with user authentication.

## Features

- **User Authentication**: Secure login and registration system
- **Expense Management**: Create, read, update, and delete expenses
- **Expense Tracking**: View all expenses with detailed information
- **Responsive UI**: Clean and intuitive user interface
- **API Error Handling**: Comprehensive error handling middleware
- **Idempotency Support**: Prevent duplicate requests
- **Database Integration**: Persistent data storage

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (or as configured)
- **Authentication**: JWT-based authentication

### Frontend
- **Library**: React
- **Package Manager**: npm
- **Styling**: CSS modules
- **HTTP Client**: Fetch API with custom service layer

## Project Structure

```
Live App/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Main server file
│   │   ├── config/
│   │   │   └── database.js           # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   └── expenseController.js  # Expense management logic
│   │   ├── middleware/
│   │   │   ├── authenticate.js       # JWT verification
│   │   │   ├── errorHandler.js       # Error handling
│   │   │   └── idempotency.js        # Idempotency handling
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   └── Expense.js            # Expense schema
│   │   └── routes/
│   │       ├── authRoutes.js         # Auth endpoints
│   │       └── expenseRoutes.js      # Expense endpoints
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx                   # Main App component
    │   ├── index.js                  # React entry point
    │   ├── components/
    │   │   ├── Auth.jsx              # Login/Register component
    │   │   ├── ExpenseForm.jsx       # Add expense form
    │   │   ├── ExpenseList.jsx       # Display expenses
    │   │   └── Header.jsx            # Header navigation
    │   ├── services/
    │   │   └── api.js                # API service layer
    │   ├── styles/                   # CSS stylesheets
    │   ├── utils/
    │   │   └── helpers.js            # Utility functions
    │   └── index.js
    └── package.json
``` 

## Running the Application

### Development Mode

1. Open two terminal windows

2. Terminal 1 - Start Backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Terminal 2 - Start Frontend:
   ```bash
   cd frontend
   npm start
   ```
