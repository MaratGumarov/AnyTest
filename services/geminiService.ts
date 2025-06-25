import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Difficulty, GeneratedQuestion, FeedbackResponse, InterviewConfig } from '../types';
import { GEMINI_MODEL_TEXT, QUESTION_BATCH_SIZE } from "../constants"; // QUESTION_BATCH_SIZE used as default
import { getMockQuestions } from './mockData';
import { generateUUID } from '../utils';
import i18n from '../src/i18n/index';

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

const getLanguagePrompts = (language: string) => {
  if (language === 'en') {
    return {
      difficultyMap: {
        [Difficulty.JUNIOR]: 'Junior (beginner)',
        [Difficulty.MIDDLE]: 'Middle (intermediate)',
        [Difficulty.SENIOR]: 'Senior (advanced)',
      },
      promptTemplate: (batchSize: number, topic: string, difficultyText: string) => `
Generate ${batchSize} UNIQUE interview questions for the topic "${topic}" at "${difficultyText}" level.
First, analyze the topic to understand its mood and context (e.g., is it for a serious technical interview, a fun quiz, a historical exam?).
Adjust the tone and style of the questions and answers accordingly. For humorous or informal topics, the questions should also be light-hearted and creative. For professional topics, maintain a formal, relevant tone.

Each question should be meaningful and relevant to the topic and difficulty level.
Avoid repeating questions that might have been generated in previous requests for the same topic.

For each question provide:
1. Question text in English (key "question").
2. Brief and correct reference answer to the question in English (key "answer"). The answer should be sufficient to check understanding, but not overly detailed.

Return the response STRICTLY as a JSON array of objects. Each object should contain only "question" and "answer" keys.

Example of one object in the array for a serious topic:
{
  "question": "What is JVM and why is it needed?",
  "answer": "JVM (Java Virtual Machine) is a virtual machine that executes Java bytecode. It provides platform independence for Java applications, allowing compiled Java code to run on any system where JVM is installed."
}
Make sure the entire response is a valid JSON array. Do not add any text before or after the JSON array.
If for some reason you cannot generate ${batchSize} questions (e.g., the topic is too narrow for that many at the given difficulty level), generate as many as you can, but at least one if possible.
`
    };
  } else {
    return {
      difficultyMap: {
        [Difficulty.JUNIOR]: 'Junior (начальный)',
        [Difficulty.MIDDLE]: 'Middle (средний)',
        [Difficulty.SENIOR]: 'Senior (продвинутый)',
      },
      promptTemplate: (batchSize: number, topic: string, difficultyText: string) => `
Сгенерируй ${batchSize} УНИКАЛЬНЫХ вопросов для собеседования по теме "${topic}" уровня "${difficultyText}".
Сначала проанализируй тему, чтобы понять ее настроение и контекст (например, для серьезного технического собеседования, веселой викторины или исторического экзамена).
Скорректируй тон и стиль вопросов и ответов соответствующим образом. Для юмористических или неформальных тем вопросы также должны быть беззаботными и креативными. Для профессиональных тем придерживайся формального, релевантного тона.

Каждый вопрос должен быть осмысленным и релевантным теме и уровню сложности.
Избегай повторения вопросов, которые могли быть сгенерированы в предыдущих запросах на эту же тему.

Для каждого вопроса предоставь:
1. Текст вопроса на русском языке (ключ "question").
2. Краткий и правильный эталонный ответ на вопрос на русском языке (ключ "answer"). Ответ должен быть достаточным для проверки понимания, но не излишне детальным.

Верни ответ СТРОГО в виде JSON-массива объектов. Каждый объект должен содержать только ключи "question" и "answer".

Пример одного объекта в массиве для серьезной темы:
{
  "question": "Что такое JVM и зачем она нужна?",
  "answer": "JVM (Java Virtual Machine) - это виртуальная машина, которая исполняет байт-код Java. Она обеспечивает платформенную независимость Java-приложений, позволяя скомпилированному Java-коду работать на любой системе, где установлена JVM."
}
Убедись, что весь ответ является валидным JSON массивом. Не добавляй никакого текста до или после JSON массива.
`
    };
  }
};

