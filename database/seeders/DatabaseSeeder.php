<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
        ]);
        
        $setting = Setting::first();
        
        if ($setting && !$setting->seeded) {
            $this->call([
                UserSeeder::class,
                PositionSeeder::class,
                EmployeeSeeder::class,
                AttendanceSeeder::class,
                DeductionSeeder::class,
                InstalmentSeeder::class,
            ]);
            
            $setting->seeded = true;
            $setting->save();
        }
    }
}
