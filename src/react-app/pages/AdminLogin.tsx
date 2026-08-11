import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiBase = window.location.hostname.includes('netlify.app')
                ? 'https://emigration-pro.aiservices4biz.workers.dev'
                : '';
            const response = await fetch(`${apiBase}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok || !data.token) {
                throw new Error(data.error || 'Incorrect password.');
            }
            sessionStorage.setItem('blogAdminToken', data.token);
            sessionStorage.setItem('adminAuth', 'true');
            setError('');
            navigate('/admin/blog');
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
                    <p className="text-gray-600">Enter password to access admin area</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="Enter admin password"
                            required
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
