import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = response.data.access_token;
      // Decode JWT to get role (simple base64 decode for frontend)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', payload.role);
      
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-eco-dark mb-6">Welcome Back</h2>
      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:outline-none"
          />
        </div>
        <button type="submit" className="w-full bg-eco-green text-white font-semibold py-2 rounded-lg hover:bg-emerald-600 transition-colors">
          Log In
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/signup" className="text-eco-green hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
