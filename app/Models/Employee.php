<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    const EMPLOYEE_DAILY = 'daily';
    const EMPLOYEE_MONTHLY = 'monthly';
    protected $guarded = ['id'];
    protected $casts = [
        'join_date' => 'datetime',
        'id' => 'integer',
        'position_id' => 'integer',
        'nip' => 'string',
        'salary_per_day' => 'integer',
        'salary_per_month' => 'integer',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function today_attendance()
    {
        return $this->hasOne(Attendance::class)
            ->whereDate('period_start', '<=', now())
            ->whereDate('period_end', '>=', now());
    }
}
