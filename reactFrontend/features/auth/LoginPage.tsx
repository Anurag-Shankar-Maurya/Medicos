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
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('remember_choice') === 'true');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{username?: string; password?: string; general?: string}>({});
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {username?: string; password?: string} = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: any) => {
    // Handle network errors (fetch failures)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    // Handle structured errors from API client
    if (error.status && error.message) {
      const status = error.status;
      const data = error.data;

      switch (status) {
        case 400:
          // Bad request - likely missing fields
          return data?.error || 'Please provide both username and password.';
        case 401:
          // Unauthorized - invalid credentials
          return 'Invalid username or password. Please try again.';
        case 403:
          // Forbidden
          return 'Access denied. Please contact your administrator.';
        case 404:
          // Not found
          return 'Authentication service not available.';
        case 429:
          // Too many requests
          return 'Too many login attempts. Please try again later.';
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          return 'Server error. Please try again later.';
        default:
          // Other errors
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle mock API errors or other generic errors
    if (error.message) {
      return error.message;
    }

    // Fallback
    return 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post<any>('/users/auth/login/', { username: username.trim(), password });

      // Store the preference for the next time the login page is visited
      if (rememberMe) {
        localStorage.setItem('remember_choice', 'true');
      } else {
        localStorage.removeItem('remember_choice');
      }

      login(res.token, res.user, rememberMe);
      addToast('Successfully logged in!', 'success');
      navigate('/');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setErrors({ general: errorMessage });
      addToast(errorMessage, 'error');
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

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              // Clear error when user starts typing
              if (errors.username) {
                setErrors(prev => ({ ...prev, username: undefined }));
              }
            }}
            icon={<UserIcon size={18} />}
            placeholder="admin"
            error={errors.username}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              // Clear error when user starts typing
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            icon={<Lock size={18} />}
            placeholder="••••••••"
            error={errors.password}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-colors"
              />
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Remember me</span>
            </label>
            <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};
