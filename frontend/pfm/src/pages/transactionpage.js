import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactions, addTransaction } from '../api'; // Import your API calls
import './transactionpage.css'; // Create this CSS file for specific page styles

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false); // State to control add form visibility

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'expense', // Default to expense
    description: '',
    category: '', // Placeholder for category input
    date: new Date().toISOString().split('T')[0], // Default to today's date
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(); // Fetch transactions from your API
        setTransactions(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []); // Empty dependency array means this runs once on component mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
        setError('Please fill in all fields.');
        return;
      }
      
      const addedTrans = await addTransaction(newTransaction); // Send new transaction to API
      setTransactions([addedTrans, ...transactions]); // Add new transaction to list
      setNewTransaction({ // Reset form
        amount: '',
        type: 'expense',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsAdding(false); // Hide the form after adding
    } catch (err) {
      setError(err.message || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="transactions-container">Loading transactions...</div>;
  }

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <span className="back-icon" onClick={() => navigate('/dashboard')}>←</span> {/* Back to dashboard */}
        <h2>Transaction History</h2>
        <span className="search-icon">🔍</span> {/* Search icon */}
      </header>

      <div className="controls-bar">
        <button className="filter-button">Filter</button>
        <button className="add-new-button" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel Add' : 'Add New Transaction'}
        </button>
      </div>

      {isAdding && (
        <section className="add-transaction-form-section">
          <h3>Add New Transaction</h3>
          {error && <p className="error-message">{error.message}</p>}
          <form onSubmit={handleAddSubmit} className="add-transaction-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50.00"
                  step="0.01"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={newTransaction.type} onChange={handleInputChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="e.g., Coffee at Cafe X"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="category">Category</label>
              <input
                type="text" // Can be a dropdown linked to backend categories later
                id="category"
                name="category"
                value={newTransaction.category}
                onChange={handleInputChange}
                placeholder="e.g., Food, Transport, Salary"
                required
              />
            </div>
            <div className="input-group">
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
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </section>
      )}

      <section className="transactions-list-section">
        <h3>All Transactions</h3>
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">{/* You'd determine icon based on category */}💸</div>
                <div className="transaction-details">
                  <p className="transaction-name">{transaction.description}</p>
                  <p className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <p className={`transaction-amount ${transaction.type === 'expense' ? 'expense' : 'income'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </p>
                {/* Add edit/delete buttons here later */}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-transactions">No transactions recorded yet.</p>
        )}
      </section>

      {/* Re-using bottom navigation bar (from DashboardPage.js) - consider making it a component */}
      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item">🏠 Home</Link>
        <Link to="/transactions" className="nav-item active">📊 History</Link>
        <div className="nav-item add-button" onClick={() => setIsAdding(true)}>➕</div>
        <Link to="/settings" className="nav-item">⚙️ Settings</Link>
      </nav>
    </div>
  );
};

export default TransactionsPage;