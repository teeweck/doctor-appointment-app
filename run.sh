#!/bin/bash

# Set paths
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
VENV_DIR="$BACKEND_DIR/venv"

# Start the backend
echo "Starting Flask backend..."
cd "$BACKEND_DIR"
source "$VENV_DIR/bin/activate"
export FLASK_APP=app
export FLASK_ENV=development
flask run &
BACKEND_PID=$!
cd ..

# Start the frontend
echo "Starting React frontend..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for both processes
echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
echo "Press [CTRL+C] to stop both servers."

wait $BACKEND_PID $FRONTEND_PID
