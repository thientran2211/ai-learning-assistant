import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, BrainCircuit, BookOpen, Trophy, CheckCircle2 } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, featureName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getFeatureInfo = () => {
    switch (featureName) {
      case 'flashcards':
        return {
          icon: BookOpen,
          title: t('upgrade.flashcardsTitle'),
          desc: t('upgrade.flashcardsDesc'),
          benefits: [
            t('upgrade.benefit1'),
            t('upgrade.benefit2'),
            t('upgrade.benefit3')
          ]
        };
      case 'quizzes':
        return {
          icon: Trophy,
          title: t('upgrade.quizzesTitle'),
          desc: t('upgrade.quizzesDesc'),
          benefits: [
            t('upgrade.benefit4'),
            t('upgrade.benefit5'),
            t('upgrade.benefit6')
          ]
        };
      default:
        return {
          icon: BrainCircuit,
          title: t('upgrade.defaultTitle'),
          desc: t('upgrade.defaultDesc'),
          benefits: [
            t('upgrade.benefit1'),
            t('upgrade.benefit4'),
            t('upgrade.benefit7')
          ]
        };
    }
  };

  const feature = getFeatureInfo();
  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-4">
            <Icon className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-slate-600">
            {feature.desc}
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-3 mb-8">
          {feature.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all duration-200"
          >
            {t('common.maybeLater')}
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            {t('upgrade.registerNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;