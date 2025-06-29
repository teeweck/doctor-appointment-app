@echo off
SETLOCAL

REM === Step 1: Start Backend ===
echo Installing Python backend dependencies...
cd backend

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install backend dependencies
pip install -r requirements.txt

REM Run Flask backend in new terminal window
echo Starting Flask backend server...
start cmd /k "call venv\Scripts\activate.bat && set FLASK_APP=run.py && set FLASK_ENV=development && flask run"
cd ..

REM === Step 2: Start Frontend ===
echo Installing frontend npm packages...
cd frontend
call npm install

REM Run frontend dev server in new terminal window
echo Starting React frontend dev server...
start cmd /k "npm run dev"
cd ..

echo -------------------------------------
echo Backend and frontend are running.
echo Press [Ctrl+C] in each terminal to stop.
echo -------------------------------------
ENDLOCAL
