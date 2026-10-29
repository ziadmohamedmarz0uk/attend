# نظرة عامة على المعمارية وهيكلية النظام
## System Architecture Overview, Engineering Design and State Synchronization

---

## 1. الفلسفة المعمارية للنظام (Architectural Vision)

نظام **Attend** هو منصة B2B SaaS متقدمة لإدارة الحضور الميداني بالـ GPS والتحكم بالرواتب والحوافز المالية اللحظية. تم تصميم النظام وفق مبادئ المعمارية الحديثة:
- **الفصل التام للمهام (Clean Decoupled Architecture):** فصل طبقة العرض والواجهات (Next.js 14) عن طبقة المنطق والأعمال وقواعد البيانات (PHP/MySQL) عبر واجهات برمجة تطبيقات آمنة (RESTful APIs).
- **التصميم الأحادي الفاخر (Strict Monochrome Design System):** الاعتماد على فلسفة بصرية مستوحاة من Shadcn UI و Vercel، مقتصرة على درجات الأسود والأبيض والرمادي مع مؤشرات لونية دقيقة ومدروسة للمرور، مع الدعم الأصيل للغة العربية باتجاه القراءة من اليمين إلى اليسار (RTL) وخلو تام من الرموز التعبيرية (Zero Emojis).
- **المصدر الأوحد للحقيقة (Single Source of Truth):** خادم الـ Backend وقاعدة بيانات MySQL هما المرجع الحصري للتوقيت، الأرصدة، واحتساب المسافات الجغرافية.
- **التزامن اللحظي عبر النوافذ (Cross-Tab Synchronization):** ربط تبويبات المتصفح المختلفة للعميل عبر بروتوكول `BroadcastChannel` لتحديث الواجهات فور حدوث أي قرار إداري أو بصمة جديدة دون الحاجة لإعادة تحميل الصفحة.

---

## 2. المخطط المعماري الشامل (High-Level Architecture)

```mermaid
graph TD
    subgraph Frontend_NextJS ["الواجهة الأمامية: Next.js 14 App Router"]
        UI_Employee["بوابة الموظف /dashboard/employee"]
        UI_Owner["لوحة المدير /dashboard/owner"]
        SyncEvents["محرك التزامن اللحظي (syncEvents.js - BroadcastChannel)"]
        AxiosClient["عميل الشبكة المؤمن (Axios Interceptors / Bearer Token)"]
    end

    subgraph Backend_PHP ["الخادم الخلفي: Modular PHP Engine"]
        Router["موجه الطلبات المركزي (server.php)"]
        AuthMiddleware["طبقة التحقق الأمني وفك تشفير الـ JWT"]
        RBAC_Guard["حارس الصلاحيات الصارم (Require Role: Owner / Employee)"]
        GeofenceEngine["محرك الـ GPS والتحقق بمعادلة Haversine"]
        PointsEngine["محرك النقاط والدرع التعويضي (Points Engine)"]
        AuditService["خدمة سجل التدقيق الرقابي (Audit Logger)"]
    end

    subgraph Database_MySQL ["قاعدة البيانات: MySQL 8.0 (InnoDB)"]
        DB_Users[("users: الهويات والأرصدة والنقاط")]
        DB_Logs[("attendance_logs: سجلات البصمة")]
        DB_Ledgers[("points_ledgers: دفتر الأستاذ المحاسبي")]
        DB_Settings[("system_settings: سياسات البونص والخصم")]
        DB_Disputes[("dispute_tickets & leave_requests")]
        DB_Audit[("audit_logs: الرقابة الإدارية")]
    end

    UI_Employee --> AxiosClient
    UI_Owner --> AxiosClient
    UI_Owner -.->|بث حدث فوري| SyncEvents
    SyncEvents -.->|تحديث الواجهات لحظياً| UI_Employee

    AxiosClient -->|HTTPS REST API / Bearer Token| Router
    Router --> AuthMiddleware
    AuthMiddleware --> RBAC_Guard
    RBAC_Guard --> GeofenceEngine
    RBAC_Guard --> PointsEngine
    RBAC_Guard --> AuditService

    GeofenceEngine --> DB_Logs
    PointsEngine --> DB_Users
    PointsEngine --> DB_Ledgers
    PointsEngine --> DB_Settings
    AuditService --> DB_Audit
    RBAC_Guard --> DB_Disputes
```

