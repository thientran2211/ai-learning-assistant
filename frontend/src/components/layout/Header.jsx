import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

import LanguageToggle from './LanguageToggle';
import progressService from '../../services/progressService';
import moment from 'moment';

const Header = ({ toggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const notifRef = useRef(null);
  const { t } = useTranslation(); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showNotif && isAuthenticated) {
      fetchRecentActivity();
    }
  }, [showNotif, isAuthenticated]);

  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const data = await progressService.getDashboardData();
      if (data.data && data.data.recentActivity) {
        const activities = [
          ...(data.data.recentActivity.documents || []).map(doc => ({
            id: doc._id,
            type: 'document',
            description: doc.title,
            timestamp: doc.lastAccessed,
            link: `/documents/${doc._id}`
          })),
          ...(data.data.recentActivity.quizzes || []).map(quiz => ({
            id: quiz._id,
            type: 'quiz',
            description: quiz.title,
            timestamp: quiz.lastAttempted,
            link: `/quizzes/${quiz._id}`
          }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setRecentActivity(activities.slice(0, 5)); // Show max 5 activities
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };
  
  const getActivityIcon = (type) => {
    return type === 'document' ? 'bg-blue-500' : 'bg-emerald-500';
  };

  const getActivityText = (type) => {
    return type === 'document' ? t('dashboard.activity.accessedDoc') : t('dashboard.activity.attemptedQuiz');
  };

  return (
    <header className="app-header">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">

        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:block"></div>

        <div className="flex items-center gap-2 md:gap-3">

          <LanguageToggle />

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
            >
              <Bell size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="sr-only">{t('header.notifications')}</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-slate-200/60 p-4 z-50 animate-in fade-in slide-in-from-top-2 language-dropdown">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">{t('dashboard.recentActivity')}</h4>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {t('common.view')}
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {loadingActivity ? (
                    <div className="text-center py-4">
                      <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => {
                          navigate(activity.link);
                          setShowNotif(false);
                        }}
                        className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full ${getActivityIcon(activity.type)} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium truncate">
                            {getActivityText(activity.type)} {activity.description}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {moment(activity.timestamp).fromNow()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-500">{t('dashboard.noActivity')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 pl-3 border-l border-slate-200/60 cursor-pointer hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-all duration-200 group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;