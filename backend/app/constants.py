MAX_STRING_LENGTH = 120
DISPLAY_MONTHS_WORTH_OF_APPOINTMENTS = 4

# Doctor working hours (in 24-hour format)
DOCTOR_WORKING_HOURS_START = 9
DOCTOR_WORKING_HOURS_END = 18

# Doctor break time (in 24-hour format)
# Assuming a 1-hour break from 12:00 to 13:00
# Adjust these times as needed
DOCTOR_BREAK_START = 12
DOCTOR_BREAK_END = 13

# Configurable values for doctor availability - adjusted based on the doctor's schedule
DOCTOR_WORKING_DAYS_PER_WEEK = 7
DOCTOR_SLOTS_PER_DAY = 16  # 30-minute slots
DOCTOR_MAX_SLOTS_PER_DAY = ((DOCTOR_WORKING_HOURS_END - DOCTOR_WORKING_HOURS_START) * 2) - ((DOCTOR_BREAK_END - DOCTOR_BREAK_START) * 2)  # 30-minute slots