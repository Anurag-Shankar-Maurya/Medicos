import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Lock, User as UserIcon } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.post<any>('/users/auth/login/', { username, password });
      login(res.token, res.user);
      addToast('Successfully logged in!', 'success');
      navigate('/');
    } catch (err: any) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-600 text-white mb-4">
            <span className="font-bold text-2xl">M</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to your Medicos dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<UserIcon size={18} />}
            placeholder="admin"
          />
          
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Demo Credentials: user: admin, pass: any</p>
          Forgot your password? <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Contact support</a>
        </div>
      </div>
    </div>
  );
};