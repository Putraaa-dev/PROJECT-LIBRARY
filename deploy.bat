@echo off
REM Production Build Script for Windows
REM Usage: deploy.bat

echo.
echo ===== Production Build Script =====
echo.

echo Checking Node modules...
if not exist node_modules (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

echo.
echo Building frontend...
call npm run build

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ===== Build Complete! =====
echo.
echo Build output in: dist\
echo.
echo Next steps:
echo  1. Verify: npm start
echo  2. Deploy: git push hostinger main
echo.
pause
