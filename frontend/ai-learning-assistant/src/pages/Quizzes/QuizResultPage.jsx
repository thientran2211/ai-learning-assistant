import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen, Book, BarChart3 } from 'lucide-react';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const { t } = useTranslation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error(t('quizzes.errorFetchResults'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 text-lg">{t('quizzes.resultsNotFound')}</p>
        </div>
      </div>
    );
  }

  const { data: { quiz, results: detailedResults } } = results;
  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return t('quizzes.scoreOutstanding');
    if (score >= 80) return t('quizzes.scoreGreat');
    if (score >= 70) return t('quizzes.scoreGood');
    if (score >= 60) return t('quizzes.scoreNotBad');
    return t('quizzes.scoreKeepPracticing');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2} />
          {t('quizzes.backToDocument')}
        </Link>
      </div>

      <PageHeader title={t('quizzes.resultsTitle', { title: quiz.title || t('quizzes.quizTitle') })} />

      {/* Score card */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-15 h-15 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/25">
            <Trophy className="w-7 h-7 text-emerald-600" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              {t('quizzes.yourScore')}
            </p>
            <div className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}>
              {score}%
            </div>
            <p className="text-lg font-medium text-slate-700">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Target className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-slate-700">
                {totalQuestions} {t('quizzes.total')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-emerald-700">
                {correctAnswers} {t('quizzes.correct')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
              <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-rose-700">
                {incorrectAnswers} {t('quizzes.incorrect')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reading profile dashboard */}
      {quiz.levelScores && (
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-slate-900">{t('quizzes.readingProfile')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { level: 'literal', label: t('quizzes.levelLiteral') || 'Mức 1: Nhớ', color: 'blue', icon: Book },
            { level: 'inferential', label: t('quizzes.levelInferential') || 'Mức 3: Suy luận', color: 'purple', icon: Lightbulb },
            { level: 'evaluative', label: t('quizzes.levelEvaluative') || 'Mức 5: Đánh giá', color: 'amber', icon: Target }
          ].map(({ level, label, color, icon: Icon }) => {
            const score = quiz.levelScores[level] || 0;
            return (
              <div key={level} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${color}-600`} strokeWidth={2} />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                  <span className={`text-lg font-bold text-${color}-600`}>{score}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Recommendation */}
        {(() => {
          const scores = quiz.levelScores;
          const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
          if (weakest && weakest[1] < 70) {
            const labels = { literal: 'Mức 1: Nhớ', inferential: 'Mức 3: Suy luận', evaluative: 'Mức 5: Đánh giá' };
            return (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  💡 <strong>{t('quizzes.recommendation')}</strong> {t('quizzes.focusOn')}: <span className="font-semibold">{labels[weakest[0]]}</span> ({weakest[1]}%)
                </p>
              </div>
            );
          }
          return null;
        })()}
      </div>
    )}

      {/* Questions review */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-slate-600" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-slate-900">{t('quizzes.detailedReview')}</h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex(opt => opt === result.selectedAnswer);
          const correctAnswerIndex = result.correctAnswer.startsWith('0')
            ? parseInt(result.correctAnswer.substring(1)) - 1
            : result.options.findIndex(opt => opt === result.correctAnswer);
          const isCorrect = result.isCorrect;

          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                    <span className="text-xs font-semibold text-slate-600">
                      {t('quizzes.questionBadge', { number: index + 1 })}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                    {result.question}
                  </h4>
                </div>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isCorrect
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-rose-50 border-2 border-rose-200'
                  }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Options Review */}
              <div className="space-y-3 mb-4">
                {result.options.map((option, optIndex) => {
                  let correctIndex = -1;
  
                  if (result.correctAnswer) {
                    const correctStr = result.correctAnswer.toString().trim();
                    
                    if (correctStr.startsWith('0') && correctStr.match(/^0\d+$/)) {
                      correctIndex = parseInt(correctStr.substring(1)) - 1;
                    }
                    else if (correctStr.match(/^\d+$/)) {
                      correctIndex = parseInt(correctStr) - 1;
                    }
                    else {
                      const foundIndex = result.options.findIndex(opt => 
                        opt?.trim()?.toLowerCase() === correctStr?.trim()?.toLowerCase()
                      );
                      if (foundIndex !== -1) correctIndex = foundIndex;
                    }
                  }
                  
                  const isCorrectOption = optIndex === correctIndex;
                  const isUserAnswer = option === result.selectedAnswer;
                  const isWrongSelection = isUserAnswer && !result.isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        isCorrectOption
                          ? 'bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-500/10'
                          : isWrongSelection
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-medium ${
                          isCorrectOption ? 'text-emerald-900' : isWrongSelection ? 'text-rose-900' : 'text-slate-700'
                        }`}>
                          {option}
                        </span>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isCorrectOption && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                              Đáp án đúng
                            </span>
                          )}
                          
                          {isWrongSelection && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border border-rose-300 rounded-lg text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                              <XCircle className="w-3 h-3" strokeWidth={2.5} />
                              Của bạn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5">
                      <BookOpen className="w-4 h-4 text-slate-700" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                        {t('quizzes.explanation')}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action button */}
      <div className="mt-8 flex justify-center">
        <Link to={`/documents/${quiz.document._id}`}>
          <button className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
              {t('quizzes.btnReturn')}
            </span>
            <div className="absolute inset-0 bg-linear-to-r to-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform transition-700" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;