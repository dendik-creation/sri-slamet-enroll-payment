<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeThrBonus extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'thr_bonus_id' => 'integer',
        'employee_id' => 'integer',
        'amount' => 'integer',
    ];

    public function thr_bonus(){
        return $this->belongsTo(ThrBonus::class, 'thr_bonus_id');
    }

    public function employee(){
        return $this->belongsTo(Employee::class, 'employee_id')->withTrashed();
    }
}
