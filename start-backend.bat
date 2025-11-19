@echo off
echo Starting Gezin App Backend...
cd backend

REM Check if venv exists
if not exist "venv\" (
    echo.
    echo ERROR: Virtual environment niet gevonden!
    echo Voer eerst install-backend.bat uit om de backend te installeren.
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start FastAPI server
python -m uvicorn main:app --reload --port 8000
