import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, Zap, ArrowRight, AlertCircle,
  TrendingUp, Shield, BarChart3, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  { icon: TrendingUp, text: 'Real-time sales & revenue tracking' },
  { icon: Shield, text: 'Secure GST-compliant billing' },
  { icon: BarChart3, text: 'Comprehensive business reports' },
  { icon: CheckCircle2, text: 'One-click invoice generation' },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { login } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email or mobile number is required';
    } else if (!/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(email) && !/^\+?[\d\s-]{10,}$/.test(email)) {
      newErrors.email = 'Enter a valid email or mobile number';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setErrors({ general: 'Invalid credentials. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel - hero */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-gradient-to-br from-slate-900 via-primary-950 to-indigo-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center shadow-2xl shadow-primary-600/40">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">Bill</span>
              <span className="text-2xl font-black text-primary-400 tracking-tight">Flow</span>
              <span className="ml-2 text-xs font-semibold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">PRO</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Manage your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">
                business smarter
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-md">
              Complete billing and business management solution built for Indian store owners.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors duration-200">
                  <f.icon className="w-4.5 h-4.5 text-primary-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '₹2.4Cr+', label: 'Billed Monthly' },
              { value: '1,200+', label: 'Invoices/Day' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">© 2026 BillFlow Pro · All rights reserved</p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">Bill</span>
              <span className="text-xl font-black text-primary-600">Flow</span>
              <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">PRO</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-slate-500">Sign in to your store dashboard</p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email / Mobile */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                  placeholder="rajesh@store.com or +91 98765 43210"
                  className={`input-base pl-11 ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                  placeholder="Enter your password"
                  className={`input-base pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                id="remember-me"
                onClick={() => setRememberMe(r => !r)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0
                  ${rememberMe ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white hover:border-primary-400'}`}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <label htmlFor="remember-me" className="text-sm text-slate-600 cursor-pointer select-none" onClick={() => setRememberMe(r => !r)}>
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="btn-primary w-full h-12 text-base mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-xs font-semibold text-primary-700 mb-1">Demo Credentials</p>
            <p className="text-xs text-primary-600">Email: <span className="font-mono">rajesh@billflow.in</span></p>
            <p className="text-xs text-primary-600">Password: <span className="font-mono">any 6+ chars</span></p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Need help?{' '}
            <button className="text-primary-600 font-semibold hover:underline">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
