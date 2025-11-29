<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function signedInStatus()
    {
        $auth = Auth::user();
        if (!$auth) {
            return Inertia::location('/auth/signin');
        }
        return Inertia::location('/dashboard');
    }

    public function signInView()
    {
        return Inertia::render('Auth/SignIn', [
            "app_name" => config('app.name'),
        ]);
    }

    public function signIn(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('username', $credentials['username'])->first();
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return back()->withErrors([
                'message' => 'Username atau password salah',
            ]);
        }

        if (Auth::attempt($credentials)) {
            return Inertia::location('/');
        }

        return back()->withErrors([
            'message' => 'Authentication failed',
        ]);
    }

    public function signOut($password_changed = false)
    {
        Auth::logout();
        if($password_changed) {
            Session::flash('success', 'Password berhasil diubah. Silakan login kembali.');
        } else {
            Session::flash('success', 'Logout berhasil');
        }
        return Inertia::location('/auth/signin');
    }

    public function checkPassword(Request $request){
        $request->validate([
            'current_password' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user || !Hash::check($request->current_password, $user->password)) {
            return response()->json(['valid' => false]);
        }

        return response()->json(['valid' => true]);
    }

    public function changePassword(Request $request){
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|confirmed',
        ]);
        
        $user_id = Auth::user()->id;
        $user = User::find($user_id);
        if (!$user || !Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'message' => 'Password saat ini salah',
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->signOut(true);
    }
}
