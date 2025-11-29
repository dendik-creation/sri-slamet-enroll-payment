<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];
}
