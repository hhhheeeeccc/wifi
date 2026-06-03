# 🏗️ البنية الاحترافية للمشروع

## 📂 الهيكل الكامل

```
wifi/
├── src/
│   ├── main/                          # عمليات Electron الرئيسية
│   │   ├── index.js                   # نقطة الدخول الرئيسية
│   │   ├── handlers/                  # معالجات IPC
│   │   │   ├── systemHandlers.js      # معالجات النظام
│   │   │   ├── hotspotHandlers.js     # معالج��ت نقطة الاتصال
│   │   │   └── firewallHandlers.js    # معالجات جدار الحماية
│   │   └── utils/                     # أدوات مساعدة
│   │       ├── processUtils.js        # تنفيذ العمليات
│   │       ├── validators.js          # التحقق والتطهير
│   │       └── logger.js              # نظام التسجيل
│   │
│   ├── preload/                       # Preload Script
│   │   └── index.js                   # جسر IPC الآمن
│   │
│   └── ui/                            # الواجهة (UI)
│       ├── index.html                 # صفحة HTML الرئيسية
│       ├── css/                       # أنماط CSS
│       │   ├── styles.css             # الملف الرئيسي
│       │   ├── variables.css          # المتغيرات والألوان
│       │   ├── global.css             # الأنماط العامة
│       │   ├── header.css             # أنماط الرأس
│       │   ├── layout.css             # أنماط التخطيط
│       │   ├─�� forms.css              # أنماط النماذج
│       │   ├── buttons.css            # أنماط الأزرار
│       │   ├── status.css             # أنماط الحالة
│       │   ├── clients.css            # أنماط قائمة الأجهزة
│       │   └── responsive.css         # الاستجابة
│       └── js/                        # JavaScript
│           └── app.js                 # تطبيق الواجهة
│
├── assets/                            # الموارد
│   ├── icon.ico                       # أيقونة التطبيق
│   ├── installerHeader.bmp            # رأس المثبت
│   └── installerSidebar.bmp           # جانب المثبت
│
├── build/                             # ملفات البناء (يُنشأ تلقائياً)
├── dist/                              # المخرجات (يُنشأ تلقائياً)
├── docs/                              # التوثيق
│   ├── ARCHITECTURE.md                # معمارية المشروع
│   ├── API.md                         # توثيق API
│   └── CONTRIBUTING.md                # إرشادات المساهمة
│
├── package.json                       # معلومات المشروع
├── package-lock.json                  # قفل المكتبات
├── main.js                            # (يُستبدل بـ src/main/index.js)
├── preload.js                         # (يُستبدل بـ src/preload/index.js)
├── index.html                         # (يُستبدل بـ src/ui/index.html)
├── renderer.js                        # (يُستبدل بـ src/ui/js/app.js)
├── build.sh                           # برنامج البناء (Linux/Mac)
├── build.bat                          # برنامج البناء (Windows)
├── .gitignore                         # ملف Git
├── README.md                          # الملف الرئيسي
├── BUILD_GUIDE.md                     # دليل البناء
├── INSTALLATION.md                    # تعليمات التثبيت
└── QUICK_START.md                     # البداية السريعة
```

---

## 🎯 أغراض الملفات

### `src/main/` - العمليات الرئيسية
**المسؤول عن:**
- إدارة نافذة التطبيق
- معالجة IPC (الاتصال بين العمليات)
- تنفيذ العمليات في النظام
- تسجيل الأحداث

### `src/preload/` - جسر الأمان
**المسؤول عن:**
- تعريض API آمن
- منع الوصول المباشر إلى Node.js
- تحقيق عزل السياق (Context Isolation)

### `src/ui/` - الواجهة
**المسؤول عن:**
- واجهة المستخدم
- تصميم الصفحة
- معالجة أحداث المستخدم

---

## 🔄 تدفق البيانات

```
┌──────────────────────┐
│   واجهة المستخدم     │  (src/ui/)
│  (HTML + CSS + JS)   │
└──────────┬───────────┘
           │ تتصل عبر
           ▼
┌──────────────────────┐
│   Preload Script      │  (src/preload/)
│   (جسر آمن)          │
└──────────┬───────────┘
           │ تتصل عبر IPC
           ▼
┌──────────────────────┐
│   Main Process        │  (src/main/)
│   (معالجات)          │
└──────────┬───────────┘
           │ تنفذ العمليات
           ▼
┌──────────────────────┐
│   نظام التشغيل       │
│   (Windows API)      │
└──────────────────────┘
```

---

## 🔐 الأمان

### Context Isolation
- الواجهة معزولة عن Node.js
- الوصول محدود عبر Preload Script

### Input Validation
- تطهير جميع المدخلات
- التحقق من الأنواع

### IPC Communication
- جميع التواصل آمن
- لا توجد عمليات خطرة

---

## 📝 أمثلة الاستخدام

### إضافة معالج IPC جديد:

1. إنشاء الدالة في `src/main/handlers/`:
```javascript
// src/main/handlers/newHandlers.js
async function newHandler(event, data) {
  // منطق الدالة
  return result;
}

module.exports = { newHandler };
```

2. تسجيل المعالج في `src/main/index.js`:
```javascript
ipcMain.handle('namespace:action', newHandlers.newHandler);
```

3. تعريضها في `src/preload/index.js`:
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  action: () => ipcRenderer.invoke('namespace:action'),
});
```

4. استخدامها في الواجهة:
```javascript
const result = await window.electronAPI.action();
```

---

## 🚀 المميزات

✅ **منفصلة**: كل ملف له مسؤولية واحدة  
✅ **قابلة للصيانة**: سهلة التعديل والتطوير  
✅ **آمنة**: معايير أمان عالية  
✅ **موثقة**: تعليقات واضحة في الكود  
✅ **قابلة للتوسع**: سهلة إضافة ميزات جديدة  

---

## 📚 قراءات إضافية

- [معمارية المشروع](docs/ARCHITECTURE.md)
- [توثيق API](docs/API.md)
- [دليل المساهمة](docs/CONTRIBUTING.md)
