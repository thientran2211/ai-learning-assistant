import * as geminiService from './geminiService.js';
import * as groqService from './groqService.js';

/**
 * AI Orchestrator: Intelligent model selection based on task type
 */

export const AI_MODELS = {
    GEMINI: 'gemini',
    GROQ: 'groq'
};

export const TASK_CONFIG = {
    chat: {
        primary: AI_MODELS.GROQ,
        fallback: AI_MODELS.GEMINI,
        reason: 'Chat cần tốc độ phản hồi nhanh'
    },
    explain: {
        primary: AI_MODELS.GROQ,
        fallback: AI_MODELS.GEMINI,
        reason: 'Explain cần phản hồi nhanh, context thường ngắn'
    },
    summary: {
        primary: AI_MODELS.GEMINI,
        fallback: AI_MODELS.GROQ,
        reason: 'Summary cần context window lớn để xử lý PDF dài'
    },
    flashcards: {
        primary: AI_MODELS.GEMINI,
        fallback: AI_MODELS.GROQ,
        reason: 'Flashcards cần hiểu sâu ngữ nghĩa tài liệu'
    },
    quiz: {
        primary: AI_MODELS.GROQ,
        fallback: AI_MODELS.GEMINI,
        // reason: 'Quiz cần chất lượng câu hỏi chính xác cao'
        reason: 'Groq ổn định hơn cho quiz generation'
    }
};

const getService = (modelName) => {
  if (modelName === AI_MODELS.GROQ) return groqService;
  return geminiService;
};

const isRetryableError = (error) => {
  const { status, message, code } = extractErrorDetails(error);
  
  const isQuotaExceeded = 
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    message.includes('quota exceeded') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('please retry in');
  
  // Check for service unavailable
  const isUnavailable = 
    status === 503 ||
    status === 'UNAVAILABLE' ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable');
  
  // Check for network errors
  const isNetworkError = 
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    message.includes('timeout') ||
    message.includes('fetch failed');
  
  return isQuotaExceeded || isUnavailable || isNetworkError;
};

/**
 * Main orchestration function with automatic fallback
 */
export const executeWithFallback = async (taskType, functionName, ...args) => {
    const config = TASK_CONFIG[taskType];

    if (!config) {
        console.warn(`Unknown task type: ${taskType}, defaulting to Gemini`);
        return await geminiService[functionName](...args);
    }

    const primaryService = getService(config.primary);
    const fallbackService = getService(config.fallback);

    try {
        console.log(`[Orchestrator] ${taskType}: Using ${config.primary.toUpperCase()} (${config.reason})`);
        const result = await primaryService[functionName](...args);
        console.log(`[Orchestrator] ${config.primary.toUpperCase()} succeeded for ${taskType}`);
        return result;
    } catch (primaryError) {
        const { status, message, code } = extractErrorDetails(primaryError);
        
        console.warn(`[Orchestrator] ${config.primary.toUpperCase()} failed for ${taskType}:`, {
            status,
            message: message.substring(0, 150),
            code,
            shouldFallback: isRetryableError(primaryError)
        });

        // Only fallback if it's a retryable error
        if (isRetryableError(primaryError)) {
            console.log(`[Orchestrator] ⚡ Falling back to ${config.fallback.toUpperCase()}...`);
            try {
                const result = await fallbackService[functionName](...args);
                console.log(`[Orchestrator] Fallback to ${config.fallback.toUpperCase()} succeeded for ${taskType}`);
                return result;
            } catch (fallbackError) {
                const fallbackDetails = extractErrorDetails(fallbackError);
                console.error(`[Orchestrator] Both models failed for ${taskType}:`, {
                    primary: {
                        model: config.primary,
                        status,
                        message: message.substring(0, 100)
                    },
                    fallback: {
                        model: config.fallback,
                        status: fallbackDetails.status,
                        message: fallbackDetails.message.substring(0, 100)
                    }
                });
                
                // Return user-friendly error
                throw new Error(`AI service temporarily unavailable. Please try again later. (Gemini: ${status}, Groq: ${fallbackDetails.status})`);
            }
        }

        // Non-retryable error (auth, invalid input, etc.)
        console.error(`[Orchestrator] Non-retryable error in ${config.primary.toUpperCase()}:`, {
            status,
            message: message.substring(0, 150),
            code
        });
        throw primaryError;
    }
};