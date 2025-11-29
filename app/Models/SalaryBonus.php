<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryBonus extends Model
{
    protected $fillable = [
        'salary_id',
        'bonus_type',
        'amount'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }
}
