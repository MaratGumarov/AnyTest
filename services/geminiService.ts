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

const getUniversalPrompts = () => {
  return {
    difficultyMap: {
      [Difficulty.JUNIOR]: 'Junior (beginner)',
      [Difficulty.MIDDLE]: 'Middle (intermediate)',
      [Difficulty.SENIOR]: 'Senior (advanced)',
    },
    promptTemplate: (batchSize: number, topic: string, difficultyText: string, interfaceLanguage: string) => `
Generate ${batchSize} UNIQUE interview questions for the topic "${topic}" at "${difficultyText}" level.

CONTEXT: The user interface is currently in "${interfaceLanguage}" language, which may give you a hint about the user's preferred language, but you should still primarily detect the language from the topic itself.

IMPORTANT: Detect the language of the topic and generate questions and answers in the SAME language as the topic. 
- If the topic is in English, generate questions and answers in English
- If the topic is in Russian (Русский), generate questions and answers in Russian
- If the topic is in Tatar (Татарча), generate questions and answers in Tatar
- If the topic is in any other language, generate questions and answers in that language
- If the language is unclear, use the interface language (${interfaceLanguage}) as fallback

First, analyze the topic to understand its mood and context (e.g., is it for a serious technical interview, a fun quiz, a historical exam?).
Adjust the tone and style of the questions and answers accordingly. For humorous or informal topics, the questions should also be light-hearted and creative. For professional topics, maintain a formal, relevant tone.

Each question should be meaningful and relevant to the topic and difficulty level.
Avoid repeating questions that might have been generated in previous requests for the same topic.

For each question provide:
1. Question text in the SAME language as the topic (key "question").
2. Brief and correct reference answer to the question in the SAME language as the topic (key "answer"). The answer should be sufficient to check understanding, but not overly detailed.

Return the response STRICTLY as a JSON array of objects. Each object should contain only "question" and "answer" keys.

Example for English topic:
{
  "question": "What is JVM and why is it needed?",
  "answer": "JVM (Java Virtual Machine) is a virtual machine that executes Java bytecode. It provides platform independence for Java applications, allowing compiled Java code to run on any system where JVM is installed."
}

Example for Russian topic:
{
  "question": "Что такое JVM и зачем она нужна?",
  "answer": "JVM (Java Virtual Machine) - это виртуальная машина, которая исполняет байт-код Java. Она обеспечивает платформенную независимость Java-приложений, позволяя скомпилированному Java-коду работать на любой системе, где установлена JVM."
}

Example for Tatar topic:
{
  "question": "JVM нәрсә ул һәм ни өчен кирәк?",
  "answer": "JVM (Java Virtual Machine) - бу Java байт-кодын башкаручы виртуаль машина. Ул Java кушымталары өчен платформа бәйсезлеген тәэмин итә, компиляцияләнгән Java кодының JVM урнаштырылган теләсә нинди системада эшләвен мөмкин итә."
}

Make sure the entire response is a valid JSON array. Do not add any text before or after the JSON array.
If for some reason you cannot generate ${batchSize} questions (e.g., the topic is too narrow for that many at the given difficulty level), generate as many as you can, but at least one if possible.
`
  };
};

