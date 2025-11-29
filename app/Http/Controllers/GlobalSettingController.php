<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GlobalSettingController extends Controller
{
    private function getDatabaseBackups(): array
    {
        $parent_dir = storage_path('app/private/backup/db');
        if (!File::exists($parent_dir)) {
            return [];
        }

        return collect(File::files($parent_dir))
            ->map(function ($file) {
                $backup_at = null;
                if (preg_match('/backup_(\d{8}_\d{6})/', $file->getFilename(), $matches)) {
                    $backup_at = \DateTime::createFromFormat('Ymd_His', $matches[1]);
                    $backup_at = $backup_at ? $backup_at->format('Y-m-d H:i:s') : null;
                }
                return [
                    'file_name' => $file->getFilename(),
                    'file_path' => 'backup/db/' . $file->getFilename(),
                    'backup_at' => $backup_at,
                ];
            })
            ->sortByDesc(function ($backup) {
                return $backup['backup_at'] ?? '';
            })
            ->values()
            ->all();
    }

    private function getDBSingle($file_name)
    {
        $file_path = storage_path('app/private/backup/db/' . $file_name);
        if (!File::exists($file_path)) {
            return null;
        }
        $backup_at = null;
        if (preg_match('/backup_(\d{8}_\d{6})/', $file_name, $matches)) {
            $backup_at = \DateTime::createFromFormat('Ymd_His', $matches[1]);
            $backup_at = $backup_at ? $backup_at->format('Y-m-d H:i:s') : null;
        }

        return [
            'file_name' => $file_name,
            'file_path' => 'backup/db/' . $file_name,
            'backup_at' => $backup_at,
        ];
    }

    public function backupView()
    {
        $backups = $this->getDatabaseBackups();
        return Inertia::render('Setting/Backup/Index', [
            'title' => 'Backup Database',
            'description' => 'Amankan database Anda dengan membuat backup secara berkala.',
            'backups' => $backups,
        ]);
    }

    public function createBackup()
    {
        $backupPath = 'backup/db';
        $fileName = 'backup_' . now()->format('Ymd_His') . '.sqlite';
        $sourcePath = database_path('database.sqlite');

        if (file_exists($sourcePath)) {
            Storage::putFileAs($backupPath, $sourcePath, $fileName);
            Session::flash('success', 'Database telah berhasil dibackup.');
        } else {
            Session::flash('error', 'Gagal membuat backup database.');
        }
        return Inertia::location('/backup');
    }

    public function downloadBackup($file_name)
    {
        $db_backup = $this->getDBSingle($file_name);
        $file_path = storage_path('app/private/' . $db_backup['file_path']);
        if (file_exists($file_path)) {
            return response()->download($file_path, $db_backup['file_name']);
        } else {
            Session::flash('error', 'File backup tidak ditemukan.');
            return Inertia::location('/backup');
        }
    }

    public function deleteBackup($file_name)
    {
        $db_backup = $this->getDBSingle($file_name);
        $file_path = storage_path('app/private/' . $db_backup['file_path']);

        if (file_exists($file_path)) {
            unlink($file_path);
            Session::flash('success', 'File backup telah dihapus.');
        } else {
            Session::flash('error', 'File backup tidak ditemukan.');
        }
        return Inertia::location('/backup');
    }

    public function restoreBackup($file_name)
    {
        $db_backup = $this->getDBSingle($file_name);
        if (!$db_backup) {
            Session::flash('error', 'File backup tidak ditemukan.');
            return Inertia::location('/backup');
        }

        $source_backup = storage_path('app/private/' . $db_backup['file_path']);
        $destination_db = database_path('database.sqlite');
        if (!file_exists($source_backup)) {
            Session::flash('error', 'File backup tidak ditemukan.');
            return Inertia::location('/backup');
        }
        DB::statement('PRAGMA wal_checkpoint(FULL)');
        DB::disconnect('sqlite');
        usleep(500000);
        $backupDir = storage_path('app/private/backup/db');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }
        $rollbackName = 'backup_' . now()->format('Ymd_His') . '.sqlite';
        File::copy($destination_db, $backupDir . DIRECTORY_SEPARATOR . $rollbackName);
        File::copy($source_backup, $destination_db);
        DB::purge('sqlite');
        DB::reconnect('sqlite');
        Session::flash('success', 'Database berhasil direstore dari backup.');
        return Inertia::location('/backup');
    }

    public function importFromZero(Request $request){
        $request->validate([
            'sqlite_file' => 'required|file|mimes:sqlite,sqlite3,db',
        ]);

        $file = $request->file('sqlite_file');
        try {
            $destination_db = database_path('database.sqlite');
            
            // Create backup of current database first
            $backupDir = storage_path('app/private/backup/db');
            if (!File::exists($backupDir)) {
                File::makeDirectory($backupDir, 0755, true);
            }
            $rollbackName = 'backup_' . now()->format('Ymd_His') . '.sqlite';
            File::copy($destination_db, $backupDir . DIRECTORY_SEPARATOR . $rollbackName);
            
            // Close database connections
            DB::statement('PRAGMA wal_checkpoint(FULL)');
            DB::disconnect('sqlite');
            usleep(500000);
            
            // Replace current database with uploaded file
            $uploadedFile = $file->getRealPath();
            File::copy($uploadedFile, $destination_db);
            
            // Reconnect to database
            DB::purge('sqlite');
            DB::reconnect('sqlite');
            
            Session::flash('success', 'Database berhasil diimport. Silakan login ulang jika diperlukan.');
        } catch (\Exception $e) {
            Session::flash('error', 'Gagal import database: ' . $e->getMessage());
        }
        return Inertia::location('/backup');
    }

    public function settingView()
    {
        $setting = \App\Models\Setting::first();
        return Inertia::render('Setting/App/Index', [
            'title' => 'Pengaturan aplikasi',
            'description' => 'Kelola pengaturan untuk semua karyawan di aplikasi Anda.',
            'setting' => $setting,
        ]);
    }

    public function updateSetting(Request $request)
    {
        $request->validate([
            'normal_work_hours' => 'required|numeric',
            'attendance_start' => 'required',
            'attendance_end' => 'required',
        ]);

        $setting = \App\Models\Setting::first();
        if ($setting) {
            $setting->update([
                'normal_work_hours' => $request->normal_work_hours,
                'attendance_start' => $request->attendance_start,
                'attendance_end' => $request->attendance_end,
            ]);
            Session::flash('success', 'Pengaturan berhasil diperbarui.');
        } else {
            \App\Models\Setting::create([
                'normal_work_hours' => $request->normal_work_hours,
                'attendance_start' => $request->attendance_start,
                'attendance_end' => $request->attendance_end,
            ]);
            Session::flash('success', 'Pengaturan berhasil dibuat.');
        }
        return Inertia::location('/setting');
    }
}
