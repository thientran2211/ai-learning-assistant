import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  ExternalLink, 
  Zap, 
  Lock, 
  BookOpen, 
  BrainCircuit
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import LanguageToggle from '../../components/layout/LanguageToggle';
import QuizManager from '../../components/quizzes/QuizManager';
import UpgradeModal from '../../components/common/UpgradeModal';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const { t } = useTranslation();
  const { isGuest } = useAuth();

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentById(id);
        
        const doc = data?.document || data?.data || data;
        setDocument(doc);
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error(t('documents.errorFetchDetail') || 'Failed to load document');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentDetails();
  }, [id, navigate, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {t('documents.notFound') || 'Document not found'}
        </h2>
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('documents.backToList')}
        </Link>
      </div>
    );
  }
  const getPdfUrl = () => {
    if (!document?.filePath) return null;

    const filePath = document.filePath;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const renderContent = () => {
    const pdfUrl = getPdfUrl();

    return (
      <div className="space-y-6">
        {/* PDF Viewer */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
            <h3 className="font-semibold text-slate-900">{document.title}</h3>
          </div>
          <div className="aspect-[3/4] bg-slate-100">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title={document.title}
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>PDF preview not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Uploaded</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">File Size</p>
            <p className="text-sm font-semibold text-slate-900">
              {(document.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <p className="text-sm font-semibold text-slate-900 capitalize">
              {document.status}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Pages</p>
            <p className="text-sm font-semibold text-slate-900">
              {document.chunks?.length || 0}
            </p>
          </div>
        </div>

        {/* Guest Warning */}
        {isGuest && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('documents.guestViewHint') || 'You are viewing this document as a guest.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderChat = () => <ChatInterface documentId={id} isGuest={isGuest} />;
  const renderAIActions = () => <AIActions documentId={id} isGuest={isGuest} />;

  const renderFlashcardsTab = () => {
    if (isGuest) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('documents.flashcardsLockedTitle') || 'Premium Feature'}
          </h3>
          <p className="text-slate-600 mb-4">
            {t('documents.flashcardsLockedDesc') || 'Register to create flashcards'}
          </p>
          <button
            onClick={() => {
              setUpgradeFeature('flashcards');
              setShowUpgradeModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Lock className="w-4 h-4" />
            {t('documents.unlockFeature') || 'Unlock'}
          </button>
        </div>
      );
    }
    return <FlashcardManager documentId={id} />;
  };

  const renderQuizzesTab = () => {
    if (isGuest) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('documents.quizzesLockedTitle') || 'Premium Feature'}
          </h3>
          <p className="text-slate-600 mb-4">
            {t('documents.quizzesLockedDesc') || 'Register to create quizzes'}
          </p>
          <button
            onClick={() => {
              setUpgradeFeature('quizzes');
              setShowUpgradeModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Lock className="w-4 h-4" />
            {t('documents.unlockFeature') || 'Unlock'}
          </button>
        </div>
      );
    }
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: 'content', label: t('documents.tabContent') || 'Content', content: renderContent() },
    { name: 'chat', label: t('documents.tabChat') || 'Chat', content: renderChat() },
    { name: 'aiActions', label: t('documents.tabAIActions') || 'AI Actions', content: renderAIActions() },
  ];

  if (!isGuest) {
    tabs.push(
      { name: 'flashcards', label: t('documents.tabFlashcards') || 'Flashcards', content: renderFlashcardsTab() },
      { name: 'quizzes', label: t('documents.tabQuizzes') || 'Quizzes', content: renderQuizzesTab() }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Main container */}
      <div className="page-container">
        
        {/* Back button + language toggle */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('documents.backToList')}
          </Link>
          
          <LanguageToggle />
        </div>
        
        <PageHeader title={document?.title || 'Document Details'} className="mb-6">
          {isGuest && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
              <Zap className="w-3 h-3" />
              Guest
            </span>
          )}
        </PageHeader>
        
        {/* Guest Expiry Banner */}
        {isGuest && document.expiresAt && (
          <div className="section-spacing p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              {t('documents.guestExpiryDesc', { 
                expiresAt: new Date(document.expiresAt).toLocaleString() 
              }) || 'This document will expire.'}
            </p>
          </div>
        )}
        
        {/* Tabs Content */}
        <div className="mt-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* UpgradeModal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeFeature}
      />
      
    </div>
  );
};

export default DocumentDetailPage;