---

## 3. الركائز الهندسية الأساسية (Core Engineering Pillars)

### 3.1. التوقيت الإجباري للخادم (Server-Time Authority)
- لا يعتمد النظام إطلاقاً على توقيت جهاز الموظف؛ يتم سحب التوقيت مباشرة من ساعة السيرفر المزامنة مع UTC/NTP.
- يتم تقسيم ساعات اليوم إلى 5 نوافذ زمنية ثابتة:
  1. **قبل الساعة 07:00 ص:** البوابة مغلقة تلقائياً.
  2. **نافذة الحضور المبكر (07:00 ص - 08:59 ص):** احتساب +1 نقطة خضراء مع منح +1 كريديت تعويضي في `users.early_green_credits`.
  3. **فترة السماح الرسمية (09:00 ص - 09:15 ص):** احتساب +1 نقطة خضراء دون أي خصومات.
  4. **فترة التأخير (09:16 ص - 11:59 ص):** فحص رصيد الكريديت التعويضي؛ إذا كان $\ge 1$ يُستهلك كريديت واحد لحماية الراتب وتلغى النقطة الحمراء، وإذا كان $0$ تُقيد نقطة حمراء ويُخصم مبلغ التأخير المعتمد من `financial_balance`.
  5. **إغلاق البوابة اليومي (12:00 م Cutoff):** إغلاق تلقائي لا يقبل البصمات، وتقييد غياب ونقطة سوداء وخصم يوم كامل.

---

### 3.2. حوكمة الصلاحيات التنفيذية (Executive RBAC)
- **صلاحيات حصرية للمدير (Owner Monopoly):**
  - المدير هو المسؤول الوحيد عن تحديد المبالغ وتطبيق الخصومات اليدوية (`apply-deduction`).
  - صرف مكافآت الانضباط والبونص اليدوي (`grant-bonus`).
  - تعديل مبالغ السياسات المركزية في `system_settings` (`bonus-settings`).
  - مراجعة واعتماد أو رفض طلبات الإجازات والتظلمات.
  - تصدير كشوف الرواتب والتحويلات البنكية لملفات Excel و PDF.
- **حظر وتأمين حسابات الموظفين:**
  - لا يملك الموظف أي صلاحية لتعديل رصيده أو صرف مبالغ لنفسه بصورة ذاتية.
  - جميع عمليات الموظف محصورة في: تسجيل الحضور بالـ GPS، تقديم طلبات الإجازة، تقديم تظلم، استبدال 5 نقاط خضراء بنقطة حمراء، وتحديث كود InstaPay المعتمد للسحب.

---

### 3.3. محرك النقاط والدرع التعويضي (Points & Compensation Ledger Engine)
يعمل المحرك بنظام دفتر أستاذ محاسبي دقيق (Double-Entry Audit Ledger):
- **النقاط الخضراء (Green Points):** تزداد بمقدار +1 مع كل حضور منضبط أو مبكر.
- **درع الحماية التعويضي (Early Green Credits):** رصيد مكتسب من الحضور المبكر (قبل 09:00 ص) يمتص تلقائياً خصم أول تأخير للموظف ويحمي راتبه.
- **النقاط الحمراء (Red Points):** تُسجل عند التأخير دون رصيد حماية، وتؤدي لخصم قيمة التأخير فورياً من الرصيد المالي. يمكن للموظف استبدال 5 نقاط خضراء لمحو نقطة حمراء واحدة.
- **النقاط السوداء (Black Points):** تُسجل عند الغياب التام وإغلاق البوابة، وتخصم يوم عمل كامل. يتيح النظام محو نقطة سوداء تلقائياً عند تحقيق سلسلة انضباط مبكر لمدة 5 أيام متتالية (`consecutive_early_days = 5`).

---

## 4. مخططات التسلسل التفاعلية (Sequence Diagrams)

