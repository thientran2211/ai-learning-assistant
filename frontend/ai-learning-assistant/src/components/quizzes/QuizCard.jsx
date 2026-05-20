import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../../utils/dateFormatter';
import { Link } from 'react-router-dom';
import { Play, BarChart2, Trash2, Award, Brain, Target, Lightbulb, Book } from 'lucide-react';

const QuizCard = ({ quiz, onDelete, showBarrettBadge = true }) => {
  const { t } = useTranslation();
  const { formatDate: formatDateUtil } = useDateFormat();

  const getBarrettInfo = () => {
    if (!quiz.questions?.length) return { label: t('quizzes.levelAll'), icon: Brain, color: 'slate' };
    
    const levels = quiz.questions.map(q => q.barrettLevel || 'literal');
    const counts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const isMixed = Object.values(counts).some(c => c > 0 && c < quiz.questions.length);
    
    const config = {
      literal: { label: t('quizzes.levelLiteral') || '🔹 Mức 1', icon: Book, color: 'blue' },
      inferential: { label: t('quizzes.levelInferential') || '🔸 Mức 3', icon: Lightbulb, color: 'purple' },
      evaluative: { label: t('quizzes.levelEvaluative') || '🔶 Mức 5', icon: Target, color: 'amber' }
    };
    
    return isMixed 
      ? { label: t('quizzes.levelMixed') || '🎯 Hỗn hợp', icon: Brain, color: 'emerald' }
      : config[dominant] || config.literal;
  };

  const barrettInfo = getBarrettInfo();
  const BarrettIcon = barrettInfo.icon;

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between">
      
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(quiz); }}
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        title={t('common.delete')}
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>

      <div className="space-y-4 flex-1 pr-8"> 
        
        <div className="flex items-start justify-between gap-2">
          {showBarrettBadge && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border shrink-0 ${
              barrettInfo.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' :
              barrettInfo.color === 'purple' ? 'bg-purple-50 border-purple-200 text-purple-700' :
              barrettInfo.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <BarrettIcon className="w-3 h-3" strokeWidth={2.5} />
              {barrettInfo.label}
            </div>
          )}
          
          {quiz?.score !== undefined && quiz.completedAt && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 shrink-0">
              <Award className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-emerald-700">{quiz.score}%</span>
            </div>
          )}
        </div>

        {/* Row 2: Title & Date */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2" title={quiz.title}>
            {quiz.title || `${t('quizzes.quizTitle')} - ${formatDateUtil(quiz.createdAt)}`}
          </h3>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {t('quizzes.created')} {formatDateUtil(quiz.createdAt)}
          </p>
        </div>

        {/* Row 3: Info & Level Breakdown */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
              {quiz.questions.length} {quiz.questions.length === 1 ? t('quizzes.questionSingular') : t('quizzes.questionPlural')}
            </span>
          </div>
          {quiz.completedAt && quiz.levelScores && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span>L: {quiz.levelScores.literal}%</span>
              <span>•</span>
              <span>I: {quiz.levelScores.inferential}%</span>
              <span>•</span>
              <span>E: {quiz.levelScores.evaluative}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="mt-2 pt-4 border-t border-slate-100">
        {quiz?.userAnswers?.length > 0 ? (
          <Link to={`/quizzes/${quiz._id}/results`}>
            <button className="group/btn w-full inline-flex items-center justify-center gap-2 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 cursor-pointer">
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              {t('quizzes.btnViewResults')}
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`}>
            <button className="group/btn relative w-full h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Play className="w-4 h-4" strokeWidth={2.5} />
                {t('quizzes.btnStartQuiz')}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;