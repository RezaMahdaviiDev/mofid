# راهنمای شروع سریع

## مراحل نصب

1. **نصب وابستگی‌ها**:
   ```bash
   npm install
   ```

2. **کامپایل TypeScript**:
   ```bash
   npm run build
   ```

3. **اجرای تست لاگین (اولین بار)**:
   ```bash
   npm run test:easy:login:auto
   ```

4. **اجرای تست خرید**:
   ```bash
   npm run test:easy:speed
   ```

## نکات مهم

- در اولین اجرا باید به صورت دستی لاگین کنید
- Session بعد از لاگین ذخیره می‌شود
- برای اطلاعات بیشتر به [README اصلی](../../README.md) مراجعه کنید

## استفاده از Dashboard

برای استفاده از رابط کاربری وب:

```bash
npm run dashboard
```

سپس به آدرس `http://localhost:3000` بروید.

برای جزئیات بیشتر به [راهنمای Dashboard](dashboard-guide.md) مراجعه کنید.


