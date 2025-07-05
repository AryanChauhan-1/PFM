import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgets, addBudget, updateBudget, deleteBudget } from '../api';
import './budgeting.css';

const BudgetingPage = () => {
    const navigate = useNavigate();
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({
        category: '',
        amount: '',
        startDate: '', 
        endDate: ''  
    });
    const [editingBudget, setEditingBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchBudgets = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getBudgets();
            setBudgets(data);
        } catch (err) {
            console.error('Failed to fetch budgets:', err);
            setError('Failed to load budgets. Ensure backend is running.');
            // if (err.status === 401) { navigate('/login'); } // Redirect on auth error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
        setNewBudget(prev => ({
            ...prev,
            startDate: startOfMonth,
            endDate: endOfMonth
        }));

        fetchBudgets();
    }, []); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingBudget) {
            setEditingBudget(prev => ({ ...prev, [name]: value }));
        } else {
            setNewBudget(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!newBudget.category || !newBudget.amount || !newBudget.startDate || !newBudget.endDate) {
                setError('Please fill in all budget fields.');
                return;
            }
            if (isNaN(parseFloat(newBudget.amount))) {
                setError('Amount must be a number.');
                return;
            }

            const budgetData = {
                category: newBudget.category,
                amount: parseFloat(newBudget.amount),
                start_date: newBudget.startDate, 
                end_date: newBudget.endDate   
            };

            const response = await addBudget(budgetData);
            console.log('Budget added:', response.budget);
            fetchBudgets(); 
            setNewBudget({ 
                category: '',
                amount: '',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)
            });
            setShowAddForm(false); 
        } catch (err) {
            console.error('Failed to add budget:', err);
            setError(err.message || 'Failed to add budget. Please try again.');
        }
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        setError('');
        if (!editingBudget) return; 

        try {
            const budgetData = {
                category: editingBudget.category,
                amount: parseFloat(editingBudget.amount),
                start_date: editingBudget.startDate, // Ensure this is YYYY-MM-DD
                end_date: editingBudget.endDate    // Ensure this is YYYY-MM-DD
            };

            const response = await updateBudget(editingBudget.id, budgetData);
            console.log('Budget updated:', response.budget);
            fetchBudgets(); // Refresh the list
            setEditingBudget(null); // Exit editing mode
            setShowAddForm(false); // Hide the form
        } catch (err) {
            console.error('Failed to update budget:', err);
            setError(err.message || 'Failed to update budget. Please try again.');
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            setError('');
            try {
                await deleteBudget(budgetId);
                console.log('Budget deleted:', budgetId);
                fetchBudgets(); 
            } catch (err) {
                console.error('Failed to delete budget:', err);
                setError(err.message || 'Failed to delete budget. Please try again.');
            }
        }
    };

    const startEdit = (budget) => {
        setEditingBudget({
            ...budget,
            startDate: budget.start_date, 
            endDate: budget.end_date
        });
        setShowAddForm(true); 
    };

    if (loading) {
        return <div className="budgeting-container">Loading budgets...</div>;
    }

    return (
        <div className="budgeting-container">
            <header className="budgeting-header">
                <h1>Budgeting</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="logout-button">Logout</button>
            </header>

            {error && <p className="error-message">{error}</p>}

            <section className="budget-management-section">
                <h2>Manage Budgets</h2>
                <button
                    className="add-budget-button"
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingBudget(null);
                        setNewBudget({ 
                            category: '',
                            amount: '',
                            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
                            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)
                        });
                    }}
                >
                    {showAddForm ? (editingBudget ? 'Cancel Edit' : 'Cancel Add Budget') : 'Add New Budget'}
                </button>

                {showAddForm && (
                    <div className="budget-form-card">
                        <h3>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</h3>
                        <form onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget} className="budget-form">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={editingBudget ? editingBudget.category : newBudget.category}
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
                                    value={editingBudget ? editingBudget.amount : newBudget.amount}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={editingBudget ? editingBudget.startDate : newBudget.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={editingBudget ? editingBudget.endDate : newBudget.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-button">
                                {editingBudget ? 'Update Budget' : 'Add Budget'}
                            </button>
                        </form>
                    </div>
                )}

                {budgets.length === 0 ? (
                    <p>No budgets found. Add one above!</p>
                ) : (
                    <div className="budgets-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.category}</td>
                                        <td>${b.amount ? parseFloat(b.amount).toFixed(2) : '0.00'}</td>
                                        <td>{b.start_date}</td>
                                        <td>{b.end_date}</td>
                                        <td className="budget-actions">
                                            <button onClick={() => startEdit(b)} className="edit-button">Edit</button>
                                            <button onClick={() => handleDeleteBudget(b.id)} className="delete-button">Delete</button>
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

export default BudgetingPage;
