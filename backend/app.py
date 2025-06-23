from flask import Flask, jsonify
from flask_cors import CORS 
from backend.config import Config 
from backend.database import db
from .models import User 
from backend.routes.auth_routes import auth_bp 
from backend.routes.transactions_routes import transactions_bp 
from backend.routes.budget_routes import budget_bp
from backend.routes.report_routes import report_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app) 

    db.init_app(app)
    app.register_blueprint(auth_bp) 
    app.register_blueprint(transactions_bp) 
    app.register_blueprint(budget_bp)
    app.register_blueprint(report_bp)


    @app.route('/')
    def home():
        return jsonify({"message": "Backend is running!"}), 200

    return app

if __name__ == '__main__':
    app = create_app() # Create the Flask application instance

    with app.app_context():
        db.create_all()
    app.run(debug=True)
