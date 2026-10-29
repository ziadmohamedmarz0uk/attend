<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Modules\Auth\Models\User;
use App\Modules\Attendance\Models\AttendanceLog;
use App\Modules\Leaves\Models\LeaveRequest;
use App\Modules\Points\Models\PointsLedger;
use App\Modules\OwnerControl\Models\AuditLog;
use DateTime;

/**
 * Class DatabaseSeeder
 * 
 * Populates database with default Owner account, sample Employees,
 * attendance logs, leave requests, and points ledger entries for smooth testing.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('=================================================');
        $this->command->info('🌱 Seeding Smart Attendance System Database...');
        $this->command->info('=================================================');

        // 1. Create Default Owner Account
        $owner = User::firstOrCreate(
            ['email' => 'owner@company.com'],
            [
                'name' => 'Eng. Ziad Mohamed (Owner)',
                'password' => Hash::make('password123'),
                'role' => 'owner',
                'department' => 'Executive Management',
                'green_points' => 45,
                'red_points' => 0,
                'black_points' => 0,
                'early_green_credits' => 10,
                'consecutive_early_days' => 5,
                'financial_balance' => 0.00,
                'insta_pay_number' => 'ziad@instapay',
            ]
        );
        $this->command->info("✅ Owner Account Created: owner@company.com (Pass: password123)");

        // 2. Create Sample Employee 1: Ahmed Hassan (Has 1 Red & 1 Black point for testing redemptions)
        $emp1 = User::firstOrCreate(
            ['email' => 'ahmed@company.com'],
            [
                'name' => 'Ahmed Hassan (Senior Engineer)',
                'password' => Hash::make('password123'),
                'role' => 'employee',
                'department' => 'Software Engineering',
                'green_points' => 18,
                'red_points' => 1,
                'black_points' => 1,
                'early_green_credits' => 2,
                'consecutive_early_days' => 4,
                'financial_balance' => -250.00,
                'insta_pay_number' => '',
            ]
        );

        // 3. Create Sample Employee 2: Sarah Mahmoud (Clean 0 Red & 0 Black - Eligible for InstaPay Bonus)
        $emp2 = User::firstOrCreate(
            ['email' => 'sarah@company.com'],
            [
                'name' => 'Sarah Mahmoud (UI/UX Lead)',
                'password' => Hash::make('password123'),
                'role' => 'employee',
                'department' => 'Product Design',
                'green_points' => 22,
                'red_points' => 0,
                'black_points' => 0,
                'early_green_credits' => 3,
                'consecutive_early_days' => 5,
                'financial_balance' => 0.00,
                'insta_pay_number' => 'sarah.m@instapay',
            ]
        );

        // 4. Create Sample Employee 3: Tarek Omar (Has penalties)
        $emp3 = User::firstOrCreate(
            ['email' => 'tarek@company.com'],
            [
                'name' => 'Tarek Omar (Growth Marketing)',
                'password' => Hash::make('password123'),
                'role' => 'employee',
                'department' => 'Marketing',
                'green_points' => 12,
                'red_points' => 2,
                'black_points' => 2,
                'early_green_credits' => 0,
                'consecutive_early_days' => 1,
                'financial_balance' => -500.00,
                'insta_pay_number' => '',
            ]
        );

        $this->command->info("✅ Sample Employees Created: ahmed@company.com, sarah@company.com, tarek@company.com");

        // 5. Create Sample Attendance Logs
        $yesterday = (new DateTime('-1 day'))->format('Y-m-d');
        AttendanceLog::firstOrCreate(
            ['user_id' => $emp1->id, 'check_in_time' => "{$yesterday} 07:45:00"],
            [
                'latitude' => 30.044430,
                'longitude' => 31.235715,
                'point_type' => 'green',
                'is_excused' => false,
            ]
        );

        AttendanceLog::firstOrCreate(
            ['user_id' => $emp2->id, 'check_in_time' => "{$yesterday} 09:12:00"],
            [
                'latitude' => 30.044425,
                'longitude' => 31.235718,
                'point_type' => 'green',
                'is_excused' => false,
            ]
        );

        // 6. Create Sample Leave Request
        $tomorrow = (new DateTime('+1 day'))->format('Y-m-d');
        $afterTomorrow = (new DateTime('+3 days'))->format('Y-m-d');

        LeaveRequest::firstOrCreate(
            ['user_id' => $emp1->id, 'start_date' => $tomorrow],
            [
                'end_date' => $afterTomorrow,
                'reason' => 'Medical checkup and annual personal leave',
                'status' => 'pending',
            ]
        );

        // 7. Record Seeding Audit Log
        AuditLog::create([
            'action' => 'DATABASE_SEEDED',
            'details' => 'Database initialized with default Owner account, sample employees, attendance logs, and leave requests.',
            'performed_by' => 'Database Seeder',
        ]);

        $this->command->info('=================================================');
        $this->command->info('🎉 Database Seeding Completed Successfully!');
        $this->command->info('=================================================');
    }
}