export const generateQuestionsFromAPI = async (batchSize: number, difficulty: Difficulty, topic: string): Promise<GeneratedQuestion[]> => {
  // For Java topic, use pre-loaded questions for quick testing
  if (topic.toLowerCase().includes('java')) {
    console.log('Using pre-loaded questions for Java');
    return getMockQuestions(difficulty, batchSize);
  }

  const currentLanguage = i18n.language || 'ru';
  const languagePrompts = getLanguagePrompts(currentLanguage);
  const difficultyText = languagePrompts.difficultyMap[difficulty];
  const prompt = languagePrompts.promptTemplate(batchSize, topic, difficultyText);

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

    if (!parsedData || !Array.isArray(parsedData)) {
      console.error("Invalid data received from API when generating questions (not an array):", parsedData);
      throw new Error("Failed to get a valid list of questions from AI. Response format is not an array.");
    }
    if (parsedData.some(item => typeof item.question !== 'string' || typeof item.answer !== 'string')) {
      console.error("Invalid data received from API (incorrect object structure):", parsedData);
      throw new Error("Failed to get a valid list of questions from AI. Object structure in array is incorrect.");
    }
    return parsedData;
  } catch (error) {
    console.error("Error generating questions:", error);
    if (error instanceof Error && error.message.startsWith('AI_PARSING_ERROR')) {
      throw new Error(`Problem with AI response: failed to process received data for questions. Please try again.`);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred when requesting AI.";
    throw new Error(`Failed to generate questions: ${errorMessage}`);
  }
};

export const getTopicSuggestion = async (query: string): Promise<string[]> => {
  if (!query) return [];

  const currentLanguage = i18n.language || 'ru';
  const prompt = currentLanguage === 'en'
    ? `You are a creative assistant. A user is typing a topic for a quiz or test. Your goal is to suggest a list of 3 to 5 engaging and relevant topics based on their input.
User input: "${query}"
Analyze the input to understand the theme and mood (e.g., "technical", "historical", "humorous").
Generate a list of 3-5 related topics that match this theme and mood.
Each suggested topic should be short and concise (max 3-4 words).
Return the response STRICTLY as a JSON array of strings. Do not add any text before or after the JSON array.
Example response for user input "Frontend": ["React vs Vue", "CSS Animations", "Web Accessibility", "Modern JS Frameworks"]`
    : `Ты — креативный ассистент. Пользователь вводит тему для викторины или теста. Твоя задача — предложить список из 3-5 интересных и релевантных тем на основе его ввода.
Ввод пользователя: "${query}"
Проанализируй ввод, чтобы понять тему и настроение (например, "техническое", "историческое", "юмористическое").
Сгенерируй список из 3-5 связанных тем, которые соответствуют этой теме и настроению.
Каждая предложенная тема должна быть короткой и лаконичной (максимум 3-4 слова).
Верни ответ СТРОГО в виде JSON-массива строк. Не добавляй никакого текста до или после JSON-массива.
Пример ответа для ввода "Frontend": ["React vs Vue", "CSS-анимации", "Веб-доступность", "Современные JS фреймворки"]`;
    
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, // Higher temperature for more creative suggestions
        maxOutputTokens: 200,
      }
    });
    
    const parsedData = parseJsonFromText<string[]>(response.text || '', 'getTopicSuggestion');
    
    if (!parsedData || !Array.isArray(parsedData)) {
        console.error("AI suggestion response is not a valid array:", parsedData);
        return [];
    }

    return parsedData.filter(item => typeof item === 'string');

  } catch (error) {
    console.error("Error getting topic suggestion:", error);
    return []; 
  }
};

