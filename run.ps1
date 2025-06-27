# run.ps1
$ErrorActionPreference = "Stop"

Write-Host "`n🩺 Starting Doctor Appointment App..." -ForegroundColor Cyan

# Detect folders
$backend = Get-ChildItem -Directory | Where-Object { $_.Name -match "backend" }
$frontend = Get-ChildItem -Directory | Where-Object { $_.Name -match "frontend" }

if (-not $backend -or -not $frontend) {
    Write-Error "❌ Could not find 'backend' or 'frontend' directories."
    exit 1
}

# ----- BACKEND -----
Write-Host "`n🔧 Setting up Flask backend..." -ForegroundColor Yellow
Set-Location $backend.FullName

# Create virtual environment if not exists
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Created Python virtual environment."
}

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Install dependencies
if (-not (Test-Path "requirements.txt")) {
    Write-Host "⚠️ No requirements.txt found, skipping pip install."
} else {
    pip install -r requirements.txt
    Write-Host "✅ Python packages installed."
}

# Set Flask env vars
$env:FLASK_APP = "app"
$env:FLASK_ENV = "development"

# Start Flask in background
Start-Job -ScriptBlock {
    Set-Location $using:backend.FullName
    & .\venv\Scripts\Activate.ps1
    $env:FLASK_APP = "app"
    $env:FLASK_ENV = "development"
    flask run
} | Out-Null

Set-Location ..  # Back to root

# ----- FRONTEND -----
Write-Host "`n🧩 Setting up React frontend..." -ForegroundColor Yellow
Set-Location $frontend.FullName

# Install npm packages if node_modules is missing
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ npm packages installed."
}

# Start React dev server
Start-Job -ScriptBlock {
    Set-Location $using:frontend.FullName
    npm run dev
} | Out-Null

Set-Location ..  # Back to root

Write-Host "`n🚀 Both backend (localhost:5000) and frontend (localhost:5173) are starting..." -ForegroundColor Green
Write-Host "⏳ Please wait a few seconds and open your browser."
Write-Host "❌ Press Ctrl+C to manually stop servers."
