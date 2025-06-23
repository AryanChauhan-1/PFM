from flask import Blueprint, request, jsonify, make_response
from flask_cors import cross_origin
from backend.database import db
from backend.models import Transaction, User # Import Transaction and User models
from datetime import datetime, timedelta
from sqlalchemy import func, extract # Import func for SUM, extract for month/year

report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

def get_current_user_id_placeholder():
    """
    TEMPORARY FUNCTION: Always returns user ID 1 for testing.
    MUST BE REPLACED WITH SECURE JWT DECODING IN PRODUCTION.
    """
    return 1 


@report_bp.route('/spending-patterns', methods=['OPTIONS'])
@report_bp.route('/category-distribution', methods=['OPTIONS'])
@cross_origin(origins="http://localhost:3000", methods=['GET'], headers=['Content-Type', 'Authorization'])
def options_handler():
    """Handles CORS preflight requests for report routes."""
    response = make_response()
    return response, 200

# --- Get Spending Patterns (e.g., monthly spending) ---
@report_bp.route('/spending-patterns', methods=['GET'])
@cross_origin(origins="http://localhost:3000")
def get_spending_patterns():
    """
    Calculates spending patterns over a specified period.
    Default period: last 6 months.
    """
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    # Get period from query parameters, default to 6 months
    period = request.args.get('period', '6months') # e.g., '3months', '6months', '1year'

    end_date = datetime.utcnow().date()
    start_date = end_date # Default to current day, then adjust
    if period == '3months':
        start_date = end_date - timedelta(days=3 * 30) # Approx 3 months
    elif period == '1year':
        start_date = end_date - timedelta(days=365)
    else: # Default to 6 months
        start_date = end_date - timedelta(days=6 * 30)

    try:
        # Query to get total expenses per month for the period
        # We need to group by year and month.
        spending_data = db.session.query(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date)
        ).order_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date)
        ).all()

        # Format data for frontend (e.g., {name: "Jan 2025", value: 150.00})
        formatted_spending = []
        for year, month, total_expense in spending_data:
            month_name = datetime(year, month, 1).strftime('%b') # e.g., Jan
            formatted_spending.append({
                "name": f"{month_name} {year}",
                "value": round(total_expense, 2)
            })

        return jsonify(formatted_spending), 200

    except Exception as e:
        return jsonify({"message": f"Error generating spending patterns: {str(e)}"}), 500

# --- Get Category Distribution ---
@report_bp.route('/category-distribution', methods=['GET'])
@cross_origin(origins="http://localhost:3000")
def get_category_distribution():
    """
    Calculates the distribution of expenses by category for a specified period.
    Default period: last 6 months.
    """
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    # Get period from query parameters, default to 'all' for now
    # You can add similar date filtering logic here as in spending-patterns if needed
    period = request.args.get('period', '6months')

    end_date = datetime.utcnow().date()
    start_date = end_date
    if period == '3months':
        start_date = end_date - timedelta(days=3 * 30)
    elif period == '1year':
        start_date = end_date - timedelta(days=365)
    else: # Default to 6 months
        start_date = end_date - timedelta(days=6 * 30)

    try:
        # Query to get total expenses per category for the period
        category_data = db.session.query(
            Transaction.category,
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense', # Only consider expenses for category distribution
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(
            Transaction.category
        ).all()

        # Format data for frontend (e.g., {name: "Food", value: 300.00})
        formatted_categories = []
        for category, total_expense in category_data:
            formatted_categories.append({
                "name": category,
                "value": round(total_expense, 2)
            })

        return jsonify(formatted_categories), 200

    except Exception as e:
        return jsonify({"message": f"Error generating category distribution: {str(e)}"}), 500
