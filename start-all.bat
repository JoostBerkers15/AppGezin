@echo off
echo ========================================
echo Starting Gezin App
echo Backend + Frontend
echo ========================================
echo.

REM Check if backend venv exists
if not exist "backend\venv\" (
    echo ERROR: Backend virtual environment niet gevonden!
    echo Voer eerst install-backend.bat uit.
    echo.
    pause
    exit /b 1
)

echo Starting Backend in new window...
start "Gezin App Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --port 8000"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
npm start
