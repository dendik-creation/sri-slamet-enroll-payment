<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstalmentPayment extends Model
{
    use SoftDeletes;
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];
    const SALARY_SOURCE = 'salary';
    const DIRECT_SOURCE = 'direct';

    public function instalment()
    {
        return $this->belongsTo(Instalment::class)->withTrashed();
    }

    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }
}
