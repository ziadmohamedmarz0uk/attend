<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console & Scheduled Commands - Smart Attendance System
|--------------------------------------------------------------------------
|
| Here is where scheduled Artisan commands are registered.
| The daily 12:00 PM cutoff job processes absences and assigns Black points
| automatically to unexcused employees.
|
*/

// Schedule 12:00 PM Daily Hard Cutoff Absence Processor
Schedule::command('attendance:process-cutoff')
    ->dailyAt('12:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->appendOutputTo(storage_path('logs/cutoff_cron.log'));

// Manual test Artisan command
Artisan::command('attendance:test-cutoff', function () {
    $this->call('attendance:process-cutoff');
})->purpose('Manually triggers the 12:00 PM cutoff absence processor for testing.');
