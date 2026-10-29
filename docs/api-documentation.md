# توثيق واجهات برمجة التطبيقات
## Enterprise RESTful API Specification

---

## 1. المعايير العامة والبروتوكول (API Standards and Conventions)

- **البروتوكول:** RESTful JSON API عبر اتصالات آمنة (HTTPS).
- **المسار الأساسي (Base URL):** `https://api.yourdomain.com/api` (أو محلياً: `http://127.0.0.1:8000/api`).
- **الترويسات الإجبارية (Required Headers):**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (لجميع المسارات المحمية)
- **هيكل الاستجابة القياسي في حال النجاح (Standard Success Envelope):**
  ```json
  {
    "success": true,
    "message": "تم تنفيذ العملية بنجاح",
    "data": {}
  }
  ```
- **هيكل الاستجابة القياسي في حال الخطأ (Standard Error Envelope):**
  ```json
  {
    "success": false,
    "message": "وصف واضح ودقيق لسبب الخطأ باللغة العربية",
    "error_code": "INVALID_CREDENTIALS"
  }
  ```
- **رموز الحالة المعتمدة (HTTP Status Codes):**
  - `200 OK`: نجاح معالجة الطلب وإرجاع البيانات.
  - `201 Created`: نجاح إنشاء مورد جديد في قاعدة البيانات.
  - `400 Bad Request`: خطأ في مدخلات الطلب أو خرق لقواعد العمل (مثل التواجد خارج الـ Geofence).
  - `401 Unauthorized`: الرمز المميز (Token) مفقود، غير صالح، أو منتهي الصلاحية.
  - `403 Forbidden`: رفض صلاحية الدخول لعدم امتلاك رتبة المدير (`owner`).
  - `404 Not Found`: المورد المطلوب غير موجود بقاعدة البيانات.
  - `422 Unprocessable Entity`: فشل التحقق من صحة حقول الإدخال الإلزامية.
  - `500 Internal Server Error`: خطأ غير متوقع في الخادم.

---

## 2. مسارات المصادقة والحساب (Authentication Endpoints)

### 2.1. تسجيل الدخول (User Login)
- **المسار:** `POST /api/auth/login`
- **الصلاحية المطلوبة:** عام (Public)
- **جسم الطلب (Request Body):**
  ```json
  {
    "email": "ahmed@company.com",
    "password": "password123"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل الدخول بنجاح",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 2,
        "name": "أحمد حسن",
        "email": "ahmed@company.com",
        "role": "employee",
        "department": "الهندسة البرمجية",
        "green_points": 48,
        "red_points": 0,
        "black_points": 0,
        "early_green_credits": 13,
        "financial_balance": 18500.00,
        "insta_pay_number": "ahmed.hassan@instapay"
      }
    }
  }
  ```

---

### 2.2. هوية المستخدم الحالي (Authenticated User Identity)
- **المسار:** `GET /api/auth/me`
- **الصلاحية المطلوبة:** مستخدم مسجل (`employee` أو `owner`)
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 2,
        "name": "أحمد حسن",
        "email": "ahmed@company.com",
        "role": "employee",
        "financial_balance": 18500.00
      }
    }
  }
  ```

---

## 3. مسارات الحضور والبصمة الذكية (Attendance and GPS Endpoints)

### 3.1. تسجيل الحضور الذكي بالـ GPS (Smart Check-In)
- **المسار:** `POST /api/attendance/check-in`
- **الصلاحية المطلوبة:** موظف مسجل (`employee`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "latitude": 30.044425,
    "longitude": 31.235718,
    "branch_id": 1,
    "accuracy": 15.5,
    "simulated_time": "08:45"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل الحضور بنجاح! حضور مبكر سوبر يمنح +1 خضراء و +1 كريديت تعويضي",
    "data": {
      "attendance_log": {
        "id": 33,
        "user_id": 2,
        "point_type": "green",
        "check_in_time": "2026-10-29 08:45:10"
      },
      "user": {
        "green_points": 49,
        "early_green_credits": 14,
        "financial_balance": 18500.00
      }
    }
  }
  ```
