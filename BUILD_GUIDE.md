# 🔧 دليل البناء والتثبيت

## طرق التثبيت المختلفة

### الطريقة 1️⃣: ملف التثبيت (NSIS Installer)
**التثبيت الاحترافي الموصى به**

```bash
# 1. استنساخ المستودع
git clone https://github.com/hhhheeeeccc/wifi.git
cd wifi

# 2. تثبيت المكتبات
npm install

# 3. بناء ملف التثبيت
npm run build:installer
```

✅ **النتيجة**: `dist/WiFi Hotspot Pro 2.0.0.exe` (مثبت احترافي)

**المميزات:**
- ✔️ واجهة تثبيت احترافية
- ✔️ اختيار مجلد التثبيت
- ✔️ إنشاء اختصارات سطح المكتب والقائمة
- ✔️ إمكانية إلغاء التثبيت من لوحة التحكم
- ✔️ تحديثات مستقبلية سهلة

---

### الطريقة 2️⃣: الملف المحمول (Portable)
**تطبيق بدون تثبيت - استخدم من أي مكان**

```bash
npm run build:portable
```

✅ **النتيجة**: `dist/WiFi Hotspot Pro-2.0.0-portable.exe`

**المميزات:**
- ✔️ لا يحتاج تثبيت
- ✔️ يعمل من USB مباشرة
- ✔️ لا يترك آثار في السجل
- ✔️ يمكن نقله بسهولة

---

### الطريقة 3️⃣: البناء الكامل (All Formats)
**ينشئ جميع صيغ التثبيت**

```bash
npm run build
```

✅ **النتيجة**: ملفات متعددة في مجلد `dist/`
- Windows Installer (.exe)
- Portable (.exe)
- ملفات أخرى

---

## 📋 المتطلبات قبل البناء

```bash
# 1. تأكد من تثبيت Node.js (v14 أو أحدث)
node --version

# 2. تأكد من npm
npm --version

# 3. تثبيت المكتبات المطلوبة
npm install

# 4. (اختياري) تثبيت electron-builder عالمياً
npm install -g electron-builder
```

---

## 🎨 تخصيص الأيقونات والصور (اختياري)

لتحسين مظهر المثبت، أضف الصور التالية في مجلد `assets/`:

### الملفات المطلوبة:

```
assets/
├── icon.ico              # أيقونة التطبيق (256x256)
├── installerHeader.bmp   # رأس المثبت (164x314 بكسل)
└── installerSidebar.bmp  # جانب المثبت (164x314 بكسل)
```

**كيفية إنشاء الأيقونات:**
1. استخدم موقع مثل [icoconvert.com](https://icoconvert.com/)
2. حمّل صورة PNG (512x512)
3. حوّلها إلى ICO
4. ضع الملف في `assets/icon.ico`

---

## 🚀 خطوات التثبيت الكاملة للمستخدم

### للمستخدم العادي:
```
1. حمّل ملف WiFi Hotspot Pro 2.0.0.exe
2. انقر عليه نقرتين
3. اتبع التعليمات على الشاشة
4. اختر مجلد التثبيت (C:\Program Files افتراضياً)
5. اضغط "تثبيت"
6. سيظهر الاختصار على سطح المكتب
```

### للمستخدم المتقدم (Portable):
```
1. حمّل WiFi Hotspot Pro-2.0.0-portable.exe
2. شغّله من أي مكان (USB أو سطح المكتب)
3. لا يحتاج تثبيت
```

---

## 🔍 التحقق من البناء

```bash
# اختبر التطبيق قبل البناء
npm start

# إذا عمل بدون مشاكل، ابدأ البناء
npm run build:installer
```

---

## 📊 معلومات البناء

| الخاصية | القيمة |
|--------|--------|
| **اسم التطبيق** | WiFi Hotspot Pro |
| **رقم الإصدار** | 2.0.0 |
| **نوع الملف** | Windows Installer (.exe) |
| **حجم الملف** | ~100-150 MB |
| **متطلبات النظام** | Windows 10+ x64 |
| **وقت البناء** | 2-5 دقائق |

---

## ⚠️ استكشاف الأخطاء

### الخطأ: "electron-builder not found"
```bash
npm install electron-builder --save-dev
```

### الخطأ: "No files found matching"
تأكد من وجود جميع الملفات في الجذر:
- ✅ main.js
- ✅ preload.js
- ✅ renderer.js
- ✅ index.html
- ✅ package.json

### الخطأ: "Build failed"
```bash
# نظّف المكتبات وأعد المحاولة
rm -rf node_modules
npm install
npm run build
```

---

## 📦 توزيع التطبيق

بعد البناء بنجاح:

1. **ملف التثبيت** (`WiFi Hotspot Pro 2.0.0.exe`):
   - شاركه عبر موقعك أو GitHub Releases
   - حجم أصغر من الـ Portable

2. **الملف المحمول** (`WiFi Hotspot Pro-2.0.0-portable.exe`):
   - مثالي لـ USB أو الاستخدام الفوري
   - لا يحتاج تثبيت

---

## 🔐 التوقيع الرقمي (اختياري - للأمان العالي)

للتوقيع على الملفات بشهادة رقمية:

```json
// في package.json تحت section "win":
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password",
  "signingHashAlgorithms": ["sha256"]
}
```

---

## 📝 تحديث الإصدار

لإصدار نسخة جديدة:

```bash
# تحديث رقم الإصدار في package.json
"version": "2.0.1"

# بناء النسخة الجديدة
npm run build:installer

# ستجد الملفات الجديدة في dist/
```

---

## ✅ التحقق النهائي قبل النشر

- [ ] تم اختبار التطبيق بنجاح
- [ ] جميع الميزات تعمل بشكل صحيح
- [ ] لا توجد أخطاء في console
- [ ] رقم الإصدار محدث
- [ ] ملفات البناء موجودة في `dist/`
- [ ] المثبت يعمل على جهاز نظيف

---

**تم! 🎉 تطبيقك الآن جاهز للنشر!**
