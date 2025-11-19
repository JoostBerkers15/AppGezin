@echo off
echo ====================================
echo   Gezin App - Docker Stop
echo ====================================
echo.

echo [INFO] Stoppen van containers...
docker-compose down

echo.
echo [SUCCESS] Alle containers zijn gestopt
echo.
pause

