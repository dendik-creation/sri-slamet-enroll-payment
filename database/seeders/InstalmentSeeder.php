<?php

namespace Database\Seeders;

use App\Models\Instalment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InstalmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Instalment::create([
            'employee_id' => 1,
            'total_amount' => 1000000,
            'instalment_value' => 100000,
            'remaining_amount' => 1000000,
            'taken_at' => now()->format('Y-m-d'),
        ]);
    }
}
