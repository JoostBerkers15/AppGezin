@echo off
echo ========================================
echo Gezin App Backend Installatie
echo ========================================
echo.

cd backend

echo Stap 1: Virtual environment aanmaken...
python -m venv venv
echo Virtual environment aangemaakt!
echo.

echo Stap 2: Virtual environment activeren...
call venv\Scripts\activate.bat
echo.

echo Stap 3: Dependencies installeren...
pip install -r requirements.txt
echo.

echo ========================================
echo Backend dependencies geinstalleerd!
echo ========================================
echo.
echo Je kunt nu de backend starten met:
echo   start-backend.bat
echo.
pause
