import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { isValidEmail, getEmailError } from '../../utils/validation';
import authService from '../../services/authService';
import { BrainCircuit, Mail, Home, Lock, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(getEmailError(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email.trim() || emailError) {
      setEmailError(emailError || 'Email is required');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.errorPasswordLength'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.register(username, email, password);
      toast.success(t('auth.successRegister'));
      navigate('/login');
    } catch (error) {
      const errorMsg = error.message || t('auth.errorRegister');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex flex-col">

      <div className="w-full px-6 py-4 md:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors decoration-2 underline-offset-4"
        >
          <Home className="w-4 h-4" />
          {t('common.backToHome')}
        </Link>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-slate-500 text-sm">
              {t('auth.registerSub')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {t('auth.username')}
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "username" ? "text-emerald-500" : "text-slate-400"}`}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  placeholder={t('auth.placeholderUsername')}
                  autoFocus
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "email" ? "text-emerald-500" : "text-slate-400"}`}>
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 ${
                    emailError
                      ? 'border-red-300 focus:border-red-500 focus:shadow-red-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:shadow-emerald-500/10'
                  }`}
                  placeholder={t('auth.placeholderEmail')}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="text-xs text-red-500 font-medium mt-1 ml-1" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "password" ? "text-emerald-500" : "text-slate-400"}`}>
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  // 🔧 FIX: Thay pr-4 bằng pr-12 để tránh text bị đè bởi icon mắt
                  className="w-full h-12 pl-12 pr-12 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  placeholder={t('auth.placeholderPassword')}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleSubmit(e); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>             
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-600 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('auth.loadingCreating')}
                  </>
                ) : (
                  <>
                    {t('auth.createAccount')}
                    <ArrowRight
                      className="w-4 h-4 group-hover: translate-x-1 transition-transform duration-200"
                      strokeWidth={2} />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-center text-sm text-slate-600">
              {t('auth.haveAccount')}{" "}
              <Link to='/login' className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Subtle footer text */}
      <p className="text-center text-xs text-slate-400 pb-6">
        {t('auth.footerPolicy')}
      </p>
    </div>
  );
};

export default RegisterPage;