const getFeedbackPrompts = (language: string) => {
  if (language === 'en') {
    return (questionText
    : string, correctAnswer: string, userAnswer: string, topic: string) => `
Act as an experienced interviewer and expert in the field of "${topic}".
You are provided with a question, reference answer (for your information) and candidate's answer.
Your task is to evaluate the candidate's answer in English and provide two types of feedback: brief and detailed. Don't be too strict, but not too lenient either. If the user answered with one word but it's correct, don't criticize them.

Question:
"${questionText}"

Reference answer (for your information, don't show it to the candidate in feedback, but use it to evaluate the completeness and correctness of the candidate's answer):
"${correctAnswer}"

Candidate's answer:
"${userAnswer}"

Return the response STRICTLY in JSON object format with the following keys: "shortFeedback" and "detailedFeedback".

1. "shortFeedback":
   * Very brief summary of the candidate's answer evaluation (1-2 sentences, no more than 30-40 words). For example: "Excellent answer, all key points covered!" or "Generally good, but missing mention of XYZ." or "Answer incomplete, important aspects missed."
   * This text should be plain text without markdown.

2. "detailedFeedback":
   * Detailed analysis of the candidate's answer in English.
   * Indicate what was said correctly and completely.
   * Explain what was missing in the answer or what important points were omitted. Compare with the reference answer.
   * If there are incorrect statements, tactfully point them out and explain why they are wrong.
   * Give specific recommendations on how to improve the answer or what to study additionally.
   * If you provide code examples, USE MARKDOWN for code blocks with language specification (e.g., \`\`\`java ...code... \`\`\`).
   * Use markdown for other formatting (lists, highlighting) if it improves readability.

Example JSON response (for Java topic):
{
  "shortFeedback": "Good answer, but could have been more detailed about garbage collection.",
  "detailedFeedback": "You correctly identified the main OOP principles. However, when talking about polymorphism, it would be great to give an example.\\n\\nFor instance, the classic case with shapes:\\n\\n\`\`\`java\\nabstract class Shape {\\n    abstract void draw();\\n}\\n\\nclass Circle extends Shape {\\n    @Override\\n    void draw() {\\n        System.out.println(\\"Drawing a circle\\");\\n    }\\n}\\n\\nclass Square extends Shape {\\n    @Override\\n    void draw() {\\n        System.out.println(\\"Drawing a square\\");\\n    }\\n}\\n\`\`\`\\n\\nAlso, you mentioned garbage collector but didn't detail its work. I recommend reading about object generations and different GC algorithms."
}

Respond only in English. Make sure the entire response is a valid JSON object with the specified keys.
Be constructive, friendly and supportive. The goal is to help the candidate improve their knowledge.
`;
  } else {
    return (questionText: string, correctAnswer: string, userAnswer: string, topic: string) => `
Выступи в роли опытного интервьюера и эксперта в области "${topic}".
Тебе предоставлен вопрос, эталонный ответ (для твоего сведения) и ответ кандидата.
Твоя задача - оценить ответ кандидата на русском языке и предоставить два вида обратной связи: краткую и подробную. Будь не слишком строгим, но и не слишком мягким. Если пользователь ответил одним словом, но он верный то не надо его критиковать.

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
  }
};

export const evaluateAnswerWithAPI = async (questionText: string, correctAnswer: string, userAnswer: string, topic: string): Promise<FeedbackResponse> => {
  const currentLanguage = i18n.language || 'ru';
  const promptGenerator = getFeedbackPrompts(currentLanguage);
  const prompt = promptGenerator(questionText, correctAnswer, userAnswer, topic);

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
        console.error("Invalid data received from API when evaluating answer (incorrect structure):", parsedData);
        throw new Error("Failed to get valid feedback from AI. Response format does not match expected (shortFeedback and detailedFeedback must be strings).");
    }
    return parsedData;

  } catch (error) {
    console.error("Error evaluating answer:", error);
     if (error instanceof Error && error.message.startsWith('AI_PARSING_ERROR')) {
        throw new Error(`Problem with AI response: failed to process received data for feedback. Please try again.`);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred when requesting AI.";
    throw new Error(`Failed to evaluate answer: ${errorMessage}`);
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