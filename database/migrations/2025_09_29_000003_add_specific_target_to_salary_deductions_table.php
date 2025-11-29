<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // MySQL: add JSON column then alter enum to include 'specific'
            Schema::table('salary_deductions', function (Blueprint $table) {
                if (!Schema::hasColumn('salary_deductions', 'specific_employee_id')) {
                    $table->json('specific_employee_id')->nullable()->after('frequency');
                }
            });

            DB::statement("ALTER TABLE salary_deductions MODIFY COLUMN target_employee ENUM('monthly','daily','all','specific') NOT NULL");
            return;
        }

        if ($driver === 'sqlite') {
            // SQLite: rebuild the table to relax the enum CHECK constraint and add the new JSON column
            DB::beginTransaction();
            try {
                // Create a temporary table with the desired schema
                Schema::create('salary_deductions_temp', function (Blueprint $table) {
                    $table->id();
                    $table->string('name');
                    $table->integer('amount');
                    // Use string without CHECK so it accepts the new value 'specific'
                    $table->string('target_employee');
                    // Keep frequency if present; if not present, column will exist as nullable
                    $table->string('frequency')->nullable();
                    // New column for specific employee IDs
                    $table->json('specific_employee_id')->nullable();
                    $table->softDeletes();
                    $table->timestamps();
                });

                // Detect which columns exist in the current table
                $existingColumns = collect(DB::select("PRAGMA table_info('salary_deductions')"))
                    ->pluck('name')
                    ->map(fn ($n) => strtolower($n))
                    ->toArray();

                // Build select column list from old table
                $selectColumns = [
                    'id',
                    'name',
                    'amount',
                    'target_employee',
                ];
                if (in_array('frequency', $existingColumns, true)) {
                    $selectColumns[] = 'frequency';
                }
                if (in_array('deleted_at', $existingColumns, true)) {
                    $selectColumns[] = 'deleted_at';
                }
                if (in_array('created_at', $existingColumns, true)) {
                    $selectColumns[] = 'created_at';
                }
                if (in_array('updated_at', $existingColumns, true)) {
                    $selectColumns[] = 'updated_at';
                }

                // Fetch all rows from the old table
                $rows = DB::table('salary_deductions')->select($selectColumns)->get();

                // Insert rows into the temp table, mapping columns appropriately
                foreach ($rows as $row) {
                    DB::table('salary_deductions_temp')->insert([
                        'id' => $row->id,
                        'name' => $row->name,
                        'amount' => $row->amount,
                        'target_employee' => $row->target_employee,
                        'frequency' => property_exists($row, 'frequency') ? $row->frequency : null,
                        'specific_employee_id' => null,
                        'deleted_at' => property_exists($row, 'deleted_at') ? $row->deleted_at : null,
                        'created_at' => property_exists($row, 'created_at') ? $row->created_at : null,
                        'updated_at' => property_exists($row, 'updated_at') ? $row->updated_at : null,
                    ]);
                }

                // Replace old table with new
                Schema::drop('salary_deductions');
                Schema::rename('salary_deductions_temp', 'salary_deductions');

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }

            return;
        }

        // Default: just add the JSON column if supported
        Schema::table('salary_deductions', function (Blueprint $table) {
            if (!Schema::hasColumn('salary_deductions', 'specific_employee_id')) {
                $table->json('specific_employee_id')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // Revert enum and drop JSON column
            DB::statement("ALTER TABLE salary_deductions MODIFY COLUMN target_employee ENUM('monthly','daily','all') NOT NULL");
            Schema::table('salary_deductions', function (Blueprint $table) {
                if (Schema::hasColumn('salary_deductions', 'specific_employee_id')) {
                    $table->dropColumn('specific_employee_id');
                }
            });
            return;
        }

        if ($driver === 'sqlite') {
            // Rebuild table to drop JSON column and reapply original enum constraint semantics
            DB::beginTransaction();
            try {
                Schema::create('salary_deductions_temp_down', function (Blueprint $table) {
                    $table->id();
                    $table->string('name');
                    $table->integer('amount');
                    // Back to original three values by convention; enforce at app level for SQLite by using TEXT
                    $table->string('target_employee');
                    $table->string('frequency')->nullable();
                    $table->softDeletes();
                    $table->timestamps();
                });

                $existingColumns = collect(DB::select("PRAGMA table_info('salary_deductions')"))
                    ->pluck('name')
                    ->map(fn ($n) => strtolower($n))
                    ->toArray();

                $selectColumns = ['id','name','amount','target_employee'];
                if (in_array('frequency', $existingColumns, true)) {
                    $selectColumns[] = 'frequency';
                }
                if (in_array('deleted_at', $existingColumns, true)) {
                    $selectColumns[] = 'deleted_at';
                }
                if (in_array('created_at', $existingColumns, true)) {
                    $selectColumns[] = 'created_at';
                }
                if (in_array('updated_at', $existingColumns, true)) {
                    $selectColumns[] = 'updated_at';
                }

                $rows = DB::table('salary_deductions')->select($selectColumns)->get();
                foreach ($rows as $row) {
                    // skip rows that use 'specific' to satisfy original constraint semantics
                    if ($row->target_employee === 'specific') {
                        continue;
                    }
                    DB::table('salary_deductions_temp_down')->insert([
                        'id' => $row->id,
                        'name' => $row->name,
                        'amount' => $row->amount,
                        'target_employee' => $row->target_employee,
                        'frequency' => property_exists($row, 'frequency') ? $row->frequency : null,
                        'deleted_at' => property_exists($row, 'deleted_at') ? $row->deleted_at : null,
                        'created_at' => property_exists($row, 'created_at') ? $row->created_at : null,
                        'updated_at' => property_exists($row, 'updated_at') ? $row->updated_at : null,
                    ]);
                }

                Schema::drop('salary_deductions');
                Schema::rename('salary_deductions_temp_down', 'salary_deductions');

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }
            return;
        }

        // Default: just drop JSON column if present
        Schema::table('salary_deductions', function (Blueprint $table) {
            if (Schema::hasColumn('salary_deductions', 'specific_employee_id')) {
                $table->dropColumn('specific_employee_id');
            }
        });
    }
};
