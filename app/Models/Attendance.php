<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $guarded= ['id'];
    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'work_days' => 'float',
        'overtime' => 'float',
        'employee_id' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }
}
