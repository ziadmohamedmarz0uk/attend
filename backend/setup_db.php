<?php
// Load .env configuration
$envPath = __DIR__ . '/.env';
$env = [];
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            $env[$key] = $val;
        }
    }
}

try {
    $host = $env['DB_HOST'] ?? (getenv('DB_HOST') ?: (getenv('MYSQL_HOST') ?: '127.0.0.1'));
    $port = $env['DB_PORT'] ?? (getenv('DB_PORT') ?: (getenv('MYSQL_PORT') ?: 3306));
    $dbName = $env['DB_DATABASE'] ?? (getenv('DB_DATABASE') ?: (getenv('MYSQL_DATABASE') ?: 'smart_attendance_db'));
    $user = $env['DB_USERNAME'] ?? (getenv('DB_USERNAME') ?: (getenv('MYSQL_USER') ?: 'root'));
    $pass = $env['DB_PASSWORD'] ?? (getenv('DB_PASSWORD') ?: (getenv('MYSQL_PASSWORD') ?: ''));

    $pdoOptions = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ];
    if (!in_array($host, ['127.0.0.1', 'localhost']) || (int)$port === 4000 || getenv('DB_SSL') === 'true') {
        if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
            $pdoOptions[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }
    }

    $pdo = new PDO("mysql:host={$host};port={$port}", $user, $pass, $pdoOptions);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    
    $pdoDb = new PDO("mysql:host={$host};port={$port};dbname={$dbName}", $user, $pass, $pdoOptions);
    $pdoDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Drop old tables to ensure fresh clean rich schema
    $pdoDb->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdoDb->exec("DROP TABLE IF EXISTS `points_ledgers`;");
    $pdoDb->exec("DROP TABLE IF EXISTS `audit_logs`;");
    $pdoDb->exec("DROP TABLE IF EXISTS `leave_requests`;");
    $pdoDb->exec("DROP TABLE IF EXISTS `attendance_logs`;");
    $pdoDb->exec("DROP TABLE IF EXISTS `branches`;");
    $pdoDb->exec("DROP TABLE IF EXISTS `users`;");
    $pdoDb->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 0. Create `branches` table
    $pdoDb->exec("CREATE TABLE `branches` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `latitude` DECIMAL(10, 8) NOT NULL,
        `longitude` DECIMAL(11, 8) NOT NULL,
        `radius_meters` INT NOT NULL DEFAULT 100,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Seed default branches
    $pdoDb->exec("INSERT INTO `branches` (`name`, `latitude`, `longitude`, `radius_meters`, `is_active`) VALUES 
        ('المقر الرئيسي - المعادي (HQ)', 30.044425, 31.235718, 200, 1),
        ('فرع الدقي والمهندسين', 30.038450, 31.211320, 150, 1)");

    // 1. Create `users` table
    $pdoDb->exec("CREATE TABLE `users` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) NOT NULL DEFAULT 'employee',
        `department` VARCHAR(255) NULL,
        `green_points` INT UNSIGNED NOT NULL DEFAULT 0,
        `red_points` INT UNSIGNED NOT NULL DEFAULT 0,
        `black_points` INT UNSIGNED NOT NULL DEFAULT 0,
        `early_green_credits` INT UNSIGNED NOT NULL DEFAULT 0,
        `consecutive_early_days` INT UNSIGNED NOT NULL DEFAULT 0,
        `financial_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        `insta_pay_number` VARCHAR(255) NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. Create `attendance_logs` table
    $pdoDb->exec("CREATE TABLE `attendance_logs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `check_in_time` DATETIME NOT NULL,
        `latitude` DECIMAL(10, 8) NULL,
        `longitude` DECIMAL(11, 8) NULL,
        `point_type` VARCHAR(50) NOT NULL DEFAULT 'green',
        `is_excused` TINYINT(1) NOT NULL DEFAULT 0,
        `notes` TEXT NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 3. Create `leave_requests` table
    $pdoDb->exec("CREATE TABLE `leave_requests` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `start_date` DATE NOT NULL,
        `end_date` DATE NOT NULL,
        `reason` TEXT NOT NULL,
        `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 4. Create `audit_logs` table
    $pdoDb->exec("CREATE TABLE `audit_logs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `action` VARCHAR(255) NOT NULL,
        `details` TEXT NOT NULL,
        `performed_by` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 5. Create `points_ledgers` table
    $pdoDb->exec("CREATE TABLE `points_ledgers` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `transaction_type` VARCHAR(100) NOT NULL,
        `amount_deducted_or_rewarded` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        `description` TEXT NOT NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    echo "✅ MySQL Tables created cleanly.\n";

    // Insert Realistic Employees & Owner Data (Default password: 123456)
    $passHash = password_hash('123456', PASSWORD_BCRYPT);

    $usersData = [
        [
            'name' => 'Eng. Ziad Mohamed (Owner)',
            'email' => 'owner@company.com',
            'role' => 'owner',
            'department' => 'Executive Management',
            'green_points' => 45,
            'red_points' => 0,
            'black_points' => 0,
            'early_green_credits' => 10,
            'consecutive_early_days' => 5,
            'financial_balance' => 0.00,
            'insta_pay_number' => 'ziad@instapay',
        ],
        [
            'name' => 'Eng. Ahmed Hassan',
            'email' => 'ahmed@company.com',
            'role' => 'employee',
            'department' => 'Software Engineering',
            'green_points' => 24,
            'red_points' => 1,
            'black_points' => 0,
            'early_green_credits' => 3,
            'consecutive_early_days' => 4,
            'financial_balance' => 2500.00,
            'insta_pay_number' => 'ahmed.hassan@instapay',
        ],
        [
            'name' => 'Sarah Mahmoud',
            'email' => 'sarah@company.com',
            'role' => 'employee',
            'department' => 'Product Design',
            'green_points' => 30,
            'red_points' => 0,
            'black_points' => 0,
            'early_green_credits' => 5,
            'consecutive_early_days' => 5,
            'financial_balance' => 5000.00,
            'insta_pay_number' => 'sarah.m@instapay',
        ],
        [
            'name' => 'Tarek Omar',
            'email' => 'tarek@company.com',
            'role' => 'employee',
            'department' => 'Marketing & Growth',
            'green_points' => 15,
            'red_points' => 2,
            'black_points' => 1,
            'early_green_credits' => 1,
            'consecutive_early_days' => 2,
            'financial_balance' => 0.00,
            'insta_pay_number' => 'tarek.o@instapay',
        ],
        [
            'name' => 'Nour El-Din Mostafa',
            'email' => 'nour@company.com',
            'role' => 'employee',
            'department' => 'DevOps & Cloud Infrastructure',
            'green_points' => 28,
            'red_points' => 0,
            'black_points' => 0,
            'early_green_credits' => 4,
            'consecutive_early_days' => 5,
            'financial_balance' => 2500.00,
            'insta_pay_number' => 'nour.mostafa@instapay',
        ],
        [
            'name' => 'Mariam Ali',
            'email' => 'mariam@company.com',
            'role' => 'employee',
            'department' => 'Human Resources',
            'green_points' => 20,
            'red_points' => 1,
            'black_points' => 0,
            'early_green_credits' => 2,
            'consecutive_early_days' => 3,
            'financial_balance' => 1250.00,
            'insta_pay_number' => 'mariam.ali@instapay',
        ],
        [
            'name' => 'Khaled Abdelrahman',
            'email' => 'khaled@company.com',
            'role' => 'employee',
            'department' => 'Quality Assurance',
            'green_points' => 18,
            'red_points' => 0,
            'black_points' => 1,
            'early_green_credits' => 1,
            'consecutive_early_days' => 2,
            'financial_balance' => 0.00,
            'insta_pay_number' => 'khaled.a@instapay',
        ],
    ];

    $stmtUser = $pdoDb->prepare("INSERT INTO users (name, email, password, role, department, green_points, red_points, black_points, early_green_credits, consecutive_early_days, financial_balance, insta_pay_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $userIds = [];
    foreach ($usersData as $u) {
        $stmtUser->execute([
            $u['name'],
            $u['email'],
            $passHash,
            $u['role'],
            $u['department'],
            $u['green_points'],
            $u['red_points'],
            $u['black_points'],
            $u['early_green_credits'],
            $u['consecutive_early_days'],
            $u['financial_balance'],
            $u['insta_pay_number'],
        ]);
        $userIds[$u['email']] = $pdoDb->lastInsertId();
    }
    echo "✅ Seeded 7 Realistic Production Users (Owner + 6 Employees).\n";

    // Insert Attendance Logs
    $today = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    $dayBefore = date('Y-m-d', strtotime('-2 days'));

    $stmtAttendance = $pdoDb->prepare("INSERT INTO attendance_logs (user_id, check_in_time, latitude, longitude, point_type, is_excused, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");

    $logsData = [
        [$userIds['ahmed@company.com'], "{$today} 07:48:12", 30.044430, 31.235715, 'green', 0, 'حضور مبكر - نطاق مقر الشركة الرئيسي'],
        [$userIds['sarah@company.com'], "{$today} 07:55:00", 30.044425, 31.235718, 'green', 0, 'حضور مبكر ممتاز - نطاق المكتب'],
        [$userIds['nour@company.com'], "{$today} 07:58:30", 30.044435, 31.235710, 'green', 0, 'حضور مبكر - نطاق السيرفرات'],
        [$userIds['tarek@company.com'], "{$today} 09:22:15", 30.044410, 31.235720, 'red', 0, 'تأخير 22 دقيقة عن موعد الحضور الرسمي'],
        [$userIds['mariam@company.com'], "{$today} 08:10:00", 30.044428, 31.235714, 'green', 0, 'حضور مستقر في الموعد'],
        [$userIds['ahmed@company.com'], "{$yesterday} 07:42:00", 30.044430, 31.235715, 'green', 0, 'حضور مبكر اليوم السابق'],
        [$userIds['sarah@company.com'], "{$yesterday} 07:50:00", 30.044425, 31.235718, 'green', 0, 'حضور مبكر اليوم السابق'],
        [$userIds['khaled@company.com'], "{$yesterday} 08:05:00", 30.044412, 31.235719, 'green', 0, 'حضور في موعد العمل'],
        [$userIds['ahmed@company.com'], "{$dayBefore} 07:51:10", 30.044430, 31.235715, 'green', 0, 'حضور مبكر في نطاق الشركة'],
    ];

    foreach ($logsData as $log) {
        $stmtAttendance->execute($log);
    }
    echo "✅ Seeded 9 Real Attendance Logs with GPS Coordinates.\n";

    // Insert Leave Requests
    $stmtLeave = $pdoDb->prepare("INSERT INTO leave_requests (user_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)");

    $leavesData = [
        [$userIds['ahmed@company.com'], date('Y-m-d', strtotime('+2 days')), date('Y-m-d', strtotime('+4 days')), 'إجازة سنوية شخصية وفحوصات طبية دورية', 'pending'],
        [$userIds['tarek@company.com'], date('Y-m-d', strtotime('+1 day')), date('Y-m-d', strtotime('+2 days')), 'إجازة عارضة طارئة لظروف عائلية وخاصة', 'pending'],
        [$userIds['mariam@company.com'], date('Y-m-d', strtotime('+5 days')), date('Y-m-d', strtotime('+7 days')), 'حضور مؤتمر إدارة الموارد البشرية وتطوير الكفاءات', 'pending'],
        [$userIds['sarah@company.com'], date('Y-m-d', strtotime('-10 days')), date('Y-m-d', strtotime('-8 days')), 'إجازة اعتيادية سنوية معتمدة', 'approved'],
        [$userIds['khaled@company.com'], date('Y-m-d', strtotime('-5 days')), date('Y-m-d', strtotime('-4 days')), 'طلب إجازة مرضية طارئة', 'approved'],
    ];

    foreach ($leavesData as $leave) {
        $stmtLeave->execute($leave);
    }
    echo "✅ Seeded 5 Leave Requests (Pending & Approved).\n";

    // Insert Audit Logs
    $stmtAudit = $pdoDb->prepare("INSERT INTO audit_logs (action, details, performed_by) VALUES (?, ?, ?)");

    $auditsData = [
        ['MANUAL_OVERRIDE', 'صرف بونص الالتزام والانضباط الشهري عبر InstaPay بمبلغ 2500 ج.م للموظف Eng. Ahmed Hassan', 'Eng. Ziad Mohamed (Owner)'],
        ['LEAVE_APPROVED', 'الموافقة على طلب إجازة الموظفة Sarah Mahmoud وتفعيل الحصانة التلقائية ضد الخصومات', 'Eng. Ziad Mohamed (Owner)'],
        ['BONUS_DISBURSED', 'إيداع مكافأة التميز والانضباط المالي بقيمة 5000 ج.م لحساب InstaPay المعتمد', 'Eng. Ziad Mohamed (Owner)'],
        ['MANUAL_OVERRIDE', 'مسح النقاط السوداء استثناءً تقديراً للجهود الاستثنائية في إطلاق التحديث', 'Eng. Ziad Mohamed (Owner)'],
        ['DATABASE_SEEDED', 'تهيأة قاعدة البيانات بالبيانات الإنتاجية الحقيقية والمستحقات المعتمدة', 'System Auto Setup'],
    ];

    foreach ($auditsData as $audit) {
        $stmtAudit->execute($audit);
    }
    echo "✅ Seeded Executive Audit Logs.\n";

    // Insert Points Ledgers
    $stmtLedger = $pdoDb->prepare("INSERT INTO points_ledgers (user_id, transaction_type, amount_deducted_or_rewarded, description) VALUES (?, ?, ?, ?)");

    $ledgersData = [
        [$userIds['ahmed@company.com'], 'BONUS_CLAIM', 2500.00, 'Monthly Commitment Bonus 2500 EGP Disbursed via InstaPay'],
        [$userIds['sarah@company.com'], 'BONUS_CLAIM', 2500.00, 'Monthly Commitment Bonus 2500 EGP Disbursed via InstaPay'],
        [$userIds['sarah@company.com'], 'EXCELLENCE_BONUS', 2500.00, 'Excellence Award for 30 Consecutive Green Points'],
        [$userIds['nour@company.com'], 'BONUS_CLAIM', 2500.00, 'Monthly Commitment Bonus 2500 EGP Disbursed via InstaPay'],
        [$userIds['mariam@company.com'], 'PARTIAL_BONUS', 1250.00, 'Mid-Month Attendance Commitment Award'],
    ];

    foreach ($ledgersData as $ledger) {
        $stmtLedger->execute($ledger);
    }
    echo "✅ Seeded Points Ledger Transactions.\n";

    echo "\n=========================================================\n";
    echo "🎉 MySQL Database `smart_attendance_db` is fully populated with production data!\n";
    echo "=========================================================\n";

} catch (PDOException $e) {
    echo "❌ MySQL Error: " . $e->getMessage() . "\n";
}
