@echo off
echo ====================================
echo   Gezin App - Docker Rebuild
echo ====================================
echo.

echo [INFO] Stoppen en verwijderen van containers...
docker-compose down

echo.
echo [INFO] Verwijderen van oude images...
docker-compose rm -f

echo.
echo [INFO] Opnieuw bouwen zonder cache...
docker-compose build --no-cache

echo.
echo [INFO] Starten van containers...
docker-compose up -d

echo.
echo [SUCCESS] Applicatie is opnieuw gebouwd en gestart!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
pause

