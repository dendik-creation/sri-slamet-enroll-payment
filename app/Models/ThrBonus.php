<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThrBonus extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'total_amount' => 'integer',
    ];
    
    public function employee_thrs(){
        return $this->hasMany(EmployeeThrBonus::class, 'thr_bonus_id');
    }
}
