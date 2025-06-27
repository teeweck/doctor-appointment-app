from . import db
from app.constants import MAX_STRING_LENGTH

max_input_length = MAX_STRING_LENGTH

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(max_input_length), nullable=False)
    email = db.Column(db.String(max_input_length), unique=True, nullable=False)
    password = db.Column(db.String(max_input_length), nullable=False)
    is_doctor = db.Column(db.Boolean, default=False)
    appointments = db.relationship('Appointment', backref='patient', lazy=True)

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(max_input_length), nullable=False)
    email = db.Column(db.String(max_input_length), unique=True, nullable=False)
    password = db.Column(db.String(max_input_length), nullable=False)
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)