from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# Data file path
DATA_FILE = 'transactions.json'

def load_transactions():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_transactions(transactions):
    with open(DATA_FILE, 'w') as f:
        json.dump(transactions, f)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = load_transactions()
    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    transactions = load_transactions()
    new_transaction = request.json
    new_transaction['id'] = datetime.now().timestamp()
    new_transaction['date'] = datetime.now().isoformat()
    transactions.append(new_transaction)
    save_transactions(transactions)
    return jsonify(new_transaction), 201

@app.route('/api/transactions/<float:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    transactions = load_transactions()
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_transactions(transactions)
    return '', 204

@app.route('/api/summary', methods=['GET'])
def get_summary():
    transactions = load_transactions()
    balance = sum(t['amount'] if t['type'] == 'income' else -t['amount'] for t in transactions)
    income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    expenses = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    
    return jsonify({
        'balance': balance,
        'income': income,
        'expenses': expenses
    })

if __name__ == '__main__':
    app.run(debug=True) 