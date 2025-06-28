from flask import Blueprint, jsonify, request
from app.models import Doctor, Appointment, User
from app import db
from datetime import datetime, time, timedelta

from app.constants import DISPLAY_MONTHS_WORTH_OF_APPOINTMENTS, DOCTOR_WORKING_HOURS_START, DOCTOR_WORKING_HOURS_END, DOCTOR_BREAK_START, DOCTOR_BREAK_END, DOCTOR_WORKING_DAYS_PER_WEEK, DOCTOR_SLOTS_PER_DAY, DOCTOR_MAX_SLOTS_PER_DAY

doctors_bp = Blueprint('doctors', __name__)

# Get all doctors (GET)
@doctors_bp.route('/api/doctors/', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([
        {
            'id': d.id,
            'name': d.name,
            'appointments': [
                {
                    'id': a.id,
                    'patient_id': a.patient_id,
                    'date': a.date.strftime('%Y-%m-%d') if a.date else None,
                    'time': a.time.strftime('%H:%M:%S') if a.time else None
                    # 'description': a.description if a.description else None  # Include description
                }
                for a in d.appointments
            ]
        }
        for d in doctors
    ])

# Get all users (GET)
@doctors_bp.route('/api/users/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([
        {
            'id': u.id, 
            'name': u.name, 
            'is_doctor': u.is_doctor, 
            'appointments': [
                {
                    'id': a.id, 
                    'date': a.date.strftime('%Y-%m-%d') if a.date else None,
                    'time': a.time.strftime('%H:%M:%S') if a.time else None
                    # 'description': a.description if a.description else None  # Include description
                } for a in u.appointments]
        } for u in users
    ])

# Get all appointments (GET)
@doctors_bp.route('/api/appointments/', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([{
        'id': a.id,
        'doctor_id': a.doctor_id,
        'patient_id': a.patient_id,
        'patient_name': a.patient_name,  # Include patient's name in API response
        'date': a.date.strftime("%Y-%m-%d") if a.date else None,
        'time': a.time.strftime("%H:%M:%S") if a.time else None,
        'description': a.description  # Include description in API response
    } for a in appointments])



# Get doctor availability (GET)
@doctors_bp.route('/api/doctors/name/<string:doctor_name>/availability', methods=['GET'])
def get_doctor_availability_by_name(doctor_name):
    doctor = Doctor.query.filter_by(name=doctor_name).first()
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    events = []
    today = datetime.today().date()

    # Only generate slots for working days
    for day_offset in range(DISPLAY_MONTHS_WORTH_OF_APPOINTMENTS * 30):
        date = today + timedelta(days=day_offset)
        # Only display appointments for doctor working n days a week
        # Assuming doctor works for n number of days from Mon inclusive
        if DOCTOR_WORKING_DAYS_PER_WEEK > 7:
            return jsonify({'error': 'Invalid number of working days per week'}), 400
        if date.weekday() >= DOCTOR_WORKING_DAYS_PER_WEEK:
            continue
        date_str = date.isoformat()
        slots_added = 0
        for hour in range(DOCTOR_WORKING_HOURS_START, DOCTOR_WORKING_HOURS_END):
            for minute in [0, 30]:
                if slots_added >= DOCTOR_SLOTS_PER_DAY or slots_added >= DOCTOR_MAX_SLOTS_PER_DAY:
                    break
                slot_time = time(hour, minute)
                # Skip lunch break
                if (hour >= DOCTOR_BREAK_START and hour < DOCTOR_BREAK_END):
                    continue
                time_str = f"{hour:02d}:{minute:02d}"

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
                    "end": f"{date_str}T{hour:02d}:{(minute+30)%60:02d}:00" if minute == 0 else f"{date_str}T{(hour+1):02d}:00:00"
                })
                slots_added += 1
            if slots_added >= DOCTOR_SLOTS_PER_DAY:
                break

    return jsonify(events)

# Book appointment (POST)
@doctors_bp.route('/api/doctors/name/<string:doctor_name>/book', methods=['POST'])
def book_appointment(doctor_name):
    print("/book appointment called for doctor:", doctor_name)
    doctor = Doctor.query.filter_by(name=doctor_name).first()
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    data = request.get_json()
    date_str = data.get('date')  # e.g. '2025-06-27'
    time_str = data.get('time')  # e.g. '10:00'
    patient_id = data.get('patient_id')
    patient_name = data.get('patient_name')  # Get patient's name from request
    description = data.get('description')  # Get description from request
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
        patient_name=patient_name,
        date=appt_date,
        time=appt_time,
        description=description  # Save description
    )
    db.session.add(new_appt)
    db.session.commit()
    return jsonify({'message': 'Appointment booked successfully'}), 201

# Delete appointment (DELETE)
@doctors_bp.route('/api/appointments/<int:appointment_id>/delete', methods=['DELETE'])
def delete_appointment(appointment_id):
    print("/delete appointment called for appointment_id:", appointment_id)
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({'error': 'Appointment not found'}), 404

    db.session.delete(appt)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted'}), 200

# Delete all appointment (DELETE)
@doctors_bp.route('/api/appointments/delete/all', methods=['DELETE'])
def delete_all_appointments():
    Appointment.query.delete()
    db.session.commit()
    return jsonify({'message': 'All appointments deleted'}), 200