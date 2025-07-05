import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// You'll need API calls for reports data here, e.g., getSpendingPatterns, getCategoryPercentages
// import { getSpendingPatterns, getCategoryPercentages } from '../api';
import './reportpage.css'; // Create this CSS file for specific page styles

// Placeholder for a simple Pie Chart component
const CategoryDistributionChart = ({ data }) => {
  // In a real app, you'd use a charting library like Chart.js, Recharts, or Nivo
  // This is a simple visual representation
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="chart-placeholder pie-chart">
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="chart-segment" style={{
            // This is a very simplistic way to show segments, a real chart library would be much more complex
            // For visual placeholder: Represents a slice visually
            backgroundColor: `hsl(${item.amount / total * 360}, 70%, 50%)`, // Dummy color based on amount
            height: `${(item.amount / total) * 100}%`,
            width: '100%',
          }}>
            {/* {item.category}: {((item.amount / total) * 100).toFixed(1)}% */}
          </div>
        ))
      ) : (
        <p>No data for chart.</p>
      )}
      <img src="https://via.placeholder.com/250/2a2a4a/00bcd4?text=Category+Pie+Chart" alt="Category Distribution Chart" />
    </div>
  );
};

// Placeholder for a simple Bar/Line Chart component
const SpendingTrendChart = ({ data }) => {
  // In a real app, you'd use a charting library
  return (
    <div className="chart-placeholder bar-chart">
       <img src="https://via.placeholder.com/600x200/2a2a4a/00bcd4?text=Spending+Trend+Chart" alt="Spending Trend Chart" />
    </div>
  );
};


const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spendingPatterns, setSpendingPatterns] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]); // For pie chart
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // --- Placeholder Data for Reports ---
        // Replace with actual API calls:
        // const patterns = await getSpendingPatterns();
        // const percentages = await getCategoryPercentages();

        setSpendingPatterns([
          { month: 'Jan', amount: 1200 },
          { month: 'Feb', amount: 1350 },
          { month: 'Mar', amount: 1100 },
          { month: 'Apr', amount: 1400 },
          { month: 'May', amount: 1250 },
        ]);

        setCategoryPercentages([
          { category: 'Food', amount: 300 },
          { category: 'Transport', amount: 150 },
          { category: 'Shopping', amount: 200 },
          { category: 'Utilities', amount: 100 },
          { category: 'Entertainment', amount: 80 },
        ]);
        // --- End Placeholder Data ---
      } catch (err) {
        setError(err.message || 'Failed to fetch report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) {
    return <div className="reports-container">Loading reports...</div>;
  }

  return (
    <div className="reports-container">
      <header className="reports-header">
        <span className="back-icon" onClick={() => navigate('/dashboard')}>←</span>
        <h2>Reports</h2>
        {/* Placeholder for export/share icon */}
        <span className="export-icon">📤</span>
      </header>

      {error && <p className="error-message">{error.message}</p>}

      <section className="report-card">
        <h3>Spending Trends Over Time</h3>
        <SpendingTrendChart data={spendingPatterns} />
        <p className="report-description">
          Visualize how your spending has changed month over month.
        </p>
      </section>

      <section className="report-card">
        <h3>Spending by Category</h3>
        <div className="category-report-content">
          <div className="category-list">
            {categoryPercentages.length > 0 ? (
              categoryPercentages.map((item, index) => (
                <div key={index} className="category-item">
                  <span className="category-name">{item.category}</span>
                  <span className="category-amount">${item.amount.toFixed(2)}</span>
                  <span className="category-percentage">({((item.amount / categoryPercentages.reduce((sum, i) => sum + i.amount, 0)) * 100).toFixed(1)}%)</span>
                </div>
              ))
            ) : (
              <p className="no-data">No category data available.</p>
            )}
          </div>
          <CategoryDistributionChart data={categoryPercentages} />
        </div>
        <p className="report-description">
          Understand where your money goes with a breakdown by category.
        </p>
      </section>
      
      {/* Add more report sections here (e.g., Income vs. Expense over time) */}

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item">🏠 Home</Link>
        <Link to="/transactions" className="nav-item">📊 History</Link>
        <div className="nav-item add-button">➕</div> {/* Central Add Button (can navigate to add transaction or budget) */}
        <Link to="/budgeting" className="nav-item">💰 Budget</Link>
        <Link to="/reports" className="nav-item active">📈 Reports</Link> {/* Active link for this page */}
      </nav>
    </div>
  );
};

export default ReportsPage;