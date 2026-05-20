import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrainCircuit, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('auth.invalidToken'));
      navigate('/login');
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success(t('auth.passwordResetSuccess'));

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4">
              <Lock className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight">{t('auth.resetTitle')}</h1>
            <p className="text-slate-500 text-sm mt-2">{t('auth.resetDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">{t('auth.newPassword')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full h-12 pl-12 pr-12 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.updating') : t('auth.updatePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;