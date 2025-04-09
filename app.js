// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const balanceAmount = document.querySelector('.balance-amount');
const incomeAmount = document.querySelector('.income-amount');
const expenseAmount = document.querySelector('.expense-amount');
const transactionList = document.querySelector('.transaction-list');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const transactionModal = document.getElementById('transactionModal');
const closeBtn = document.querySelector('.close');
const transactionForm = document.getElementById('transactionForm');

// Initialize Chart.js for expense visualization
const expenseChart = new Chart(document.getElementById('expenseChart'), {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Load transactions from localStorage or initialize empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Theme Toggle Functionality
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

// Set initial theme from localStorage or default to light
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// Transaction Filters
const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';

// Add event listeners to filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        updateTransactionList();
    });
});

// Format date to a readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update the entire UI including balance, income, expenses, and transaction list
function updateUI() {
    // Calculate total balance
    const balance = transactions.reduce((acc, transaction) => {
        return acc + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);

    // Calculate total income
    const income = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Calculate total expenses
    const expenses = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Update display values
    balanceAmount.textContent = `$${balance.toFixed(2)}`;
    incomeAmount.textContent = `$${income.toFixed(2)}`;
    expenseAmount.textContent = `$${expenses.toFixed(2)}`;

    // Update transaction list and chart
    updateTransactionList();
    updateChart();
    saveToLocalStorage();
}

// Update the transaction list with current transactions
function updateTransactionList() {
    transactionList.innerHTML = '';
    
    // Filter transactions based on current filter
    let filteredTransactions = transactions;
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentFilter);
    }
    
    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create and append transaction elements
    filteredTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `transaction ${transaction.type}`;
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${transaction.category}</p>
                <p class="transaction-date">${formatDate(transaction.date)}</p>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button class="edit-btn" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        transactionList.appendChild(transactionElement);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseFloat(e.target.closest('.delete-btn').dataset.id);
            deleteTransaction(id);
        });
    });

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseFloat(e.target.closest('.edit-btn').dataset.id);
            editTransaction(id);
        });
    });
}

// Update the expense chart with current data
function updateChart() {
    // Calculate total expenses by category
    const categories = {};
    transactions
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
            categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
        });

    // Update chart data
    expenseChart.data.labels = Object.keys(categories);
    expenseChart.data.datasets[0].data = Object.values(categories);
    expenseChart.update();
}

// Modal Functions
addTransactionBtn.addEventListener('click', () => {
    transactionModal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    transactionModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
        transactionModal.style.display = 'none';
    }
});

// Delete a transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    }
}

// Edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        // Fill form with transaction data
        document.getElementById('type').value = transaction.type;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('description').value = transaction.description;
        
        // Store the transaction ID for updating
        transactionForm.dataset.editId = id;
        
        // Show modal
        transactionModal.style.display = 'block';
    }
}

// Handle form submission
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Create transaction object
    const transaction = {
        id: transactionForm.dataset.editId || Date.now(),
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        date: new Date().toISOString()
    };

    // Update or add transaction
    if (transactionForm.dataset.editId) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === parseFloat(transactionForm.dataset.editId));
        if (index !== -1) {
            transactions[index] = transaction;
        }
        delete transactionForm.dataset.editId;
    } else {
        // Add new transaction
        transactions.push(transaction);
    }

    // Update UI and reset form
    updateUI();
    transactionModal.style.display = 'none';
    transactionForm.reset();
});

// Save transactions to localStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize the application
updateUI(); 