<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Position extends Model
{
    use SoftDeletes;
    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];
    protected $casts = [
        'id' => 'integer',
    ];

    public function employees(){
        return $this->hasMany(Employee::class, 'position_id')->withTrashed();
    }
}
