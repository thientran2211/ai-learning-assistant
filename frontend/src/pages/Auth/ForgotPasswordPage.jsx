import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, ArrowLeft } from 'lucide-react';
import { isValidEmail, getEmailError } from '../../utils/validation';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !isValidEmail(value) ? 'invalid_format' : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || emailError) {
      setEmailError(emailError || 'required');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success(t('auth.resetLinkSent'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
        <div className="relative w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-emerald-600" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-3">{t('auth.checkEmail')}</h2>
            <p className="text-slate-600 mb-8">{t('auth.checkEmailDesc')}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft size={16} /> {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft size={16} /> {t('auth.backToLogin')}
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight">{t('auth.forgotTitle')}</h1>
            <p className="text-slate-500 text-sm mt-2">{t('auth.forgotDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">{t('auth.email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none focus:bg-white ${
                    emailError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'
                  }`}
                  placeholder={t('auth.placeholderEmail')}
                  autoFocus
                />
              </div>
              {emailError && <p className="text-xs text-red-500 ml-1">{emailError === 'invalid_format' ? t('auth.emailInvalid') : t('auth.emailRequired')}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !!emailError || !email.trim()}
              className="w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;