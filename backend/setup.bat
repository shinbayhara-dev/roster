@echo off
echo ========================================
echo CSSD Roster Pro - Backend Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js terdeteksi: 
node --version
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] psql tidak ditemukan di PATH
    echo Pastikan PostgreSQL sudah terinstall
    echo.
)

REM Check if .env exists
if not exist .env (
    echo [INFO] File .env tidak ditemukan
    echo Membuat .env dari .env.example...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Edit file .env dan sesuaikan konfigurasi database!
    echo Tekan tombol apapun setelah selesai edit .env...
    pause
)

REM Install dependencies
echo ========================================
echo Installing dependencies...
echo ========================================
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal install dependencies
    pause
    exit /b 1
)
echo.

REM Ask to run migration
echo ========================================
echo Database Migration
echo ========================================
echo Apakah Anda ingin menjalankan migrasi database sekarang?
echo Pastikan:
echo 1. PostgreSQL sudah berjalan
echo 2. Database 'cssd_roster' sudah dibuat
echo 3. File .env sudah dikonfigurasi dengan benar
echo.
set /p migrate="Jalankan migrasi? (y/n): "

if /i "%migrate%"=="y" (
    echo.
    echo Menjalankan migrasi database...
    node migrations/schema.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Migrasi gagal!
        echo Periksa:
        echo 1. PostgreSQL service berjalan
        echo 2. Database 'cssd_roster' sudah dibuat
        echo 3. Kredensial di .env sudah benar
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Migrasi database berhasil!
)

echo.
echo ========================================
echo Setup selesai!
echo ========================================
echo.
echo Untuk menjalankan server:
echo   npm run dev    (development mode dengan auto-reload)
echo   npm start      (production mode)
echo.
echo Server akan berjalan di: http://localhost:3001
echo.
echo Default admin login:
echo   Email: admin@cssd.com
echo   Password: admin123
echo.
pause
