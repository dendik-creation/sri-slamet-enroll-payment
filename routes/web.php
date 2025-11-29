<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeSalaryController;
use App\Http\Controllers\GlobalSettingController;
use App\Http\Controllers\InstalmentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SalaryDeductionController;
use App\Http\Controllers\ThrController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AuthController::class, 'signedInStatus'])->name('login');
Route::prefix('auth')->group(function () {
    Route::get('/signin', [AuthController::class, 'signInView'])
        ->name('auth.signin')
        ->middleware('guest');

    Route::post('/signin', [AuthController::class, 'signIn'])->middleware('guest');
});


Route::middleware('auth')->group(function(){
    Route::post('/auth/signout', [AuthController::class, 'signOut']);
    Route::post('/auth/check-password', [AuthController::class, 'checkPassword']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('position', PositionController::class);
    Route::resource('employee', EmployeeController::class);
    Route::resource('attendance', AttendanceController::class);
    Route::resource('salary-deduction', SalaryDeductionController::class);
    // Print Instalment
    Route::get('/instalment/print-legger', [InstalmentController::class, 'printLegger']);
    Route::get('/instalment/{instalment_id}/print', [InstalmentController::class, 'print']);
    Route::resource('instalment', InstalmentController::class);

    // Specific Routes
    Route::prefix('salary-daily')->group(function(){
        Route::get('/', [EmployeeSalaryController::class, 'dailyView']);
        Route::post('/store', [EmployeeSalaryController::class, 'storeDailySalary']);
        Route::get('/print', [EmployeeSalaryController::class, 'printDailySalaryReport']);
    });
    Route::prefix('salary-monthly')->group(function(){
        Route::get('/', [EmployeeSalaryController::class, 'monthlyView']);
        Route::post('/store', [EmployeeSalaryController::class, 'storeMonthlySalary']);
        Route::get('/print', [EmployeeSalaryController::class, 'printMonthlySalaryReport']);
    });

    Route::prefix('salary-slip')->group(function () {
        Route::get('/', [EmployeeSalaryController::class, 'slipView']);
        Route::get('/show/{salary_id}', [EmployeeSalaryController::class, 'slipShow']);
        Route::get('/edit/{salary_id}', [EmployeeSalaryController::class, 'slipEdit']);
        Route::put('/update/{salary_id}', [EmployeeSalaryController::class, 'slipUpdate']);
        Route::get('/print/all', [EmployeeSalaryController::class, 'printSalarySlipAll']);
        Route::get('/print/spesific/{salary_id}', [EmployeeSalaryController::class, 'printSalarySlipSpesific']);
        Route::delete('/{salary_id}', [EmployeeSalaryController::class, 'slipDestroy']);
    });

    Route::prefix('slip-envelope')->group(function () {
        Route::get('/', [EmployeeSalaryController::class, 'slipEnvelopeView']);
        Route::get('/print', [EmployeeSalaryController::class, 'printSalarySlipEnvelope']);
    });

    Route::prefix('thr')->group(function(){
        Route::get('/', [ThrController::class, 'index']);
        Route::post('/', [ThrController::class, 'store']);
        Route::get('/{thr_bonus_id}', [ThrController::class, 'show']);
        Route::delete('/{thr_bonus_id}', [ThrController::class, 'destroy']);
        Route::get('/{thr_bonus_id}/print-all', [ThrController::class, 'printAll']);
        Route::get('/{thr_bonus_id}/print/{employee_thr_id}', [ThrController::class, 'printSpesific']);
    });

    Route::get('/expense', [DashboardController::class, 'expenseView']);

    Route::get('/setting', [GlobalSettingController::class, 'settingView']);
    Route::put('/setting/update', [GlobalSettingController::class, 'updateSetting']);

    Route::prefix('backup')->group(function () {
        Route::get('/', [GlobalSettingController::class, 'backupView']);
        Route::post('/create', [GlobalSettingController::class, 'createBackup']);
        Route::post('/import-from-zero', [GlobalSettingController::class, 'importFromZero']);
        Route::get('/download/{file_name}', [GlobalSettingController::class, 'downloadBackup']);
        Route::delete('/delete/{file_name}', [GlobalSettingController::class, 'deleteBackup']);
        Route::put('/restore/{file_name}', [GlobalSettingController::class, 'restoreBackup']);
    });

    // Import Spesific Route
    Route::prefix('import')->group(function () {
        Route::post('/attendance', [AttendanceController::class, 'import']);
    });

    // Print Salary Deduction
    Route::get('/salary-deduction/{salary_deduction_id}/print', [SalaryDeductionController::class, 'print']);
});