### 4.1. دورة تسجيل الحضور بالـ GPS والتحقق الجغرافي (GPS Check-In Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Employee as الموظف (المتصفح)
    participant Frontend as واجهة Next.js
    participant Server as خادم الـ PHP
    participant DB as قاعدة بيانات MySQL

    Employee->>Frontend: الضغط على "تسجيل الحضور الآن"
    Frontend->>Frontend: قراءة إحداثيات الـ GPS ودقة الإشارة
    Frontend->>Server: POST /api/attendance/check-in (lat, lng, accuracy, branch_id)
    Server->>Server: التحقق من التوكن (JWT Authentication)
    Server->>Server: فحص دقة الـ GPS (Accuracy <= 50m)
    Server->>DB: استعلام إحداثيات الفرع المختار (branches)
    DB-->>Server: خط العرض، خط الطول، نصف القطر
    Server->>Server: تطبيق معادلة Haversine لحساب المسافة الفاصلة
    alt المسافة > نصف قطر الفرع
        Server-->>Frontend: 400 Bad Request (خارج النطاق الجغرافي المعتمد)
        Frontend-->>Employee: تنبيه مرئي بالمسافة المطلوبة للاقتراب
    else المسافة داخل النطاق
        Server->>Server: استخراج توقيت السيرفر وتحديد الشريحة (Green / Red)
        Server->>DB: INSERT INTO attendance_logs
        Server->>DB: UPDATE users (الأرصدة والنقاط)
        Server->>DB: INSERT INTO points_ledgers (قيد محاسبي)
        DB-->>Server: تأكيد نجاح العمليات
        Server-->>Frontend: 200 OK (تم تسجيل الحضور وتحديث العدادات)
        Frontend-->>Employee: عرض تفاعل العداد الأخضر/الدرع فورياً
    end
```

---

### 4.2. دورة التعديل المالي للمدير وتزامن النوافذ اللحظي (Owner Manual Override & Sync)

```mermaid
sequenceDiagram
    autonumber
    actor Owner as المدير التنفيذي
    participant OwnerUI as لوحة المدير
    participant SyncBus as ناقل التزامن اللحظي (BroadcastChannel)
    participant Server as خادم الـ PHP
    participant DB as قاعدة بيانات MySQL
    participant EmpUI as بوابة الموظف (نافذة أخرى)

    Owner->>OwnerUI: تطبيق خصم مالي أو صرف مكافأة لموظف
    OwnerUI->>Server: POST /api/owner/apply-deduction (user_id, amount, reason)
    Server->>Server: التحقق من رتبة المدير (Role = 'owner')
    Server->>DB: خصم المبلغ من users.financial_balance
    Server->>DB: إدراج القيد في points_ledgers
    Server->>DB: تسجيل العملية في audit_logs
    DB-->>Server: تأكيد نجاح المعاملة
    Server-->>OwnerUI: 200 OK (تم تطبيق الخصم وقيده)
    OwnerUI->>SyncBus: بث حدث MANUAL_OVERRIDE
    SyncBus->>EmpUI: استقبال الحدث بالخلفية
    EmpUI->>Server: استعلام صامت GET /api/points/ledger-summary
    Server-->>EmpUI: البيانات المحدثة
    EmpUI->>EmpUI: تحديث العداد المالي ورصيد InstaPay فورياً
```

---

## 5. استراتيجية إدارة الأخطاء والمرونة (Error Handling & Fallbacks)

- **الحماية من السقوط (Zero White Screen Policy):** في حال وجود انقطاع مؤقت في الاتصال، تقوم الواجهة الأمامية بالاعتماد على البيانات المخبأة محلياً في `localStorage` لعرض الصفحة بسلاسة مع إظهار شارة تنبيهية لحالة الاتصال.
- **منع النقرات المزدوجة (Anti-Double-Click Lock):** جميع أزرار الإجراءات في الواجهة الأمامية تُقفل فور النقر عليها وتُظهر مؤشر تحميل دوار (`Loader2`) لمنع إرسال طلبات مكررة لنفس العملية.
- **ضمانات قاعدة البيانات (Database Constraints):** استخدام قيود `UNIQUE` على البريد الإلكتروني والـ Primary Keys وفهارس البحث المركبة لمنع تكرار القيود أو تضارب البيانات المالية.

