#!/bin/bash
# WiFi Share Pro - Build Script
# هذا الملف يساعد في بناء التطبيق بسهولة

echo "🔧 WiFi Hotspot Pro - Build System"
echo "===================================="
echo ""

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "❌ خطأ: Node.js غير مثبت"
    echo "تحميل من: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js موجود: $(node --version)"
echo "✅ npm موجود: $(npm --version)"
echo ""

# التحقق من المكتبات
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات..."
    npm install
    echo ""
fi

# عرض الخيارات
echo "اختر نوع البناء:"
echo "1. ملف التثبيت (NSIS Installer)"
echo "2. الملف المحمول (Portable)"
echo "3. جميع الصيغ (All Formats)"
echo "4. اختبار التطبيق (npm start)"
echo "5. تنظيف وإعادة بنا��"
echo ""
read -p "اختيارك (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔨 جاري بناء ملف التثبيت..."
        npm run build:installer
        echo ""
        echo "✅ تم! الملف موجود في: dist/WiFi Hotspot Pro 2.0.0.exe"
        ;;
    2)
        echo ""
        echo "🔨 جاري بناء الملف المحمول..."
        npm run build:portable
        echo ""
        echo "✅ تم! الملف موجود في: dist/WiFi Hotspot Pro-2.0.0-portable.exe"
        ;;
    3)
        echo ""
        echo "🔨 جاري بناء جميع الصيغ..."
        npm run build
        echo ""
        echo "✅ تم! جميع الملفات موجودة في مجلد: dist/"
        ;;
    4)
        echo ""
        echo "🚀 تشغيل التطبيق..."
        npm start
        ;;
    5)
        echo ""
        echo "🧹 تنظيف ملفات البناء السابقة..."
        rm -rf dist node_modules
        echo "📦 إعادة تثبيت المكتبات..."
        npm install
        echo ""
        echo "🔨 جاري بناء التطبيق..."
        npm run build
        echo ""
        echo "✅ تم البناء بنجاح!"
        ;;
    *)
        echo "❌ اختيار غير صحيح"
        exit 1
        ;;
esac

echo ""
echo "✨ انتهى!"
