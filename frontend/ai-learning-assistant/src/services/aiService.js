import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

const getLanguage = () => {
  return localStorage.getItem('preferredLanguage') ||
          navigator.language?.split('-')[0] ||
          'en';
};

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { 
      documentId, 
      ...options,
      language: getLanguage()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate flashcards' };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { 
      documentId, 
      ...options,
      language: getLanguage()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate quiz' };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { 
      documentId,
      language: getLanguage()
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate summary' };
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, { 
      documentId, 
      question: message,
      language: getLanguage()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Chat request failed' };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { 
      documentId,
      concept,
      language: getLanguage()
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to explain concept' };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch chat history' };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;