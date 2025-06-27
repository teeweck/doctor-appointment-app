from flask import Blueprint, jsonify, request
from app.models import Doctor, Appointment
from app import db
from datetime import datetime, time, timedelta

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/api/doctors/', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([{'id': d.id, 'name': d.name} for d in doctors])



# Get doctor availability (GET)
@doctors_bp.route('/api/doctors/name/<string:doctor_name>/availability', methods=['GET'])
def get_doctor_availability_by_name(doctor_name):
    doctor = Doctor.query.filter_by(name=doctor_name).first()
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    events = []
    start_hour = 9
    end_hour = 17
    today = datetime.today().date()

    for day_offset in range(5):
        date = today + timedelta(days=day_offset)
        date_str = date.isoformat()

        for hour in range(start_hour, end_hour):
            slot_time = time(hour, 0)
            time_str = f"{hour:02d}:00"

            blocked = Appointment.query.filter_by(
                doctor_id=doctor.id,
                date=date,
                time=slot_time
            ).first() is not None

            status = "booked" if blocked else "available"
            events.append({
                "title": "Booked" if blocked else "Available",
                "status": status,
                "start": f"{date_str}T{time_str}:00",
                "end": f"{date_str}T{hour+1:02d}:00:00"
            })

    return jsonify(events)

# Book appointment (POST)
@doctors_bp.route('/api/doctors/name/<string:doctor_name>/book', methods=['POST'])
def book_appointment(doctor_name):
    doctor = Doctor.query.filter_by(name=doctor_name).first()
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    data = request.get_json()
    date_str = data.get('date')  # e.g. '2025-06-27'
    time_str = data.get('time')  # e.g. '10:00'
    patient_id = data.get('patient_id')
    if not (date_str and time_str and patient_id):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        appt_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        appt_time = datetime.strptime(time_str, '%H:%M').time()
    except Exception:
        return jsonify({'error': 'Invalid date or time format'}), 400

    # Check if slot is already booked
    existing = Appointment.query.filter_by(
        doctor_id=doctor.id,
        date=appt_date,
        time=appt_time
    ).first()
    if existing:
        return jsonify({'error': 'Slot already booked'}), 409

    # Create appointment
    new_appt = Appointment(
        doctor_id=doctor.id,
        patient_id=patient_id,
        date=appt_date,
        time=appt_time
    )
    db.session.add(new_appt)
    db.session.commit()
    return jsonify({'message': 'Appointment booked successfully'}), 201
