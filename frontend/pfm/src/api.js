// ... (Keep your existing imports and callApi function) ...

const API_BASE_URL = 'http://localhost:5000';

async function callApi(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const responseData = await response.json();

        if (!response.ok) {
            const error = new Error(responseData.message || `API Error: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

export const login = async ({email, password}) => {
    return callApi('/api/auth/login', 'POST', { email, password });
};

export const register = async ({email, password}) => {
    return callApi('/api/auth/register', 'POST', { email, password });
};

// --- User/Dashboard API Calls ---
export const getUserProfile = async (token) => {
    return callApi('/api/user/profile', 'GET', null, token);
};

// NEW: API call for dashboard summary
export const getDashboardSummary = async (token = null) => {
    // Ensure trailing slash if your backend route has one implicitly
    return callApi('/api/transactions/summary', 'GET', null, token);
};


// --- Transactions API Calls ---
export const getTransactions = async (token) => {
    return callApi('/api/transactions/', 'GET', null, token);
};

export const addTransaction = async (transactionData, token) => {
    return callApi('/api/transactions/', 'POST', transactionData, token);
};

export const deleteTransaction = async (transactionId, token) => {
    return callApi(`/api/transactions/${transactionId}`, 'DELETE', null, token);
};

export const updateTransaction = async (transactionId, transactionData, token) => {
    return callApi(`/api/transactions/${transactionId}`, 'PUT', transactionData, token);
};

// --- Budgeting API Calls ---
export const getBudgets = async (token) => {
    return callApi('/api/budgets/', 'GET', null, token);
};

export const addBudget = async (budgetData, token = null) => {
    return callApi('/api/budgets/', 'POST', budgetData, token);
};

export const updateBudget = async (budgetId, budgetData, token) => {
    return callApi(`/api/budgets/${budgetId}`, 'PUT', budgetData, token);
};

export const deleteBudget = async (budgetId, token) => {
    return callApi(`/api/budgets/${budgetId}`, 'DELETE', null, token);
};

// --- Reports API Calls ---
export const getSpendingPatterns = async (token, 기간) => {
    return callApi(`/api/reports/spending-patterns?period=${기간}`, 'GET', null, token);
};

export const getCategoryDistribution = async (token, 기간) => {
    return callApi(`/api/reports/category-distribution?period=${기간}`, 'GET', null, token);
};
