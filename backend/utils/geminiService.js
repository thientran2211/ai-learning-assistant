import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit();
}

/**
 * Helper function to get language instruction
 * @param {string} language - 'en' or 'vi'
 * @returns {string} Language instruction for prompt
 */
const getLanguageInstruction = (language = 'en') => {
  return language === 'vi'
    ? '\n\nIMPORTANT: Respond entirely in Vietnamese. Use clear, natural Vietnamese language that is easy to understand.'
    : '\n\nIMPORTANT: Respond entirely in English. Use clear, natural English.';
};

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @param {string} language - 'en' or 'vi'
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 5, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);

  const prompt = `Generate exactly ${count} educational flashcards from the following text.${languageInstruction}

  Format each flashcard as:
  Q: [Clear, specific question]
  A: [Concise, accurate answer]
  D: [Difficulty level: easy, medium, or hard]
  
  Separate each flashcard with "---"
  
  Text:
  ${text.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    // Parse the response
    const flashcards = [];
    const cards = generatedText.split('---').filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split('\n');
      let question = '', answer = '', difficulty = 'medium';

      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim();
        } else if (line.startsWith('A:')) {
          answer = line.substring(2).trim();
        } else if (line.startsWith('D:')) {
          const diff = line.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz question
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @param {string} language - 'en' or 'vi'
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5, language = 'en', barrettLevel = 'all') => {
  const languageInstruction = getLanguageInstruction(language);

  const barrettLevels = {
    literal: 'LITERAL: Questions where the answer is directly stated in the text (fact recall)',
    inferential: 'INFERENTIAL: Questions requiring reading between the lines (implications, cause-effect, predictions)',
    evaluative: 'EVALUATIVE: Questions requiring judgment (assessing bias, logic quality, evidence strength)'
  };

  const levelInstruction = barrettLevel !== 'all' 
    ? `Focus ONLY on ${barrettLevel.toUpperCase()} level questions.\n${barrettLevels[barrettLevel]}`
    : `Generate a mix of questions across different Barrett levels:\n- ${Object.values(barrettLevels).join('\n- ')}`;

  const prompt = `Generate exactly ${numQuestions} multiple choice questions based on Barrett's Taxonomy.${languageInstruction}

  ${levelInstruction}

  IMPORTANT FORMAT RULES:
  - For "C:" (Correct Answer): You MUST copy the EXACT FULL TEXT of the correct option, NOT the index/number.
    CORRECT: C: ReactJS là một JavaScript framework
    WRONG: C: 01 or C: A
    
  - For options: Use format "O1: text", "O2: text", etc.

  Format each question as:
  Q: [Question text]
  O1: [First option - full text]
  O2: [Second option - full text]
  O3: [Third option - full text]
  O4: [Fourth option - full text]
  C: [CORRECT ANSWER - MUST BE THE EXACT FULL TEXT FROM O1/O2/O3/O4 ABOVE]
  E: [Brief explanation]
  D: [easy|medium|hard]
  L: [literal|inferential|evaluative]

  Separate questions with "---"

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      generationConfig: {
        temperature: 0.3
      }
    });

    const generatedText = response.text;

    const questions = [];
    const questionBlocks = generatedText.split('---').filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium', barrettLevel = 'literal';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Q:')) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith('C:')) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('E:')) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('D:')) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        } else if (trimmed.startsWith('L:')) {
          const level = trimmed.substring(2).trim().toLowerCase();
          if (['literal', 'inferential', 'evaluative'].includes(level)) {
            barrettLevel = level;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({ 
          question, 
          options, 
          correctAnswer, 
          explanation, 
          difficulty,
          barrettLevel 
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Gemini API error:', {
      message: error.message,
      status: error.status || error.response?.status,
      code: error.code
    });
    
    const enhancedError = new Error('Failed to generate quiz');
    enhancedError.originalError = error;
    enhancedError.status = error.status || error.response?.status || error.error?.code;
    enhancedError.message = error.message || error.error?.message || 'Gemini API error';
    
    throw enhancedError;
  }
};

/**
 * Generate document summary
 * @param {string} text - document text
 * @param {string} language - 'en' or 'vi'
 * @returns {Promise<string>}
 */
export const generateSummary = async (text, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);

  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points. Keep the summary clear and structured.${languageInstruction}
  
  Text:
  ${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @param {string} language - 'en' or 'vi'
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks, language = 'en') => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');
  const languageInstruction = getLanguageInstruction(language);

  const prompt = `Based on the following context from a document, analyze the context and answer the user's question. If the answer is not in the context, say so.${languageInstruction}
  
  Context:
  ${context}
  
  Question: ${question}
  
  Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - concept to explain
 * @param {string} context - relevant context
 * @param {string} language - 'en' or 'vi'
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);

  const prompt = `Explain the concept of "${concept}" based on the following context. 
  Provide a clear, educational explanation that's easy to understand. Include examples if relevant.${languageInstruction}
  
  Context:
  ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};