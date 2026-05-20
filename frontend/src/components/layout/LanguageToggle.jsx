import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const VietnamFlag = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 900 600" 
    style={{ display: 'block' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background: Official Red */}
    <rect width="900" height="600" fill="#DA251D" />
    
    {/* Centered Golden Star */}
    <polygon 
      fill="#FFFF00" 
      points="450,120 485,229 600,229 507,297 542,405 450,338 358,405 393,297 300,229 415,229" 
    />
  </svg>
);

const UKFlag = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 60 30"
    style={{ display: 'block' }}
  >
    <defs>
      <clipPath id="uk-clip">
        <rect width="60" height="30" rx="2" />
      </clipPath>
    </defs>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="white" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 L30,30 M0,15 L60,15" stroke="white" strokeWidth="10" />
      <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200/60 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
        title="Change Language"
      >
        <div className="w-6 h-4 overflow-hidden rounded-sm shadow-sm flex-shrink-0 border border-slate-100">
          {i18n.language === 'en' ? <UKFlag /> : <VietnamFlag />}
        </div>
        
        <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900">
          {i18n.language === 'en' ? 'EN' : 'VN'}
        </span>
        
        <ChevronDown 
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200/60 py-1 z-20">
            <button
              onClick={() => {
                if (i18n.language !== 'en') toggleLanguage();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${i18n.language === 'en' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}
            >
              <div className="w-6 h-4 overflow-hidden rounded-sm flex-shrink-0 border border-slate-100">
                <UKFlag />
              </div>
              <span>English</span>
              {i18n.language === 'en' && (
                <svg className="w-4 h-4 ml-auto text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                if (i18n.language !== 'vi') toggleLanguage();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${i18n.language === 'vi' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}
            >
              <div className="w-6 h-4 overflow-hidden rounded-sm flex-shrink-0 border border-slate-100">
                <VietnamFlag />
              </div>
              <span>Tiếng Việt</span>
              {i18n.language === 'vi' && (
                <svg className="w-4 h-4 ml-auto text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;