import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, addTransaction, getDashboardSummary } from '../api'; // Import getDashboardSummary
import './Dashboardpage.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().slice(0, 10)
    });
    const [summary, setSummary] = useState({ // State for dashboard summary
        total_balance: 0.00,
        total_income: 0.00,
        total_expenses: 0.00
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Function to fetch both transactions and summary
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [transactionsData, summaryData] = await Promise.all([
                getTransactions(),
                getDashboardSummary() // Fetch the summary
            ]);
            setTransactions(transactionsData);
            setSummary(summaryData); // Update summary state
        } catch (err) {
            console.error('Failed to fetch data for dashboard:', err);
            setError('Failed to load dashboard data. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component mounts or when a transaction is added/deleted/updated
    useEffect(() => {
        fetchData();
    }, []); // Run only once on mount

    // Handle input changes for the new transaction form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction(prev => ({ ...prev, [name]: value }));
    };

    // Handle submission of the new transaction form
    const handleAddTransaction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!newTransaction.description || !newTransaction.amount || !newTransaction.category || !newTransaction.date) {
                setError('Please fill in all transaction fields.');
                return;
            }
            if (isNaN(parseFloat(newTransaction.amount))) {
                setError('Amount must be a number.');
                return;
            }

            const transactionData = {
                ...newTransaction,
                amount: parseFloat(newTransaction.amount)
            };

            const response = await addTransaction(transactionData);
            console.log('Transaction added:', response.transaction);
            fetchData(); // Refetch all data (transactions and summary) to update the list and totals
            setNewTransaction({ // Clear the form
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().slice(0, 10)
            });
            setShowAddForm(false);
        } catch (err) {
            console.error('Failed to add transaction:', err);
            setError(err.message || 'Failed to add transaction. Please try again.');
        }
    };

    if (loading) {
        return <div className="dashboard-container">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="logout-button">Logout</button>
            </header>

            {error && <p className="error-message">{error}</p>}

            <section className="summary-section">
                <div className="summary-card">
                    <h3>Total Balance</h3>
                    <p>${summary.total_balance.toFixed(2)}</p> {/* Display fetched balance */}
                </div>
                <div className="summary-card">
                    <h3>Total Income</h3>
                    <p>${summary.total_income.toFixed(2)}</p> {/* Display fetched income */}
                </div>
                <div className="summary-card">
                    <h3>Total Expenses</h3>
                    <p>${summary.total_expenses.toFixed(2)}</p> {/* Display fetched expenses */}
                </div>
            </section>

            <section className="transactions-section">
                <h2>Transactions</h2>
                <button
                    className="add-transaction-button"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel Add Transaction' : 'Add New Transaction'}
                </button>

                {showAddForm && (
                    <div className="add-transaction-form-card">
                        <h3>Add New Transaction</h3>
                        <form onSubmit={handleAddTransaction} className="transaction-form">
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={newTransaction.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={newTransaction.amount}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="type">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={newTransaction.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={newTransaction.category}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={newTransaction.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-button">Add Transaction</button>
                        </form>
                    </div>
                )}

                {transactions.length === 0 ? (
                    <p>No transactions found. Add one above!</p>
                ) : (
                    <div className="transactions-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.date}</td>
                                        <td>{t.description}</td>
                                        <td>{t.category}</td>
                                        <td>{t.type}</td>
                                        <td className={t.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                                            ${t.amount ? parseFloat(t.amount).toFixed(2) : '0.00'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;
