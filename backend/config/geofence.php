<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Headquarters Geofence Coordinates
    |--------------------------------------------------------------------------
    |
    | Central latitude and longitude for the company HQ, maximum allowed
    | geofence radius limit in meters, and maximum allowed GPS inaccuracy limit.
    |
    */

    'company_lat' => (float) env('COMPANY_LATITUDE', 30.044420),
    'company_lng' => (float) env('COMPANY_LONGITUDE', 31.235712),
    'allowed_radius_meters' => (float) env('GEOFENCE_RADIUS_METERS', 100.0),
    'max_gps_accuracy_meters' => (float) env('MAX_ALLOWED_GPS_ACCURACY_METERS', 30.0),

    /*
    |--------------------------------------------------------------------------
    | Traffic Light Attendance Time Windows (24-Hour Server Time HH:mm)
    |--------------------------------------------------------------------------
    */

    'time_windows' => [
        'early_start' => env('EARLY_WINDOW_START', '07:00'),
        'early_end' => env('EARLY_WINDOW_END', '09:00'),
        'early_black_redemption_end' => env('EARLY_BLACK_REDEMPTION_WINDOW_END', '08:00'),
        
        'normal_start' => env('NORMAL_WINDOW_START', '09:00'),
        'normal_end' => env('NORMAL_WINDOW_END', '10:00'),
        
        'late_start' => env('LATE_WINDOW_START', '10:00'),
        'cutoff_time' => env('CHECKIN_CUTOFF_TIME', '12:00'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Financial Penalties and Rewards Constants (EGP)
    |--------------------------------------------------------------------------
    */

    'red_penalty_egp' => (float) env('RED_POINT_PENALTY_EGP', 250.0),
    'monthly_bonus_egp' => (float) env('MONTHLY_BONUS_EGP', 2500.0),

    /*
    |--------------------------------------------------------------------------
    | Black Point Redemption Streak Requirement
    |--------------------------------------------------------------------------
    */

    'black_redemption_days' => (int) env('BLACK_POINT_REDEMPTION_DAYS', 5),

];
