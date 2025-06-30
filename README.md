<H1>Doctor-appointment-app</H1>
# Doctor Appointment App

A full-stack web application for booking and managing doctor appointments. Built with React (frontend) and Flask (backend).

## Features

- User registration and login (doctor or patient)
- Doctors can set their working days and slots per day
- Patients can view doctor availability and book appointments
- Both doctors and patients can view and cancel their appointments
- Calendar view for easy scheduling

## Running instructions

You can use the provided "run.bat" script from the project root to start the backend and frontend.

## Configurable values

| Variable Name                | Default Value | Description                                    |
| ---------------------------- | ------------- | ---------------------------------------------- |
| DOCTOR_WORKING_DAYS_PER_WEEK | 7             | Number of working days per week for doctors    |
| DOCTOR_SLOTS_PER_DAY         | 16            | Number of appointment slots per day            |
| DOCTOR_MAX_SLOTS_PER_DAY     | 16            | Maximum slots per day (based on working hours) |
| DOCTOR_WORKING_HOURS_START   | 9             | Doctor's workday start hour (24h format)       |
| DOCTOR_WORKING_HOURS_END     | 18            | Doctor's workday end hour (24h format)         |
| DOCTOR_BREAK_START           | 12            | Start hour of doctor's break (24h format)      |
| DOCTOR_BREAK_END             | 13            | End hour of doctor's break (24h format)        |

## Key assumptions

## Future enhancements
