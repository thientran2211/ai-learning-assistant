import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BrainCircuit, 
  Upload, 
  MessageCircle, 
  Sparkles, 
  BookOpen, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';

import LanguageToggle from '../components/layout/LanguageToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      
      {/* Header */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BrainCircuit className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Awesome PDF</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageToggle />

            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                {t('auth.signIn')}
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
              >
                {t('auth.signUp')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="page-container py-16 md:py-24 flex-1">
        <div className="text-center mb-16">

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              {t('landing.freeToUse')}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            {t('landing.heroTitle')}
          </h2>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/documents')}
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              {t('landing.startUploading')}
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-emerald-700 bg-white border-2 border-emerald-500 rounded-2xl hover:bg-emerald-50 transition-all duration-200"
            >
              {t('landing.createAccount')}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="section-spacing grid md:grid-cols-3 gap-6">
          <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {t('landing.featureUploadTitle')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.featureUploadDesc')}
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {t('landing.featureChatTitle')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.featureChatDesc')}
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {t('landing.featureAITitle')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.featureAIDesc')}
            </p>
          </div>
        </div>

        {/* Premium Features Teaser */}
        <div className="section-spacing bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/60 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
              <Trophy className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              {t('landing.premiumTitle')}
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('landing.premiumSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('landing.featureFlashcardsTitle')}
                  </h4>
                  <p className="text-slate-600">
                    {t('landing.featureFlashcardsDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('landing.featureQuizzesTitle')}
                  </h4>
                  <p className="text-slate-600">
                    {t('landing.featureQuizzesDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
            >
              {t('landing.unlockPremium')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="section-spacing text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            {t('landing.whyChooseTitle')}
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('landing.whyChooseSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: t('landing.reason1Title'), desc: t('landing.reason1Desc') },
            { icon: CheckCircle2, title: t('landing.reason2Title'), desc: t('landing.reason2Desc') },
            { icon: BrainCircuit, title: t('landing.reason3Title'), desc: t('landing.reason3Desc') }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                <item.icon className="w-8 h-8 text-emerald-600" strokeWidth={2} />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <BrainCircuit className="text-white w-4 h-4" strokeWidth={2} />
              </div>
              <span className="font-bold text-slate-900">Awesome PDF</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 Awesome PDF. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;