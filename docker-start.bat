@echo off
echo ====================================
echo   Gezin App - Docker Start
echo ====================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is niet actief!
    echo Start Docker Desktop en probeer opnieuw.
    pause
    exit /b 1
)

echo [INFO] Docker is actief
echo.

echo [INFO] Stoppen van bestaande containers...
docker-compose down

echo.
echo [INFO] Bouwen van containers...
docker-compose build

echo.
echo [INFO] Starten van containers...
docker-compose up -d

echo.
echo [SUCCESS] Gezin App is gestart!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Gebruik 'docker-stop.bat' om de applicatie te stoppen
echo Gebruik 'docker-logs.bat' om logs te bekijken
echo.
pause

