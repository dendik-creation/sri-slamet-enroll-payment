<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Setting::count() > 0) {
            return;
        }
        
        Setting::create([
            'normal_work_hours' => 7,
            'attendance_start' => '09:00',
            'attendance_end' => '16:00',
            'seeded' => false, 
        ]);
    }
}
