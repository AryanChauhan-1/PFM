from flask import Blueprint, request, jsonify, make_response
from flask_cors import cross_origin
from backend.database import db
from backend.models import Transaction, User
from datetime import datetime
from sqlalchemy import func # Import func for SQL functions like sum

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

# --- Helper function to get current user ID (TEMPORARY: Bypass for testing) ---
def get_current_user_id_placeholder():
    return 1 # For testing purposes, assume user ID 1 exists.


# --- CORS Preflight Handler ---
@transactions_bp.route('/', methods=['OPTIONS'])
@transactions_bp.route('/<int:transaction_id>', methods=['OPTIONS'])
@transactions_bp.route('/summary', methods=['OPTIONS']) # Add OPTIONS for summary route
@cross_origin(origins="http://localhost:3000", methods=['GET', 'POST', 'PUT', 'DELETE'], headers=['Content-Type', 'Authorization'])
def options_handler():
    response = make_response()
    return response, 200

# --- Get All Transactions for a User ---
@transactions_bp.route('/', methods=['GET'])
@cross_origin(origins="http://localhost:3000")
def get_transactions():
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    transactions = Transaction.query.filter_by(user_id=current_user_id).order_by(Transaction.timestamp.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200

# --- Add a New Transaction ---
@transactions_bp.route('/', methods=['POST'])
@cross_origin(origins="http://localhost:3000")
def add_transaction():
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    required_fields = ["description", "amount", "type", "category"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required transaction fields (description, amount, type, category)"}), 400

    try:
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date() if 'date' in data and data['date'] else datetime.utcnow().date()
        amount_float = float(data['amount'])

        new_transaction = Transaction(
            description=data['description'],
            amount=amount_float,
            type=data['type'],
            category=data['category'],
            date=transaction_date,
            user_id=current_user_id
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({"message": "Transaction added successfully", "transaction": new_transaction.to_dict()}), 201
    except ValueError:
        return jsonify({"message": "Invalid amount or date format. Date should be YYYY-MM-DD."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error adding transaction: {str(e)}"}), 500

# --- Update an Existing Transaction ---
@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@cross_origin(origins="http://localhost:3000")
def update_transaction(transaction_id):
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided for update"}), 400

    transaction = Transaction.query.filter_by(id=transaction_id, user_id=current_user_id).first()
    if not transaction:
        return jsonify({"message": "Transaction not found or not authorized"}), 404

    try:
        if 'description' in data:
            transaction.description = data['description']
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'type' in data:
            transaction.type = data['type']
        if 'category' in data:
            transaction.category = data['category']
        if 'date' in data and data['date']:
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        db.session.commit()
        return jsonify({"message": "Transaction updated successfully", "transaction": transaction.to_dict()}), 200
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Invalid amount or date format. Date should be YYYY-MM-DD."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating transaction: {str(e)}"}), 500

# --- Delete a Transaction ---
@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@cross_origin(origins="http://localhost:3000")
def delete_transaction(transaction_id):
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    transaction = Transaction.query.filter_by(id=transaction_id, user_id=current_user_id).first()
    if not transaction:
        return jsonify({"message": "Transaction not found or not authorized"}), 404

    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({"message": "Transaction deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting transaction: {str(e)}"}), 500

# --- NEW: Dashboard Summary Endpoint ---
@transactions_bp.route('/summary', methods=['GET'])
@cross_origin(origins="http://localhost:3000")
def get_dashboard_summary():
    """
    Calculates and returns summary statistics (total income, total expenses, net balance)
    for the current user.
    """
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    try:
        # Calculate total income
        total_income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'income'
        ).scalar() or 0.0

        # Calculate total expenses
        total_expenses = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense'
        ).scalar() or 0.0

        total_balance = total_income - total_expenses

        return jsonify({
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "total_balance": round(total_balance, 2)
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error calculating summary: {str(e)}"}), 500
