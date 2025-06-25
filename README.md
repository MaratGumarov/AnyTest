 # AI Interview Coach 🤖💼

**Your AI-powered trainer for technical interview preparation**

## Description

AI Interview Coach is an interactive web application that helps you prepare for technical interviews using Google Gemini artificial intelligence. The application generates questions on various IT topics and provides detailed feedback on your answers.

## Features

### 🎯 Core Capabilities
- **Personalized Questions**: Generate questions based on selected topic and difficulty level
- **Intelligent Assessment**: AI analyzes your answers and provides detailed feedback
- **User-friendly Interface**: Question cards that can be swiped through
- **Voice Input**: Ability to answer questions using voice recognition
- **Session Summary**: Detailed report of all answered questions
- **🌐 Multilingual Support**: Full internationalization with English and Russian languages

### 🌍 Language Support
- **Automatic Language Detection**: Detects browser language and sets it as default
- **Seamless Language Switching**: Toggle between languages without page reload
- **Localized AI Content**: Questions and feedback generated in your preferred language
- **Persistent Language Preference**: Remembers your language choice

### 📚 Supported Topics
- **Frontend Development**: React, JavaScript, CSS, HTML
- **Backend Development**: Node.js, APIs, Server Architecture
- **Full-stack Development**: End-to-end application development
- **DevOps**: CI/CD, Docker, Cloud platforms
- **Mobile Development**: iOS, Android, React Native
- **Data Science**: Data analysis, visualization, statistics
- **Machine Learning**: ML algorithms, neural networks
- **Algorithms & Data Structures**: Core computer science concepts
- **Databases**: SQL, NoSQL, database design
- **Software Testing**: Testing methodologies and frameworks
- **Custom Topics**: Specify your own topic for personalized questions

### 🎓 Difficulty Levels
- **Junior** - For entry-level developers
- **Middle** - For mid-level developers  
- **Senior** - For experienced developers

## Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **AI**: Google Gemini API
- **Internationalization**: react-i18next, i18next
- **Additional Libraries**: 
  - React Markdown for feedback rendering
  - Web Speech API for voice input
  - i18next-browser-languagedetector for automatic language detection

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- Gemini API key from Google

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API key**
   - Create `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     VITE_API_KEY=your_gemini_api_key_here
     ```

4. **Start the application**
   ```bash
   npm run dev -- --host
   ```

5. **Open in browser**
   - Locally: `http://localhost:5173`
   - Network: `http://192.168.1.171:5173` (for mobile device access)

## Getting Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to `.env.local`

## Project Structure

```
ai-interview-coach/
├── src/
│   ├── components/          # React components
│   │   ├── SetupScreen.tsx  # Session setup screen
│   │   ├── QuestionSwiper.tsx # Question carousel
│   │   ├── SummaryScreen.tsx # Summary screen
│   │   ├── LanguageToggle.tsx # Language switcher
│   │   └── ...
│   ├── services/            # Services
│   │   └── geminiService.ts # Gemini API integration
│   ├── hooks/              # Custom hooks
│   │   ├── useLanguage.ts  # Language management
│   │   └── useConstants.ts # Dynamic constants
│   ├── i18n/               # Internationalization
│   │   └── index.ts        # i18n configuration
│   ├── types.ts            # TypeScript types
│   ├── constants.ts        # Application constants
│   └── App.tsx            # Main component
├── locales/                # Translation files
│   ├── en/                 # English translations
│   │   └── common.json
│   └── ru/                 # Russian translations
│       └── common.json
├── .env.local             # Environment variables (create)
├── package.json           # Dependencies
└── README.md             # Documentation
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## How to Use

1. **Session Setup**: Choose topic and difficulty level
2. **Language Selection**: The app automatically detects your browser language, or you can manually switch using the language toggle
3. **Answer Questions**: Respond to questions with text or voice input
4. **Get Feedback**: Click "Check Answer" to receive AI evaluation
5. **Navigate**: Swipe or use buttons to move between questions
6. **Complete Session**: Review summary of all questions and answers

## Interface Features

- **Swipe Navigation**: Swipe left/right to navigate between questions
- **Voice Input**: Microphone button for voice recording
- **Expandable Sections**: Clickable sections to show/hide information
- **Responsive Design**: Works on mobile devices
- **Language Toggle**: Switch between supported languages instantly
- **Theme Support**: Light and dark theme options

## Internationalization

The application supports multiple languages with:

- **Automatic Detection**: Browser language detection on first visit
- **Manual Switching**: Language toggle component in the header
- **Persistent Preference**: Language choice saved in localStorage
- **AI Localization**: Questions and feedback generated in selected language
- **UI Translation**: Complete interface translation

### Adding New Languages

To add support for a new language:

1. Create translation file in `locales/[language-code]/common.json`
2. Add language support in `src/hooks/useLanguage.ts`
3. Update language detection in `src/i18n/index.ts`
4. Add language-specific prompts in `services/geminiService.ts`

## License

This project is created for educational purposes.

## Contributing

If you want to contribute to the project:
1. Fork the repository
2. Create a branch with your changes
3. Submit a Pull Request

## Support

If you encounter issues or have questions, please create an Issue in the repository.

---

**Good luck with your interview preparation! 🚀**