# CLAUDE.md - AI Interview Coach

This document provides essential information for AI assistants working with this codebase.

## Project Overview

**AI Interview Coach** is an interactive web application that helps users prepare for technical interviews using Google Gemini AI. The application generates questions on various IT topics, allows users to answer via text or voice, and provides detailed AI-powered feedback.

### Key Features
- Personalized question generation based on topic and difficulty
- AI-powered answer evaluation with detailed feedback
- Voice input support via Web Speech API
- Swipeable question cards with infinite loading
- Multi-language support (EN, RU, TT, UK, ES, PT)
- Light/Dark/System theme support

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Internationalization**: react-i18next, i18next, i18next-browser-languagedetector
- **Markdown Rendering**: react-markdown with remark-gfm
- **Styling**: Tailwind CSS (utility-first classes in index.css)

## Project Structure

```
ai-interview-coach/
├── App.tsx                 # Main application component with screen state management
├── index.tsx               # React entry point
├── types.ts                # TypeScript type definitions
├── constants.ts            # Application constants and configuration
├── utils.ts                # Utility functions (UUID generation, debounce)
├── index.css               # Global styles and Tailwind utilities
├── vite.config.ts          # Vite configuration with path aliases
├── tsconfig.json           # TypeScript configuration
│
├── components/             # React components (root level)
│   ├── SetupScreen.tsx     # Session configuration screen
│   ├── QuestionSwiper.tsx  # Swipeable question carousel
│   ├── QuestionDisplayCard.tsx  # Individual question card
│   ├── SummaryScreen.tsx   # Results summary screen
│   ├── LoadingScreen.tsx   # Loading state display
│   ├── SmartTopicInput.tsx # AI-powered topic input with suggestions
│   ├── ThemeToggle.tsx     # Theme switcher component
│   ├── Spoiler.tsx         # Expandable content component
│   ├── icons.tsx           # SVG icon components
│   └── ui/                 # Reusable UI component library
│       ├── index.ts        # Barrel exports
│       ├── Button.tsx      # Button with variants (primary, secondary, etc.)
│       ├── Card.tsx        # Card container with variants
│       ├── Input.tsx       # Text input component
│       ├── Textarea.tsx    # Multi-line text input
│       ├── Select.tsx      # Native select component
│       └── CustomSelect.tsx # Custom styled select dropdown
│
├── src/                    # Additional source files
│   ├── components/
│   │   ├── LanguageToggle.tsx  # Language switcher button
│   │   └── LanguageSelector.tsx # Language dropdown selector
│   ├── hooks/
│   │   ├── useLanguage.ts  # Language management hook
│   │   └── useConstants.ts # Dynamic constants based on language
│   └── i18n/
│       └── index.ts        # i18next configuration
│
├── hooks/                  # Custom React hooks (root level)
│   ├── useTheme.ts         # Theme management (light/dark/system)
│   └── useSpeechRecognition.ts # Web Speech API wrapper
│
├── services/               # API and data services
│   ├── geminiService.ts    # Gemini API integration
│   └── mockData.ts         # Mock data for testing/development
│
└── locales/                # Translation files
    ├── en/common.json      # English translations
    ├── ru/common.json      # Russian translations
    ├── tt/common.json      # Tatar translations
    ├── uk/common.json      # Ukrainian translations
    ├── es/common.json      # Spanish translations
    └── pt/common.json      # Portuguese translations
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (accessible on local network)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

1. Copy `env.example` to `.env.local`
2. Add your Gemini API key:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```
3. Get an API key from [Google AI Studio](https://aistudio.google.com/)

## Key Conventions

### Component Structure
- Components use **functional components** with React hooks
- Props interfaces are defined inline or imported from types
- Use `useTranslation()` hook from react-i18next for all user-facing text
- Components export as default

### Styling Conventions
- Use **Tailwind CSS utility classes** directly in JSX
- Dark mode classes use `dark:` prefix (e.g., `dark:bg-slate-800`)
- Common patterns:
  - Gradients: `bg-gradient-to-br from-slate-50 to-blue-50`
  - Dark gradients: `dark:from-gray-900 dark:via-purple-900 dark:to-violet-800`
  - Rounded corners: `rounded-xl` (standard), `rounded-full` (circular)
  - Shadows: `shadow-md`, `shadow-lg`, `shadow-xl`

### State Management
- App-level state in `App.tsx` using `useState`
- Screen navigation via `currentScreen` state (`'config' | 'questions' | 'results'`)
- Question updates use callback props pattern

### TypeScript Conventions
- Types defined in `types.ts`
- Key types:
  - `QuestionItem` - Question with user answer and feedback
  - `InterviewConfig` / `SessionSettings` - Session configuration
  - `Difficulty` - Enum: `JUNIOR`, `MIDDLE`, `SENIOR`
  - `FeedbackResponse` - AI feedback structure

### Internationalization (i18n)
- All user-facing strings use `t('key.path')` from `useTranslation()`
- Translation keys organized by feature in `common.json`
- Language detection order: localStorage > browser > default (en)
- AI generates content in the same language as the topic/question

### Adding a New Language
1. Create `locales/{lang-code}/common.json` with all translations
2. Import and add to resources in `src/i18n/index.ts`
3. Add language code to `LANGUAGES` array in `src/hooks/useLanguage.ts`
4. Add language name mapping in `getLanguageName()` function

### API Integration (Gemini)
- Service functions in `services/geminiService.ts`
- Key functions:
  - `generateQuestions()` - Generate interview questions
  - `evaluateAnswerWithAPI()` - Evaluate user's answer
  - `getTopicSuggestion()` - AI-powered topic suggestions
- Responses expected as JSON, parsed with `parseJsonFromText()`
- Mock data available for Java topic for testing

### UI Components Library
Import from `components/ui`:
```typescript
import { Button, Card, Input, Textarea, Select, CustomSelect } from './components/ui';
```

Button variants: `primary`, `secondary`, `success`, `danger`, `ghost`
Card variants: `default`, `glass`

### Path Aliases
The project uses `@/` as an alias for the root directory:
```typescript
import { something } from '@/components/ui';
```

## Important Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main application logic and screen routing |
| `services/geminiService.ts` | All AI/Gemini API calls |
| `types.ts` | Core TypeScript interfaces |
| `constants.ts` | App configuration (model name, batch size, topics) |
| `src/i18n/index.ts` | i18next setup and language configuration |
| `hooks/useTheme.ts` | Theme state management |
| `components/ui/` | Reusable UI component library |

## Current Gemini Model

The app uses `gemini-2.5-flash-lite-preview-06-17` as defined in `constants.ts`. This can be changed via `GEMINI_MODEL_TEXT` constant.

## Testing Notes

- Java topic uses mock data from `services/mockData.ts` for faster testing
- Development mode enables i18next debug logging
- Console logs in `index.tsx` help debug React mounting issues

## Code Quality

- TypeScript strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- ESNext module system with bundler resolution

## Common Tasks

### Adding a New Screen
1. Add screen type to `AppScreen` type in `App.tsx`
2. Create component in `components/`
3. Add state and navigation logic in `App.tsx`
4. Add translation keys to all locale files

### Adding a New UI Component
1. Create component in `components/ui/`
2. Export from `components/ui/index.ts`
3. Follow existing patterns (variants, sizes, props interface)

### Modifying AI Prompts
- Question generation prompt in `getUniversalPrompts()` in `geminiService.ts`
- Feedback prompt in `getUniversalFeedbackPrompt()` in `geminiService.ts`
- Both support multi-language output based on topic/question language

## Notes for AI Assistants

1. **Always use translations** - Never hardcode user-facing strings
2. **Dark mode support** - Always include `dark:` variants for colors
3. **TypeScript** - Maintain type safety, don't use `any` unless necessary
4. **Component reuse** - Use existing UI components from `components/ui/`
5. **Preserve existing patterns** - Match the coding style of surrounding code
6. **Comments** - Some comments are in Russian; preserve them unless changing the related code
7. **Test with Java topic** - Uses mock data, good for quick testing without API calls