- **استجابة الخطأ عند التواجد خارج المقر (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "عذراً! لا يمكن تسجيل الحضور وأنت خارج مقر العمل المعتمد. مسافتك الحالية هي 330م بينما الحد المسموح به هو 100م."
  }
  ```

---

### 3.2. تسجيل غياب الموظف عند إغلاق البوابة (Mark Absence)
- **المسار:** `POST /api/attendance/mark-absence`
- **الصلاحية المطلوبة:** مستخدم مسجل (`employee` أو `owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "reason": "غياب اليوم بعد الساعة 12:00 ظهراً (Black Cutoff)",
    "force": false
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل غياب اليوم واحتساب نقطة سوداء وخصم 500.00 ج.م",
    "data": {
      "user": {
        "black_points": 1,
        "financial_balance": 18000.00
      }
    }
  }
  ```

---

### 3.3. إعادة ضبط حضور اليوم للتجربة (Reset Today Attendance)
- **المسار:** `POST /api/attendance/reset-today`
- **الصلاحية المطلوبة:** متاح في بيئة المحاكاة فقط أو للمدير (`owner`)
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تمت إعادة ضبط حضور وغياب اليوم بنجاح للاختبار المباشر!"
  }
  ```

---

### 3.4. تقويم السجل الشهري المكتمل (Monthly History Breakdown)
- **المسار:** `GET /api/attendance/monthly-history`
- **الصلاحية المطلوبة:** مستخدم مسجل
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "month_name": "أكتوبر 2026",
      "first_day_offset": 5,
      "stats_summary": {
        "green_count": 24,
        "red_count": 1,
        "black_count": 0,
        "leave_count": 6
      },
      "days": [
        {
          "day": 1,
          "day_name": "الخميس",
          "status": "green",
          "check_in": "08:42 ص",
          "distance_meters": 12
        }
      ]
    }
  }
  ```

---

## 4. مسارات الإدارة والتحكم المالي للمدير (Owner Manual Overrides & RBAC)

> [!IMPORTANT]
> جميع المسارات التالية محمية بـ Middleware مشدد ولا يمكن الوصول إليها إلا بحساب المدير (`role = 'owner'`). محاولة وصول أي موظف تُرفض تلقائياً برمز `403 Forbidden`.

### 4.1. تطبيق خصم مالي يدوي (Apply Manual Deduction)
- **المسار:** `POST /api/owner/apply-deduction`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "user_id": 2,
    "amount": 250.00,
    "reason": "خصم جزاء إداري لتأخر تسليم التقرير الأسبوعي"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم تطبيق الخصم اليدوي (250.00 ج.م) بنجاح وقيده في دفتر الأستاذ",
    "data": {
      "user": {
        "id": 2,
        "financial_balance": 18250.00
      }
    }
  }
  ```

---

### 4.2. صرف مكافأة أو بونص يدوي (Grant Manual Bonus)
- **المسار:** `POST /api/owner/grant-bonus`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "user_id": 2,
    "amount": 1000.00,
    "reason": "مكافأة تميز وإنجاز في إطلاق الإصدار الجديد"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم صرف المكافأة اليدوية (1,000.00 ج.م) وإيداعها في رصيد الموظف",
    "data": {
      "user": {
        "id": 2,
        "financial_balance": 19500.00
      }
    }
  }
  ```

---

### 4.3. تعديل سياسات وقيم البونص والخصومات المركزية (Update Bonus Settings)
- **المسار:** `POST /api/owner/bonus-settings`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "monthly_bonus_amount": 3500.00,
    "late_deduction_amount": 300.00,
    "absence_deduction_amount": 600.00
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم حفظ وتحديث إعدادات وسياسات البونص والخصومات في قاعدة البيانات بنجاح!",
    "data": {
      "monthly_bonus_amount": 3500.00,
      "late_deduction_amount": 300.00,
      "absence_deduction_amount": 600.00
    }
  }
  ```

---

### 4.4. لوحة الإحصائيات التنفيذية (Owner Dashboard Stats)
- **المسار:** `GET /api/owner/dashboard-stats`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "total_employees": 6,
      "today_attendance_rate": 95.2,
      "total_payroll_liability": 98400.00,
      "employees": [
        {
          "id": 2,
          "name": "أحمد حسن",
          "department": "الهندسة البرمجية",
          "green_points": 48,
          "red_points": 0,
          "black_points": 0,
          "financial_balance": 18500.00,
          "has_checked_in_today": true
        }
      ]
    }
  }
  ```

---

## 5. مسارات الإجازات والتظلمات (Leaves and Disputes Endpoints)

### 5.1. تقديم طلب إجازة رسمي (Submit Leave Request)
- **المسار:** `POST /api/leaves/submit`
- **الصلاحية المطلوبة:** موظف مسجل (`employee`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "start_date": "2026-11-01",
    "end_date": "2026-11-03",
    "reason": "إجازة سنوية اعتيادية"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم إرسال طلب الإجازة بنجاح وهو قيد المراجعة"
  }
  ```

