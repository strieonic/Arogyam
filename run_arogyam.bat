@echo off
echo Starting Arogyam Platform...

:: Start the Backend Server
echo Launching Backend Server...
start "Arogyam Backend" cmd /k "cd server && npm run dev"

:: Start the Frontend Server
echo Launching Frontend Server...
start "Arogyam Frontend" cmd /k "cd frontend && npm run dev"

:: Wait for servers to initialize (5 seconds)
echo Waiting for servers to start...
timeout /t 5 /nobreak > nul

:: Open the browser
echo Opening Browser...
start http://localhost:5173

echo Arogyam is now running!
pause
