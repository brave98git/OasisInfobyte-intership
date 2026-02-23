import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
                {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                        <input type="text" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-500" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="mb-6 flex items-center">
                        <input type="checkbox" id="adminCheck" checked={role === 'admin'} onChange={(e) => setRole(e.target.checked ? 'admin' : 'user')} className="mr-2" />
                        <label htmlFor="adminCheck" className="text-sm text-gray-700">Register as Admin (for demo purposes)</label>
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-red-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
