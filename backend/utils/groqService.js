import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

if (!process.env.GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY is not set. Groq service will not work.');
}

/**
 * Helper: get language instruction for prompts
 */
const getLanguageInstruction = (language = 'en') => {
    return language === 'vi'
        ? '\n\nQUAN TRỌNG: Trả lời hoàn toàn bằng tiếng việt. Dùng ngôn ngữ tự nhiên, dễ hiểu, phù hợp với người học.'
        : '\n\nIMPORTANT: Respond entirely in English. Use clear, natural, educational language.';
};

/**
 * Generate flashcards using Groq/Llama 3
 */
export const generateFlashcards = async (text, count = 5, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);

  const prompt =`Generate exactly ${count} educational flashcards from the following text.${languageInstruction}
  
  Format each flashcard as:
  Q: [Clear, specific question]
  A: [Concise, accurate answer]
  D: [Difficulty level: easy, medium, or hard]
  
  Separate each flashcard with "---"
  
  Text:
  ${text.substring(0, 8000)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Generate high-quality flashcards."
          },
          {
            role: "user",
            content: prompt
          }
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const generatedText = completion.choices[0]?.message?.content || "";

    // Parse response
    const flashcards = [];
    const cards = generatedText.split('---').filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split('\n');
      let question = '', answer = '', difficulty = 'medium';

      for (const line of lines) {
        if (line.startsWith('Q:')) question = line.substring(2).trim();
        else if (line.startsWith('A:')) answer = line.substring(2).trim();
        else if (line.startsWith('D:')) {
          const diff = line.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate flashcards via Groq');
  }
};

/**
 * Generate quiz using Groq/Llama 3
 */
export const generateQuiz = async (text, numQuestions = 5, language = 'en', barrettLevel = 'all') => {
  const languageInstruction = getLanguageInstruction(language);

  const barrettLevels = {
    literal: 'LITERAL: Answer directly stated in text',
    inferential: 'INFERENTIAL: Requires reading between lines',
    evaluative: 'EVALUATIVE: Requires judgment/assessment'
  };

  const levelInstruction = barrettLevel !== 'all'
    ? `Focus ONLY on ${barrettLevel.toUpperCase()} questions. ${barrettLevels[barrettLevel]}`
    : `Generate mix of levels: ${Object.values(barrettLevels).join(' | ')}`;

  const prompt = `Generate exactly ${numQuestions} multiple choice questions based on Barrett's Taxonomy.${languageInstruction}

  ${levelInstruction}

  IMPORTANT: For "C:" field, copy the EXACT FULL TEXT of the correct option, NOT index/number.
  CORRECT: C: ReactJS là framework JavaScript
  WRONG: C: 01 or C: A

  Format:
  Q: [Question]
  O1-O4: [Options with full text]
  C: [CORRECT ANSWER - EXACT FULL TEXT from options above]
  E: [Explanation]
  D: [easy|medium|hard]
  L: [literal|inferential|evaluative]

  Separate with "---"

  Text: ${text.substring(0, 8000)}`;  

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert quiz creator. Output structured questions with FULL TEXT answers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const generatedText = completion.choices[0]?.message?.content || "";
    const questions = [];
    const questionBlocks = generatedText.split('---').filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium', qBarrettLevel = 'literal';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Q:')) question = trimmed.substring(2).trim();
        else if (trimmed.match(/^O\d:/)) options.push(trimmed.substring(3).trim());
        else if (trimmed.startsWith('C:')) correctAnswer = trimmed.substring(2).trim();
        else if (trimmed.startsWith('E:')) explanation = trimmed.substring(2).trim();
        else if (trimmed.startsWith('D:')) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
        }
        else if (trimmed.startsWith('L:')) {
          const level = trimmed.substring(2).trim().toLowerCase();
          if (['literal', 'inferential', 'evaluative'].includes(level)) qBarrettLevel = level;
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation, difficulty, barrettLevel: qBarrettLevel });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Groq API error:', error);
    const enhancedError = new Error('Failed to generate quiz via Groq');
    enhancedError.originalError = error;
    enhancedError.status = error.status || error.response?.status;
    throw enhancedError;
  }
};

/**
 * Chat with context using Groq (tốc độ cao)
 */
export const chatWithContext = async (question, chunks, language = 'en') => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');
  const languageInstruction = getLanguageInstruction(language);

  const prompt = `Based on the following context from a document, analyze and answer the user's question. If the answer is not in the context, say so clearly.${languageInstruction}

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful educational assistant. ${languageInstruction} Answer based ONLY on the provided context. Be concise and accurate.` 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to process chat request via Groq');
  }
};

/**
 * Explain concept using Groq
 */
export const explainConcept = async (concept, context, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);
  
  const prompt = `Explain the concept of "${concept}" based on the following context. 
Provide a clear, educational explanation that's easy to understand. Include examples if relevant.${languageInstruction}

Context:
${context.substring(0, 6000)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert teacher. Explain concepts clearly with examples." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't explain this concept.";
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to explain concept via Groq');
  }
};

/**
 * Generate summary using Groq 
 */
export const generateSummary = async (text, language = 'en') => {
  const languageInstruction = getLanguageInstruction(language);
  
  const prompt = `Provide a concise, well-structured summary of the following text, highlighting key concepts and main ideas.${languageInstruction}

Text:
${text.substring(0, 10000)}`; // Groq context limit

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert summarizer. Create clear, structured summaries." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a summary.";
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to generate summary via Groq');
  }
};