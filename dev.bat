@echo off
cd /d "%~dp0"
echo.
echo  Project dev server — port 9003 (not 3000)
echo  Open: http://127.0.0.1:9003
echo.
npm run dev
