<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Instalment extends Model
{
    use SoftDeletes;
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    public function payments()
    {
        return $this->hasMany(InstalmentPayment::class)->withTrashed();
    }
}
