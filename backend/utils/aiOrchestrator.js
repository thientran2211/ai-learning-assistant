import * as geminiService from './geminiService.js';
import * as groqService from './groqService.js';

/**
 * AI Orchestrator: Intelligent model selection based on task type
 * 
 * Strategy:
 * - Chat/Explain: Groq (tốc độ cao, latency thấp)
 * - Summary/Flashcard/Quiz: Gemini (context window lớn, xử lý PDF dài tốt)
 * - Fallback: Nếu model chính lỗi sử dụng model dự phòng
 */

export const AI_MODELS = {
    GEMINI: 'gemini',
    GROQ: 'groq'
};

// Cấu hình cho từng loại tác vụ
export const TASK_CONFIG = {
    chat: {
        primary: AI_MODELS.GROQ,
        fallback: AI_MODELS.GEMINI,
        reason: 'Chat cần tốc độ phản hồi nhanh'
    },
    explain: {
        primary: AI_MODELS.GROQ,
        fallback: AI_MODELS.GEMINI,
        reason: 'Explain cần phải hồi nhanh, context thường ngắn'
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
        primary: AI_MODELS.GEMINI,
        fallback: AI_MODELS.GROQ,
        reason: 'Quiz cần chất lượng câu hỏi chính xác cao'
    }
};

/**
 * Lấy service module theo tên model
 */
const getService = (modelName) => {
  if (modelName === AI_MODELS.GROQ) return groqService;
  return geminiService; // Default to Gemini
};

/**
 * Kiểm tra lỗi có nên retry/fallback không
 */
const isRetryableError = (error) => {
  const status = error?.status || error?.response?.status;
  const message = error?.message?.toLowerCase() || '';
  
  return (
    status === 503 || // Service unavailable
    status === 429 || // Rate limit
    status === 529 || // Server overloaded
    message.includes('timeout') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable')
  );
};

/**
 * Hàm điều phối chính: Execute với automatic fallback
 * @param {string} taskType - 'chat' | 'explain' | 'summary' | 'flashcards' | 'quiz'
 * @param {string} functionName - Tên hàm cần gọi trong service
 * @param  {...any} args - Các tham số truyền vào hàm
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
        return await primaryService[functionName](...args);
    } catch (primaryError) {
        console.warn(`[Orchestrator] ${config.primary.toUpperCase()} failed for ${taskType}:`, primaryError.message);

        // Chỉ fallback nếu là lỗi tạm thời
        if (isRetryableError(primaryError)) {
            console.log(`🔄 [Orchestrator] Falling back to ${config.fallback.toUpperCase()}...`);
            try {
                const result = await fallbackService[functionName](...args);
                console.log(`✅ [Orchestrator] Fallback to ${config.fallback.toUpperCase()} succeeded`);
                return result;
            } catch (fallbackError) {
                console.error(`❌ [Orchestrator] Both ${config.primary} and ${config.fallback} failed for ${taskType}`);
                throw new Error(`AI service temporarily unavailable. Please try again later.`);
            }
        }

        // Lỗi không retryable (auth, invalid input...) thì throw luôn
        console.error(`❌ [Orchestrator] Non-retryable error in ${config.primary.toUpperCase()}:`, primaryError.message);
        throw primaryError;                                                                         
    }
};