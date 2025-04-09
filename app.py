# Import required libraries
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

# Initialize Flask application
app = Flask(__name__, static_folder='.')
# Enable CORS for cross-origin requests
CORS(app)

# Define the path for the transactions data file
DATA_FILE = 'transactions.json'

def load_transactions():
    """
    Load transactions from the JSON file.
    Returns an empty list if the file doesn't exist.
    """
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_transactions(transactions):
    """
    Save transactions to the JSON file.
    """
    with open(DATA_FILE, 'w') as f:
        json.dump(transactions, f)

@app.route('/')
def serve_index():
    """
    Serve the main HTML file.
    """
    return send_from_directory('.', 'index.html')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """
    Get all transactions.
    Returns a JSON array of transactions.
    """
    transactions = load_transactions()
    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """
    Add a new transaction.
    Expects a JSON object with transaction details.
    Returns the created transaction with ID and timestamp.
    """
    transactions = load_transactions()
    new_transaction = request.json
    # Add unique ID and timestamp
    new_transaction['id'] = datetime.now().timestamp()
    new_transaction['date'] = datetime.now().isoformat()
    transactions.append(new_transaction)
    save_transactions(transactions)
    return jsonify(new_transaction), 201

@app.route('/api/transactions/<float:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """
    Delete a transaction by ID.
    Returns 204 No Content on success.
    """
    transactions = load_transactions()
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_transactions(transactions)
    return '', 204

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """
    Get summary statistics for all transactions.
    Returns a JSON object with balance, income, and expenses.
    """
    transactions = load_transactions()
    # Calculate totals
    balance = sum(t['amount'] if t['type'] == 'income' else -t['amount'] for t in transactions)
    income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    expenses = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    
    return jsonify({
        'balance': balance,
        'income': income,
        'expenses': expenses
    })

if __name__ == '__main__':
    # Run the Flask application in debug mode
    app.run(debug=True) 