from flask import Blueprint, request, jsonify
from ..models import User
from ..database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with that email already exists"}), 409 # Conflict

    new_user = User(email=email)
    new_user.set_password(password) # Hash the password

    db.session.add(new_user)
    db.session.commit()

    # In a real app, you might generate a JWT here after registration
    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401 # Unauthorized

    # In a real app, generate and return a JWT token here
    # For now, we'll return a dummy token.
    # Frontend's api.js expects a 'token' field.
    return jsonify({"message": "Login successful", "token": "your-jwt-token-here", "user": {"email": user.email}}), 200