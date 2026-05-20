import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import { findRelevantChunks } from '../utils/textChunker.js';
import { executeWithFallback } from '../utils/aiOrchestrator.js';


// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10, language = 'en' } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });
    }

    const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or not ready', statusCode: 404 });
    }

    const cards = await executeWithFallback(
      'flashcards',
      'generateFlashcards',
      document.extractedText,
      parseInt(count),
      language
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false
      }))
    });

    res.status(201).json({ success: true, data: flashcardSet, message: 'Flashcards generated successfully' });
  } catch (error) {
    next(error);
  }
};


// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title, language = 'en', barrettLevel = 'all' } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });
    }

    const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or not ready', statusCode: 404 });
    }

    const questions = await executeWithFallback(
      'quiz',
      'generateQuiz',
      document.extractedText,
      parseInt(numQuestions),
      language,
      barrettLevel
    );

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
      levelScores: {
        literal: 0,
        inferential: 0,
        evaluative: 0
      }
    });

    res.status(201).json({ 
      success: true, 
      data: quiz, 
      message: 'Quiz generated successfully',
      barrettLevel: barrettLevel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate document summary
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId, language = 'en' } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });
    }

    const userId = req.user?._id;
    const guestSessionId = !req.user ? req.headers['x-guest-session'] : null;

    const documentQuery = { _id: documentId, status: 'ready' };
    if (userId) {
      documentQuery.userId = userId;
    } else if (guestSessionId) {
      documentQuery.userId = null;
      documentQuery.guestSessionId = guestSessionId;
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required', 
        statusCode: 401 
      });
    }

    const document = await Document.findOne(documentQuery);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or not ready', statusCode: 404 });
    }

    const summary = await executeWithFallback(
      'summary',
      'generateSummary',
      document.extractedText,
      null,
      language
    );

    res.status(200).json({
      success: true,
      data: { 
        summary,
        isGuest: !userId 
      },
      message: 'Summary generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with document
// @route   POST /api/ai/chat
// @access  Public
export const chat = async (req, res, next) => {
  try {
    const { documentId, question, language = 'en' } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ success: false, error: 'Please provide documentId and question', statusCode: 400 });
    }

    const userId = req.user?._id;
    const guestSessionId = !req.user ? req.headers['x-guest-session'] : null;

    const documentQuery = { _id: documentId, status: 'ready' };
    if (userId) {
      documentQuery.userId = userId;
    } else if (guestSessionId) {
      documentQuery.userId = null;
      documentQuery.guestSessionId = guestSessionId;
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401
      });
    }

    const document = await Document.findOne(documentQuery);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found or not ready', 
        statusCode: 404 
      });
    }

    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunkIndices = relevantChunks.map(c => c.chunkIndex);

    if (userId) {
      let chatHistory = await ChatHistory.findOne({
        userId: userId,
        documentId: document._id
      });
      if (!chatHistory) {
        chatHistory = await ChatHistory.create({
          userId: userId,
          documentId: document._id,
          messages: []
        });
      }

      chatHistory.messages.push(
        { role: 'user', content: question, timestamp: new Date(), relevantChunks: [] },
        { role: 'assistant', content: '...', timestamp: new Date(), relevantChunks: chunkIndices }
      );
      await chatHistory.save();
    }

    const answer = await executeWithFallback(
      'chat',
      'chatWithContext',
      question,
      relevantChunks,
      language
    );

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: userId ? chatHistory?._id : null,
        isGuest: !userId
      },
      message: 'Response generated successfully'
    });
  } catch (error) {
    console.error('Chat error:', error);
    next(error);
  }
};

// @desc    Explain concept from document
// @route   POST /api/ai/explain-concept
// @access  Public
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept, language = 'en' } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({ success: false, error: 'Please provide documentId and concept', statusCode: 400 });
    }

    const userId = req.user?._id;
    const guestSessionId = !req.user ? req.headers['x-guest-session'] : null;

    const documentQuery = { _id: documentId, status: 'ready' };
    if (userId) {
      documentQuery.userId = userId;
    } else if (guestSessionId) {
      documentQuery.userId = null;
      documentQuery.guestSessionId = guestSessionId;
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401
      });
    }

    const document = await Document.findOne(documentQuery);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or not ready', statusCode: 404 });
    }

    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map(c => c.content).join('\n\n');

    const explanation = await executeWithFallback(
      'explain',
      'explainConcept',
      concept,
      context,
      language
    );

    res.status(200).json({
      success: true,
      data: { 
        concept, 
        explanation, 
        relevantChunks: relevantChunks.map(c => c.chunkIndex),
        isGuest: !userId
      },  
      message: 'Explanation generated successfully'
    });
  } catch (error) {
    console.error('Explain concept error:', error);
    next(error);
  }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId',
        statusCode: 400
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: documentId
    }).select('messages');

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],  // return an empty array if no chat history found
        message: 'No chat history found for this document'
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: 'Chat history retrieved successfully'
    });
  } catch (error) {
    next(error)
  }
};