from backend.database import db
from datetime import datetime

# Assuming User model is already here:
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    budgets = db.relationship('Budget', backref='user', lazy=True) # NEW: Relationship to Budgets

    def set_password(self, password):
        from werkzeug.security import generate_password_hash # Import here to avoid circular
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash # Import here to avoid circular
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

# Assuming Transaction model is already here:
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Transaction {self.description} - {self.amount}>'

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'category': self.category,
            'date': self.date.isoformat() if self.date else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user_id': self.user_id
        }

# NEW: Budget Model
class Budget(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    # Foreign Key to link budgets to users
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Budget {self.category}: {self.amount} from {self.start_date} to {self.end_date}>'

    def to_dict(self):

        return {
            'id': self.id,
            'category': self.category,
            'amount': self.amount,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user_id': self.user_id
        }
