import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Difficulty, GeneratedQuestion, FeedbackResponse, InterviewConfig } from '../types';
import { GEMINI_MODEL_TEXT, QUESTION_BATCH_SIZE } from "../constants"; // QUESTION_BATCH_SIZE used as default
import { getMockQuestions } from './mockData';
import { generateUUID } from '../utils';

const apiKey = import.meta.env.VITE_API_KEY || "";

if (!apiKey || apiKey === "your_gemini_api_key_here") {
  // This message is for the developer console, not for the user.
  console.error("VITE_API_KEY is not set or is still using the placeholder value. Please ensure the VITE_API_KEY environment variable is configured with your actual Gemini API key.");
  // Potentially throw an error or use a mock service for local development if desired
  // For this exercise, we'll let it proceed and Gemini client will fail if key is truly missing/invalid
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_PLACEHOLDER" });

const parseJsonFromText = <T,>(text: string, context?: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error(`Failed to parse JSON response${context ? ` for ${context}` : ''}:`, e);
    console.error("Raw response text for parsing:", text);
    // Instead of returning null, which can hide issues, let's throw an error
    // specific to parsing, so the caller can handle it more appropriately.
    throw new Error(`AI_PARSING_ERROR: Response from AI was not valid JSON. ${context || ''}`);
  }
};

