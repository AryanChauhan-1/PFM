import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // Import Link
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/registerpage'; 
import DashboardPage from './pages/dashboard'; 
import TransactionsPage from './pages/transactionpage'; 
import BudgetingPage from './pages/Budgetingpage'; 
import ReportPage from './pages/reportpage'; 
import './App.css';

function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') ? true : false;
    };

    return (
        <Router>
            <div className="app-container"> 
                {isAuthenticated() && (
                    <nav className="main-nav">
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/transactions">Transactions</Link></li>
                            <li><Link to="/budgeting">Budgeting</Link></li>
                            <li><Link to="/reports">Reports</Link></li> 
                        </ul>
                    </nav>
                )}

                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/dashboard"
                        element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/transactions"
                        element={isAuthenticated() ? <TransactionsPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/budgeting"
                        element={isAuthenticated() ? <BudgetingPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/reports"
                        element={isAuthenticated() ? <ReportPage /> : <Navigate to="/login" />}
                    />

                    <Route
                        path="/"
                        element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
                    />

                    <Route path="*" element={<Navigate to="/dashboard" />} /> 
                </Routes>
            </div>
        </Router>
    );
}

export default App;
