<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Position::create([
            'name' => 'Konstruksi'
        ]);
        Position::create([
            'name' => 'Otomotif'
        ]);
        Position::create([
            'name' => 'Bosh Pump'
        ]);
        Position::create([
            'name' => 'Staff'
        ]);
        Position::create([
            'name' => 'Ahli Konstruksi'
        ]);
        Position::create([
            'name' => 'Support Kuliah'
        ]);
        Position::create([
            'name' => 'Driver'
        ]);
        Position::create([
            'name' => 'Bengkel Prambatan'
        ]);
    }
}
