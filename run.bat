@echo off
SETLOCAL

REM === Step 1: Start Backend ===
echo Installing Python backend dependencies...
cd backend
pip install -r requirements.txt

echo Starting Flask backend server...
@REM start cmd /k "set FLASK_APP=run.py && set FLASK_ENV=development && flask run"
start cmd /k "python run.py"
cd ..

REM === Step 2: Start Frontend ===
echo Installing frontend npm packages...
cd frontend
call npm install

echo Starting React frontend dev server...
start cmd /k "npm run dev"
cd ..

echo -------------------------------------
echo Backend and frontend are running.
echo Press [Ctrl+C] to stop servers manually.
echo -------------------------------------
ENDLOCAL
