import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock, Zap, Lock } from 'lucide-react';

// Helper function to format fize size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete, isGuest= false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatRelativeTime } = useDateFormat();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return <div
    className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300/60 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
    onClick={handleNavigate}
  >
    {/* Header section */}
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="shrink-0 w-12 h-12 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        {!isGuest && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {isGuest && document.expiresAt && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <Zap className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-medium text-amber-700">
                {formatRelativeTime(document.expiresAt)}
              </span>
            </div>
          )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 truncate mb-2" title={document.title}>
        {document.title}
      </h3>

      {/* Document info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        {document.fileSize !== undefined && (
          <>
            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
          </>
        )}
      </div>

      {/* Stats section */}
      <div className="flex items-center gap-3">
          {document.flashcardCount !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              isGuest 
                ? 'bg-slate-100 opacity-60 cursor-not-allowed' 
                : 'bg-purple-50'
            }`}
            title={isGuest ? t('documents.flashcardsLocked') : undefined}
            >
            <BookOpen className={`w-3.5 h-3.5 ${isGuest ? 'text-slate-400' : 'text-purple-600'}`} strokeWidth={2} />
            <span className={`text-xs font-semibold ${isGuest ? 'text-slate-500' : 'text-purple-700'}`}>
              {document.flashcardCount} {t('documents.flashcardsLabel')}
            </span>
            {/* 🔧 Lock icon cho guest */}
            {isGuest && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
          </div>
          )}
          
          {document.quizCount !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              isGuest 
                ? 'bg-slate-100 opacity-60 cursor-not-allowed' 
                : 'bg-emerald-50'
            }`}
            title={isGuest ? t('documents.quizzesLocked') : undefined}
            >
            <BrainCircuit className={`w-3.5 h-3.5 ${isGuest ? 'text-slate-400' : 'text-emerald-600'}`} strokeWidth={2} />
            <span className={`text-xs font-semibold ${isGuest ? 'text-slate-500' : 'text-emerald-700'}`}>
              {document.quizCount} {t('documents.quizzesLabel')}
            </span>
            {/* 🔧 Lock icon cho guest */}
            {isGuest && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
          </div>
          )}
        </div>
    </div>

    {/* Footer section */}
    <div className="mt-5 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{t('documents.uploaded')} {formatRelativeTime(document.createdAt)}</span>
      </div>
    </div>

    {/* Hover indicator */}
    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />
  </div>
};

export default DocumentCard;