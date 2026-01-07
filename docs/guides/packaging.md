# راهنمای بسته‌بندی پروژه

## فایل‌های ضروری برای بسته‌بندی

### فایل‌های کد منبع (src/)

```
src/
├── core/
│   └── browser.ts
└── brokerages/
    └── easy/
        ├── buyAction.ts
        ├── buyActionJS.ts
        ├── buyActionUltra.ts
        ├── buyActionAPI.ts
        ├── buyActionKeyboard.ts
        └── logger.ts
```

### فایل‌های تست (tests/)

```
tests/
└── easy/
    ├── test_speed.ts
    ├── test_model_2.ts
    ├── test_model_3.ts
    ├── test_model_4.ts
    └── test_api_speed.ts
```

### فایل‌های پیکربندی

```
package.json
tsconfig.json
.gitignore (در صورت وجود)
```

### فایل‌های مستندات

```
README.md
docs/
```

**نکته**: با ساختار جدید، تمام مستندات در پوشه `docs/` قرار دارند.

### فایل‌های ضبط شده (Recordings) - اختیاری

```
Recording 1_6_2026 at 11_17_35 AM.json
6 (recording file)
7 (recording file)
8 (recording file)
docs/archive/d.easytrader.ir.har (فایل HAR برای تحلیل API)
```

### فایل‌های حذف شده (نباید در ZIP باشند)

```
.user-data/          # حاوی session و اطلاعات حساس
node_modules/        # وابستگی‌ها (باید npm install شود)
dist/                # فایل‌های کامپایل شده (باید build شود)
logs/                # لاگ‌های موقت
```

---

## دستور ایجاد ZIP (Windows PowerShell)

```powershell
# ایجاد ZIP با تمام فایل‌های ضروری
Compress-Archive -Path `
  src, `
  tests, `
  docs, `
  package.json, `
  package-lock.json, `
  tsconfig.json, `
  README.md `
  -DestinationPath agah-autobuy-project.zip -Force
```

## دستور ایجاد ZIP (Linux/Mac)

```bash
zip -r agah-autobuy-project.zip \
  src/ \
  tests/ \
  docs/ \
  package.json \
  package-lock.json \
  tsconfig.json \
  README.md
```

---

## چک‌لیست قبل از بسته‌بندی

- [ ] تمام فایل‌های کد منبع موجود است
- [ ] فایل‌های مستندات به‌روز هستند
- [ ] فایل‌های حساس (.user-data) حذف شده‌اند
- [ ] node_modules حذف شده است
- [ ] README.md کامل و به‌روز است
- [ ] تمام مستندات در پوشه `docs/` قرار دارند

