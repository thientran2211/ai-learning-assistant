import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../../utils/dateFormatter';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { 
  FileText, BookOpen, BrainCircuit, TrendingUp, Clock, 
  Target, Lightbulb, Book, BarChart3, ArrowUpRight 
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { formatDate: formatDateUtil } = useDateFormat();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (error) {
        toast.error(t('dashboard.errorFetch') || "Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
          <div className="">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">{t('dashboard.noData')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: t('dashboard.totalDocuments'),
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: t('dashboard.totalFlashcards'),
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: t('dashboard.totalQuizzes'),
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25'
    }
  ];

  const getLevelConfig = (level) => {
    const configs = {
      literal: { 
        label: t('dashboard.levelLiteral') || 'Mức 1: Nhớ', 
        icon: Book, 
        color: 'blue',
        desc: t('dashboard.levelLiteralDesc') || 'Trích xuất thông tin trực tiếp'
      },
      inferential: { 
        label: t('dashboard.levelInferential') || 'Mức 3: Suy luận', 
        icon: Lightbulb, 
        color: 'purple',
        desc: t('dashboard.levelInferentialDesc') || 'Đọc giữa các dòng, suy luận'
      },
      evaluative: { 
        label: t('dashboard.levelEvaluative') || 'Mức 5: Đánh giá', 
        icon: Target, 
        color: 'amber',
        desc: t('dashboard.levelEvaluativeDesc') || 'Đánh giá logic, tính hợp lý'
      }
    };
    return configs[level] || configs.literal;
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-500 text-sm">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-900 tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Reading Profile Section */}
        {dashboardData.readingProfile?.scores && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t('dashboard.readingProfile') || 'Reading Profile'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('dashboard.readingProfileDesc') || "Đánh giá kỹ năng đọc hiểu theo Barrett''s Taxonomy"}
                  </p>
                </div>
              </div>
            </div>

            {/* Level Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['literal', 'inferential', 'evaluative'].map((level) => {
                const config = getLevelConfig(level);
                const Icon = config.icon;
                const score = dashboardData.readingProfile.scores[level];
                const hasData = score !== null && score !== undefined;
                
                return (
                  <div 
                    key={level} 
                    className={`p-4 rounded-xl border transition-all ${
                      hasData 
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                        : 'bg-slate-50/50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${config.color}-600`} strokeWidth={2} />
                        <span className="text-sm font-medium text-slate-700">{config.label}</span>
                      </div>
                      {hasData ? (
                        <span className={`text-lg font-bold text-${config.color}-600`}>{score}%</span>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa có dữ liệu</span>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full bg-${config.color}-500 rounded-full transition-all duration-700 ease-out`}
                        style={{ width: hasData ? `${score}%` : '0%' }}
                      />
                    </div>
                    
                    {/* Description */}
                    <p className="text-[10px] text-slate-500">{config.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Recommendation */}
            {dashboardData.readingProfile.weakestLevel && dashboardData.readingProfile.scores[dashboardData.readingProfile.weakestLevel] < 70 && (
              <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      {t('dashboard.recommendation') || '💡 Gợi ý cải thiện:'}
                    </p>
                    <p className="text-sm text-amber-800">
                      {t('dashboard.focusOnLevel', { 
                        level: getLevelConfig(dashboardData.readingProfile.weakestLevel).label 
                      }) || 'Tập trung luyện các câu hỏi'} 
                      <span className="font-semibold"> {dashboardData.readingProfile.scores[dashboardData.readingProfile.weakestLevel]}%</span>.
                      {t('dashboard.practiceTip') || ' Tạo quiz mới với mức độ này để cải thiện kỹ năng.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent activity section */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              {t('dashboard.recentActivity')}
            </h3>
          </div>

          {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className="space-y-3">
              {[
                ...(dashboardData.recentActivity.documents || []).map(doc => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  link: `/documents/${doc._id}`,
                  type: 'document'
                })),
                ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.lastAttempted,
                  link: `/quizzes/${quiz._id}`,
                  type: 'quiz'
                }))
              ]
                .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                .map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${activity.type === 'document'
                          ? 'bg-linear-to-r from-blue-400 to-cyan-500'
                          : 'bg-linear-to-r from-emerald-400 to-teal-500'
                          }`} />
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.type === 'document' ? t('dashboard.activity.accessedDoc') : t('dashboard.activity.attemptedQuiz')}
                          <span className="text-slate-700">{activity.description}</span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 pl-4">
                        {formatDateUtil(activity.timestamp)}
                      </p>
                    </div>
                    {activity.link && (
                      <a
                        href={activity.link}
                        className="ml-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 whitespace-nowrap"
                      >
                        {t('common.view')}
                      </a>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">{t('dashboard.noActivity')}</p>
              <p className="text-xs text-slate-500 mt-1">{t('dashboard.startLearning')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;