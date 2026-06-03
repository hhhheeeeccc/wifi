@echo off
REM WiFi Share Pro - Build Script for Windows
REM هذا الملف يساعد في بناء التطبيق بسهولة على Windows

cls
echo.
echo 🔧 WiFi Hotspot Pro - Build System
echo ====================================
echo.

REM التحقق من Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ خطأ: Node.js غير مثبت
    echo تحميل من: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js موجود: %NODE_VERSION%
echo ✅ npm موجود: %NPM_VERSION%
echo.

REM التحقق من المكتبات
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات...
    call npm install
    echo.
)

REM عرض الخيارات
echo اختر نوع البناء:
echo 1. ملف التثبيت (NSIS Installer)
echo 2. الملف المحمول (Portable)
echo 3. جميع الصيغ (All Formats)
echo 4. اختبار التطبيق (npm start)
echo 5. تنظيف وإعادة بناء
echo.

set /p choice="اختيارك (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🔨 جاري بناء ملف التثبيت...
    call npm run build:installer
    echo.
    echo ✅ تم! الملف موجود في: dist\WiFi Hotspot Pro 2.0.0.exe
    pause
)

if "%choice%"=="2" (
    echo.
    echo 🔨 جاري بناء الملف المحمول...
    call npm run build:portable
    echo.
    echo ✅ تم! الملف موجود في: dist\WiFi Hotspot Pro-2.0.0-portable.exe
    pause
)

if "%choice%"=="3" (
    echo.
    echo 🔨 جاري بناء جميع الصيغ...
    call npm run build
    echo.
    echo ✅ تم! جميع الملفات موجودة في مجلد: dist\
    pause
)

if "%choice%"=="4" (
    echo.
    echo 🚀 تشغيل التطبيق...
    call npm start
)

if "%choice%"=="5" (
    echo.
    echo 🧹 تنظيف ملفات البناء السابقة...
    rmdir /s /q dist
    rmdir /s /q node_modules
    echo 📦 إعادة تثبيت المكتبات...
    call npm install
    echo.
    echo 🔨 جاري بناء التطبيق...
    call npm run build
    echo.
    echo ✅ تم البناء بنجاح!
    pause
)

if not "%choice%"=="1" if not "%choice%"=="2" if not "%choice%"=="3" if not "%choice%"=="4" if not "%choice%"=="5" (
    echo ❌ اختيار غير صحيح
    pause
    exit /b 1
)

echo.
echo ✨ انتهى!
