from flask import Blueprint, request, jsonify
from app.models import User, Doctor
from app import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    is_doctor = data.get('is_doctor', False)
    print("/api/register/ ", data, name, email, is_doctor)
    
    if not name:
        return jsonify({'error': 'Missing name field'}), 400
    if not email:
        return jsonify({'error': 'Missing email field'}), 400
    if not password:
        return jsonify({'error': 'Missing passowrd field'}), 400

    if User.query.filter_by(email=email).first():
        print("error: User already exists")
        return jsonify({'error': 'User already exists'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    if is_doctor:
        print("doc signup\n")
        user = Doctor(name=name, email=email, password=hashed_pw)
        user = User(name=name, email=email, password=hashed_pw, is_doctor=True)
        db.session.add(user)
        db.session.commit()
    else:
        print("patient signup\n")
        user = User(name=name, email=email, password=hashed_pw, is_doctor=False)
        db.session.add(user)
        db.session.commit()
    

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity={
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'is_doctor': user.is_doctor
    })

    return jsonify({'access_token': access_token}), 200
