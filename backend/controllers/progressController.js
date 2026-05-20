import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter(c => c.isStarred).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });

    const averageScore = quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length) : 0;

    // Calculate reading profile by Barrett Level
    const readingProfile = {
      literal: { total: 0, correct: 0, count: 0 },
      inferential: { total: 0, correct: 0, count: 0 },
      evaluative: { total: 0, correct: 0, count: 0 }
    };

    quizzes.forEach(quiz => {
      // Case 1: Quiz has levelScores (new format from our update)
      if (quiz.levelScores) {
        Object.keys(readingProfile).forEach(level => {
          if (quiz.levelScores[level] !== undefined) {
            readingProfile[level].count += 1;
            readingProfile[level].total += 100;
            readingProfile[level].correct += quiz.levelScores[level];
          }
        });
      }
      // Case 2: Fallback - calculate from questions (old format or no levelScores)
      else if (quiz.questions?.length && quiz.userAnswers?.length) {
        quiz.questions.forEach((question, qIndex) => {
          const level = question.barrettLevel || 'literal';
          const userAnswer = quiz.userAnswers.find(a => a.questionIndex === qIndex);
          
          if (userAnswer) {
            readingProfile[level].total += 1;
            if (userAnswer.isCorrect) readingProfile[level].correct += 1;
          }
        });
      }
    });

    // Convert to percentages
    const levelPercentages = {};
    Object.keys(readingProfile).forEach(level => {
      const { correct, total } = readingProfile[level];
      levelPercentages[level] = total > 0 ? Math.round((correct / total) * 100) : null;
    });

    // Find weakest level for recommendation
    const validLevels = Object.entries(levelPercentages).filter(([_, val]) => val !== null);
    const weakestLevel = validLevels.length > 0 
      ? validLevels.sort((a, b) => a[1] - b[1])[0][0] 
      : null;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select('title fileName lastAccessed status ');

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt');

    // Study streak (simplified - in production, track daily activity)
    const studyStreak = Math.floor(Math.random() * 7) + 1;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak
        },
        readingProfile: {
          scores: levelPercentages,
          weakestLevel,
          details: readingProfile
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};