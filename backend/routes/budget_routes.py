from flask import Blueprint, request, jsonify, make_response
from flask_cors import cross_origin
from backend.database import db
from backend.models import Budget, User # Import Budget and User models
from datetime import datetime

budget_bp = Blueprint('budget', __name__, url_prefix='/api/budgets')

def get_current_user_id_placeholder():

    return 1 

@budget_bp.route('/', methods=['OPTIONS'])
@budget_bp.route('/<int:budget_id>', methods=['OPTIONS'])
@cross_origin(origins="http://localhost:3000", methods=['GET', 'POST', 'PUT', 'DELETE'], headers=['Content-Type', 'Authorization'])
def options_handler():
    response = make_response()
    return response, 200

@budget_bp.route('/', methods=['GET'])
@cross_origin(origins="http://localhost:3000")
def get_budgets():

    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    budgets = Budget.query.filter_by(user_id=current_user_id).order_by(Budget.start_date.desc()).all()
    return jsonify([b.to_dict() for b in budgets]), 200

# --- Add a New Budget ---
@budget_bp.route('/', methods=['POST'])
@cross_origin(origins="http://localhost:3000")
def add_budget():
    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    required_fields = ["category", "amount", "start_date", "end_date"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required budget fields (category, amount, start_date, end_date)"}), 400

    try:
        amount_float = float(data['amount'])
        start_date_obj = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

        if start_date_obj > end_date_obj:
            return jsonify({"message": "Start date cannot be after end date"}), 400

        new_budget = Budget(
            category=data['category'],
            amount=amount_float,
            start_date=start_date_obj,
            end_date=end_date_obj,
            user_id=current_user_id
        )
        db.session.add(new_budget)
        db.session.commit()
        return jsonify({"message": "Budget added successfully", "budget": new_budget.to_dict()}), 201
    except ValueError:
        return jsonify({"message": "Invalid amount or date format. Dates should be YYYY-MM-DD."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error adding budget: {str(e)}"}), 500

# --- Update an Existing Budget ---
@budget_bp.route('/<int:budget_id>', methods=['PUT'])
@cross_origin(origins="http://localhost:3000")
def update_budget(budget_id):

    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided for update"}), 400

    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    if not budget:
        return jsonify({"message": "Budget not found or not authorized"}), 404

    try:
        if 'category' in data:
            budget.category = data['category']
        if 'amount' in data:
            budget.amount = float(data['amount'])
        if 'start_date' in data and data['start_date']:
            budget.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data and data['end_date']:
            budget.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

        if budget.start_date > budget.end_date:
            return jsonify({"message": "Start date cannot be after end date"}), 400

        db.session.commit()
        return jsonify({"message": "Budget updated successfully", "budget": budget.to_dict()}), 200
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Invalid amount or date format. Dates should be YYYY-MM-DD."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating budget: {str(e)}"}), 500

# --- Delete a Budget ---
@budget_bp.route('/<int:budget_id>', methods=['DELETE'])
@cross_origin(origins="http://localhost:3000")
def delete_budget(budget_id):

    current_user_id = get_current_user_id_placeholder()
    if not current_user_id:
        return jsonify({"message": "Authentication required"}), 401

    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    if not budget:
        return jsonify({"message": "Budget not found or not authorized"}), 404

    try:
        db.session.delete(budget)
        db.session.commit()
        return jsonify({"message": "Budget deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting budget: {str(e)}"}), 500
