# Budget Tracker

A modern budget tracking application. Track your income and expenses, visualize your spending patterns, and manage your finances effectively.

## Features

- Track income and expenses
- Visualize spending patterns with charts
- Dark/Light theme support
- Responsive design
- Local data persistence
- Modern Apple-like UI

## Setup

1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask server:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to `http://localhost:5000`

## Usage

- Click the "+" button to add a new transaction
- Select the transaction type (income/expense)
- Enter the amount and category
- Add a description
- View your transactions and spending patterns in the dashboard

## Data Storage

The application stores data in two ways:
1. Local storage in the browser for immediate access
2. JSON file on the server for persistence

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)
- Charts: Chart.js
- Icons: Font Awesome 