export const generateQuestionsFromAPI = async (batchSize: number, difficulty: Difficulty, topic: string): Promise<GeneratedQuestion[]> => {
  // Для темы Java используем предзагруженные вопросы для быстрого тестирования
  if (topic.toLowerCase().includes('java')) {
    console.log('Используем предзагруженные вопросы для Java');
    return getMockQuestions(difficulty, batchSize);
  }

  const difficultyRussian = {
    [Difficulty.JUNIOR]: 'Junior (начальный)',
    [Difficulty.MIDDLE]: 'Middle (средний)',
    [Difficulty.SENIOR]: 'Senior (продвинутый)',
  };

  const prompt = `
Сгенерируй ${batchSize} УНИКАЛЬНЫХ вопросов для собеседования по теме "${topic}" уровня "${difficultyRussian[difficulty]}".
Каждый вопрос должен быть осмысленным и релевантным теме и уровню сложности.
Избегай повторения вопросов, которые могли быть сгенерированы в предыдущих запросах на эту же тему.

Для каждого вопроса предоставь:
1. Текст вопроса на русском языке (ключ "question").
2. Краткий и правильный эталонный ответ на вопрос на русском языке (ключ "answer"). Ответ должен быть достаточным для проверки понимания, но не излишне детальным.

Верни ответ СТРОГО в виде JSON-массива объектов. Каждый объект должен содержать только ключи "question" и "answer".

Пример одного объекта в массиве:
{
  "question": "Что такое JVM и зачем она нужна?",
  "answer": "JVM (Java Virtual Machine) - это виртуальная машина, которая исполняет байт-код Java. Она обеспечивает платформенную независимость Java-приложений, позволяя скомпилированному Java-коду работать на любой системе, где установлена JVM."
}
Убедись, что весь ответ является валидным JSON массивом. Не добавляй никакого текста до или после JSON массива.
Если по какой-то причине не можешь сгенерировать ${batchSize} вопросов (например, тема слишком узкая для такого количества на данном уровне сложности), сгенерируй столько, сколько можешь, но не менее одного, если это возможно.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75, // Slightly higher for more variety
        topP: 0.95,
        topK: 40,
      }
    });
    
    const parsedData = parseJsonFromText<GeneratedQuestion[]>(response.text || '', 'generateQuestions');

    if (!parsedData || !Array.isArray(parsedData) ) {
      console.error("Получены некорректные данные от API при генерации вопросов (не массив):", parsedData);
      throw new Error("Не удалось получить корректный список вопросов от AI. Формат ответа не является массивом.");
    }
     if (parsedData.some(item => typeof item.question !== 'string' || typeof item.answer !== 'string')) {
      console.error("Получены некорректные данные от API (неверная структура объекта):", parsedData);
      throw new Error("Не удалось получить корректный список вопросов от AI. Структура объектов в массиве неверна.");
    }
    return parsedData;
  } catch (error) {
    console.error("Ошибка при генерации вопросов:", error);
    // Provide a more user-friendly error or re-throw a custom error
    if (error instanceof Error && error.message.startsWith('AI_PARSING_ERROR')) {
        throw new Error(`Проблема с ответом от AI: не удалось обработать полученные данные для вопросов. Попробуйте еще раз.`);
    }
    const errorMessage = error instanceof Error ? error.message : "Произошла неизвестная ошибка при запросе к AI.";
    throw new Error(`Не удалось сгенерировать вопросы: ${errorMessage}`);
  }
};

export const evaluateAnswerWithAPI = async (questionText: string, correctAnswer: string, userAnswer: string, topic: string): Promise<FeedbackResponse> => {
  const prompt = `
Выступи в роли опытного интервьюера и эксперта в области "${topic}".
Тебе предоставлен вопрос, эталонный ответ (для твоего сведения) и ответ кандидата.
Твоя задача - оценить ответ кандидата на русском языке и предоставить два вида обратной связи: краткую и подробную.

Вопрос:
"${questionText}"

Эталонный ответ (для твоего сведения, не показывай его кандидату в фидбеке, но используй для оценки полноты и правильности ответа кандидата):
"${correctAnswer}"

Ответ кандидата:
"${userAnswer}"

Верни ответ СТРОГО в формате JSON объекта со следующими ключами: "shortFeedback" и "detailedFeedback".

1.  "shortFeedback":
    *   Очень краткое резюме оценки ответа кандидата (1-2 предложения, не более 30-40 слов). Например: "Отличный ответ, все ключевые моменты раскрыты!" или "В целом неплохо, но не хватает упоминания о XYZ." или "Ответ неполный, упущены важные аспекты."
    *   Этот текст должен быть простым текстом без markdown.

2.  "detailedFeedback":
    *   Подробный разбор ответа кандидата на русском языке.
    *   Укажи, что было сказано правильно и полно.
    *   Объясни, чего не хватило в ответе или какие важные моменты были упущены. Сравни с эталонным ответом.
    *   Если есть неверные утверждения, тактично укажи на них и объясни, почему они неверны.
    *   Дай конкретные рекомендации, как можно улучшить ответ или что стоит изучить дополнительно.
    *   Если приводишь примеры кода, ИСПОЛЬЗУЙ МАРКДАУН для блоков кода с указанием языка (например, \`\`\`java ...код... \`\`\`).
    *   Используй markdown для другого форматирования (списки, выделение), если это улучшит читаемость.

Пример JSON ответа (для темы Java):
{
  "shortFeedback": "Хороший ответ, но можно было бы подробнее рассказать о сборке мусора.",
  "detailedFeedback": "Вы правильно указали основные принципы ООП. Однако, когда говорили о полиморфизме, было бы здорово привести пример.\\n\\nНапример, классический случай с фигурами:\\n\\n\`\`\`java\\nabstract class Shape {\\n    abstract void draw();\\n}\\n\\nclass Circle extends Shape {\\n    @Override\\n    void draw() {\\n        System.out.println(\\"Drawing a circle\\");\\n    }\\n}\\n\\nclass Square extends Shape {\\n    @Override\\n    void draw() {\\n        System.out.println(\\"Drawing a square\\");\\n    }\\n}\\n\`\`\`\\n\\nТакже, вы упомянули сборщик мусора, но не детализировали его работу. Рекомендую почитать про поколения объектов и различные алгоритмы GC."
}

Отвечай только на русском языке. Убедись, что весь ответ является валидным JSON объектом с указанными ключами.
Будь конструктивным, дружелюбным и поддерживающим. Цель - помочь кандидату улучшить свои знания.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, 
      }
    });
    
    const parsedData = parseJsonFromText<FeedbackResponse>(response.text || '', 'evaluateAnswer');

    if (!parsedData || typeof parsedData.shortFeedback !== 'string' || typeof parsedData.detailedFeedback !== 'string') {
        console.error("Получены некорректные данные от API при оценке ответа (неверная структура):", parsedData);
        throw new Error("Не удалось получить корректную обратную связь от AI. Формат ответа не соответствует ожидаемому (shortFeedback и detailedFeedback должны быть строками).");
    }
    return parsedData;

  } catch (error) {
    console.error("Ошибка при оценке ответа:", error);
     if (error instanceof Error && error.message.startsWith('AI_PARSING_ERROR')) {
        throw new Error(`Проблема с ответом от AI: не удалось обработать полученные данные для обратной связи. Попробуйте еще раз.`);
    }
    const errorMessage = error instanceof Error ? error.message : "Произошла неизвестная ошибка при запросе к AI.";
    throw new Error(`Не удалось оценить ответ: ${errorMessage}`);
  }
};

export const generateQuestions = async (config: InterviewConfig): Promise<any[]> => {
  const generatedQuestions = await generateQuestionsFromAPI(QUESTION_BATCH_SIZE, config.difficulty, config.topic);
  
  return generatedQuestions.map(q => ({
    id: generateUUID(),
    questionText: q.question,
    correctAnswer: q.answer,
    topic: config.topic,
    userAnswer: '',
    shortFeedback: null,
    detailedFeedback: null,
    isCorrectAnswerVisible: false,
    isDetailedFeedbackVisible: false,
    isCheckingAnswer: false,
    timestamp: Date.now()
  }));
};