---

### 5.2. اعتماد أو رفض طلب إجازة (Review Leave Request)
- **المسار:** `POST /api/leaves/review`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "leave_id": 12,
    "status": "approved",
    "review_notes": "تمت الموافقة وتفعيل حصانة الغياب"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم اعتماد قرار الإجازة بنجاح"
  }
  ```

---

### 5.3. تقديم تظلم واعتراض رسمي (Submit Dispute)
- **المسار:** `POST /api/disputes`
- **الصلاحية المطلوبة:** موظف مسجل (`employee`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "penalty_type": "red_point",
    "incident_date": "2026-10-28",
    "reason": "تأخير ناتج عن انقطاع تغطية الـ GPS عند مدخل المقر"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم تقديم طلب التظلم والاعتراض بنجاح، وهو قيد المراجعة الآن من الأونر",
    "data": {
      "id": 14,
      "ticket_code": "DISP-8921-2026",
      "status": "pending"
    }
  }
  ```

---

### 5.4. البت في التظلم وتسوية الخصم (Review Dispute)
- **المسار:** `POST /api/disputes/review`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "dispute_id": 14,
    "status": "accepted",
    "admin_response": "تم فحص السجل وقبول التظلم وإلغاء النقطة الحمراء ورد الخصم المالي"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم قبول التظلم وتسوية الخصم في سجل الموظف بنجاح"
  }
  ```

---

## 6. مسارات ملف المستخدم و InstaPay (Profile and InstaPay Endpoints)

### 6.1. حفظ وتحديث كود InstaPay (Update InstaPay Handle)
- **المسار:** `POST /api/user/instapay`
- **الصلاحية المطلوبة:** مستخدم مسجل (`employee` أو `owner`)
- **جسم الطلب (Request Body):**
  ```json
  {
    "insta_pay_number": "ahmed.dev@instapay"
  }
  ```
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم حفظ وتحديث حساب InstaPay المعتمد في قاعدة البيانات بنجاح!",
    "data": {
      "insta_pay_number": "ahmed.dev@instapay"
    }
  }
  ```

---

### 6.2. استبدال نقطة حمراء مقابل 5 خضراء (Redeem Red Point)
- **المسار:** `POST /api/points/redeem-red`
- **الصلاحية المطلوبة:** موظف لديه 5 خضراء ونقطة حمراء واحدة على الأقل
- **الاستجابة الناجحة (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "تم إلغاء النقطة الحمراء واستبدال 5 نقاط خضراء بنجاح!",
    "data": {
      "user": {
        "green_points": 43,
        "red_points": 0
      }
    }
  }
  ```

---

## 7. مسارات تصدير التقارير المالية (Payroll Export Endpoints)

### 7.1. تصدير كشوف الرواتب وتحويلات InstaPay (Excel / CSV)
- **المسار:** `GET /api/reports/export-excel?period=current_month&department=all`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **الترويسة المسترجعة:** `Content-Type: text/csv; charset=UTF-8`
- **محتوى الملف:** كشف معتمد وجاهز للتحويل المباشر عبر تطبيق InstaPay للشركات يضم: كود الموظف، الاسم، القسم، عنوان InstaPay، وصافي الرصيد المستحق للصرف.

---

### 7.2. استخراج تقرير التدقيق المالي الرسمي (Certified PDF Export)
- **المسار:** `GET /api/reports/export-pdf?period=current_month`
- **الصلاحية المطلوبة:** مدير النظام (`owner`)
- **الترويسة المسترجعة:** `Content-Type: application/pdf`
- **محتوى الملف:** وثيقة رسمية بستايل Monochrome فاخر تحتوي على ملخص الالتزام الجغرافي، حركة النقاط المرورية، وسجل الاعتمادات التنفيذية.