export const generateQuestionsFromAPI = async (batchSize: number, difficulty: Difficulty, topic: string): Promise<GeneratedQuestion[]> => {
  // For Java topic, use pre-loaded questions for quick testing
  if (topic.toLowerCase().includes('java')) {
    console.log('Using pre-loaded questions for Java');
    return getMockQuestions(difficulty, batchSize);
  }

  const universalPrompts = getUniversalPrompts();
  const difficultyText = universalPrompts.difficultyMap[difficulty];
  const prompt = universalPrompts.promptTemplate(batchSize, topic, difficultyText, i18n.language);

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

  const interfaceLanguage = i18n.language || 'en';
  const prompt = `You are a creative assistant. A user is typing a topic for a quiz or test. Your goal is to suggest a list of 3 to 5 engaging and relevant topics based on their input.

CONTEXT: The user interface is currently in "${interfaceLanguage}" language, which may give you a hint about the user's preferred language, but you should still primarily detect the language from the user input itself.

IMPORTANT: Detect the language of the user input and generate suggestions in the SAME language as the input.
- If the input is in English, generate suggestions in English
- If the input is in Russian (Русский), generate suggestions in Russian  
- If the input is in Tatar (Татарча), generate suggestions in Tatar
- If the input is in any other language, generate suggestions in that language
- If the language is unclear, use the interface language (${interfaceLanguage}) as fallback

User input: "${query}"
Analyze the input to understand the theme and mood (e.g., "technical", "historical", "humorous").
Generate a list of 3-5 related topics that match this theme and mood.
Each suggested topic should be short and concise (max 3-4 words).
Return the response STRICTLY as a JSON array of strings. Do not add any text before or after the JSON array.

Examples:
- For English input "Frontend": ["React vs Vue", "CSS Animations", "Web Accessibility", "Modern JS Frameworks"]
- For Russian input "Frontend": ["React vs Vue", "CSS-анимации", "Веб-доступность", "Современные JS фреймворки"]
- For Tatar input "Frontend": ["React vs Vue", "CSS анимацияләре", "Веб-доступность", "Заманча JS фреймворклар"]`;
    
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
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

const getUniversalFeedbackPrompt = (questionText: string, correctAnswer: string, userAnswer: string, topic: string, interfaceLanguage: string) => `
Act as an experienced interviewer and expert in the field of "${topic}".
You are provided with a question, reference answer (for your information) and candidate's answer.

CONTEXT: The user interface is currently in "${interfaceLanguage}" language, which may give you a hint about the user's preferred language, but you should still primarily detect the language from the question itself.

IMPORTANT: Detect the language of the question and provide feedback in the SAME language as the question.
- If the question is in English, provide feedback in English
- If the question is in Russian (Русский), provide feedback in Russian
- If the question is in Tatar (Татарча), provide feedback in Tatar
- If the question is in any other language, provide feedback in that language
- If the language is unclear, use the interface language (${interfaceLanguage}) as fallback

Your task is to evaluate the candidate's answer and provide two types of feedback: brief and detailed. Don't be too strict, but not too lenient either. If the user answered with one word but it's correct, don't criticize them.

Question:
"${questionText}"

Reference answer (for your information, don't show it to the candidate in feedback, but use it to evaluate the completeness and correctness of the candidate's answer):
"${correctAnswer}"

Candidate's answer:
"${userAnswer}"

Return the response STRICTLY in JSON object format with the following keys: "shortFeedback" and "detailedFeedback".

1. "shortFeedback":
   * Very brief summary of the candidate's answer evaluation (1-2 sentences, no more than 30-40 words). 
   * This text should be plain text without markdown.
   * Write in the SAME language as the question.

2. "detailedFeedback":
   * Detailed analysis of the candidate's answer in the SAME language as the question.
   * Indicate what was said correctly and completely.
   * Explain what was missing in the answer or what important points were omitted. Compare with the reference answer.
   * If there are incorrect statements, tactfully point them out and explain why they are wrong.
   * Give specific recommendations on how to improve the answer or what to study additionally.
   * If you provide code examples, USE MARKDOWN for code blocks with language specification (e.g., \`\`\`java ...code... \`\`\`).
   * Use markdown for other formatting (lists, highlighting) if it improves readability.

Examples for different languages:

English example:
{
  "shortFeedback": "Good answer, but could have been more detailed about garbage collection.",
  "detailedFeedback": "You correctly identified the main OOP principles. However, when talking about polymorphism, it would be great to give an example.\\n\\nFor instance, the classic case with shapes:\\n\\n\`\`\`java\\nabstract class Shape {\\n    abstract void draw();\\n}\\n\`\`\`\\n\\nAlso, you mentioned garbage collector but didn't detail its work. I recommend reading about object generations and different GC algorithms."
}

Russian example:
{
  "shortFeedback": "Хороший ответ, но можно было бы подробнее рассказать о сборке мусора.",
  "detailedFeedback": "Вы правильно указали основные принципы ООП. Однако, когда говорили о полиморфизме, было бы здорово привести пример.\\n\\nНапример, классический случай с фигурами:\\n\\n\`\`\`java\\nabstract class Shape {\\n    abstract void draw();\\n}\\n\`\`\`\\n\\nТакже, вы упомянули сборщик мусора, но не детализировали его работу. Рекомендую почитать про поколения объектов и различные алгоритмы GC."
}

Tatar example:
{
  "shortFeedback": "Яхшы җавап, ләкин garbage collection турында җентекләп сөйләргә мөмкин иде.",
  "detailedFeedback": "Сез ООП нигезле принципларын дөрес күрсәттегез. Ләкин полиморфизм турында сөйләгәндә, мисал китерү бик яхшы булыр иде.\\n\\nМәсәлән, фигуралар белән классик очрак:\\n\\n\`\`\`java\\nabstract class Shape {\\n    abstract void draw();\\n}\\n\`\`\`\\n\\nШулай ук, сез garbage collector турында искә алдыгыз, ләкин аның эшен детальләштермәдегез. Объект буыннары һәм төрле GC алгоритмнары турында укырга киңәш итәм."
}

Make sure the entire response is a valid JSON object with the specified keys.
Be constructive, friendly and supportive. The goal is to help the candidate improve their knowledge.
`;

export const evaluateAnswerWithAPI = async (questionText: string, correctAnswer: string, userAnswer: string, topic: string): Promise<FeedbackResponse> => {
  const prompt = getUniversalFeedbackPrompt(questionText, correctAnswer, userAnswer, topic, i18n.language);

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