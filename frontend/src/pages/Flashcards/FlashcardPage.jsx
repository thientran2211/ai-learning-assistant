import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import flashcardService from '../../services/flashcardService';
import aiService from '../../services/aiService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Flashcard from '../../components/flashcards/Flashcard';

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { t } = useTranslation();

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error(t('flashcards.errorFetch'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success(t('flashcards.successGenerate'));
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || t('flashcards.errorGenerate'));
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success(t('flashcards.successReview'));
    } catch (error) {
      toast.error(t('flashcards.errorReview'));
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success(t('flashcards.successStar'));
    } catch (error) {
      toast.error(t('flashcards.errorStar'));
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success(t('flashcards.successDelete'));
      setIsDeleteModalOpen(false);
      fetchFlashcards(); // refetch to show empty state
    } catch (error) {
      toast.error(error.message || t('flashcards.errorDelete'));
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title={t('flashcards.noFlashcards')}
          description={t('flashcards.emptyStateDesc')}
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} /> {t('common.previous')}
          </Button>
          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            variant='secondary'
            disabled={flashcards.length <= 1}
          >
            {t('common.next')} <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('flashcards.backToDocument')}
        </Link>
      </div>
      <PageHeader title={t('flashcards.title')}>
        <div className="flex gap-2">
            {!loading && (flashcards.length > 0 ? (
              <>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 size={16} /> {t('flashcards.btnDeleteSet')}
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateFlashcards} disabled={generating}>
                {generating ? (
                  <Spinner />
                ) : (
                  <>
                    <Plus size={16} /> {t('flashcards.btnGenerate')}
                  </>
                )}
              </Button>
            ))}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('flashcards.modalDeleteTitlePage')}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            {t('flashcards.modalDeleteDescPage')}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type='button'
              variant='secondary'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
            >
              {deleting ? t('flashcards.deleting') : t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardPage;