# 📋 GitHub Issues for AI Interview Coach

## ✅ Created Issues

### Issue #3: 🌙 Dark Theme Display Issues

**Title**: `[BUG] Dark theme display issues`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/3  
**Labels**: `bug`, `ui`, `dark-theme`, `priority-high`

**Description**:
```markdown
## 🐛 Bug Description
Some UI elements may not display correctly in dark theme mode.

## 🔄 Steps to Reproduce
1. Open the application
2. Switch to dark theme using the theme toggle button
3. Navigate through all application screens
4. Notice any issues with contrast, readability, or element visibility

## ✅ Expected Behavior
All elements should display correctly in dark theme with sufficient contrast and readability.

## 🔧 Fix Plan
1. Audit all components in `components/` directory
2. Check CSS variables in `index.css`
3. Ensure proper Tailwind dark theme classes
4. Test all screens in dark theme mode
5. Verify text and background contrast ratios

## 📊 Priority
High - affects user experience

## 🎯 Acceptance Criteria
- [ ] All text is readable in dark theme
- [ ] All interactive elements are visible
- [ ] Proper contrast ratios are maintained
- [ ] No visual glitches or artifacts
- [ ] Theme switching works smoothly
```

---

### Issue #4: 🧠 Question History Context

**Title**: `[FEATURE] Use question history context to avoid repetitions`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/4  
**Labels**: `enhancement`, `ai`, `priority-medium`

**Description**:
```markdown
## 🚀 Feature Description
Use the history of previously asked questions as context when generating new questions to avoid repetitions and ensure more diverse interview sessions.

## 🎯 Problem Statement
Currently, the AI may generate similar or repetitive questions within the same session, which reduces the effectiveness of interview preparation.

## 💡 Proposed Solution
1. **History Storage**: Store all generated questions in application state
2. **Contextual Prompts**: Pass question history to Gemini API prompts
3. **AI Instructions**: Explicitly ask AI to avoid similar topics and phrasings
4. **Filtering Logic**: Add similarity checking logic for questions

## 📋 Implementation Details

### Code Changes:
1. **`App.tsx`** or new context:
   ```typescript
   const [questionHistory, setQuestionHistory] = useState<string[]>([]);
   ```

2. **`services/geminiService.ts`**:
   ```typescript
   const generateQuestionsWithContext = async (
     topic: string, 
     difficulty: string, 
     previousQuestions: string[]
   ) => {
     const contextPrompt = previousQuestions.length > 0 
       ? `\n\nPrevious questions in this session (avoid similar ones):\n${previousQuestions.join('\n')}`
       : '';
     
     // Updated prompt with context
   };
   ```

## ✅ Acceptance Criteria
- [ ] Questions don't repeat within the same session
- [ ] AI generates diverse questions covering different topic aspects
- [ ] Question history is maintained during the session
- [ ] Prompt correctly passes context to API
- [ ] Tests added to verify question uniqueness

## 📊 Priority
Medium - improves content quality
```

---

### Issue #5: 📚 Custom Knowledge Sources

**Title**: `[FEATURE] Custom knowledge sources for question generation`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/5  
**Labels**: `enhancement`, `ai`, `priority-medium`

**Description**:
```markdown
## 🚀 Feature Description
Allow users to upload their own knowledge sources (documents, PDFs, text files) to generate personalized interview questions based on their specific materials.

## 🎯 Problem Statement
Currently, the AI generates questions based on its general knowledge. Users may want to prepare for interviews based on specific materials like:
- Company documentation
- Technical specifications
- Personal study materials
- Industry-specific content
- Custom learning resources

## 💡 Proposed Solution
1. **File Upload Interface**: Add file upload component for various formats
2. **Document Processing**: Parse and extract text from uploaded files
3. **Knowledge Integration**: Use uploaded content as context for question generation
4. **Source Management**: Allow users to manage their uploaded sources

## 📋 Implementation Details

### Supported File Types:
- **Text files**: .txt, .md
- **Documents**: .pdf, .docx
- **Web content**: URL scraping
- **Code files**: .js, .ts, .py, etc.

### Technical Implementation:
1. **Frontend**: File upload component with drag & drop
2. **Processing**: Document text extraction and chunking
3. **AI Integration**: Include custom sources in Gemini prompts
4. **Storage**: Secure file storage and management

## ✅ Acceptance Criteria
- [ ] Users can upload text files (.txt, .md)
- [ ] Users can upload PDF documents
- [ ] Uploaded content is processed and stored
- [ ] AI uses custom sources for question generation
- [ ] Users can manage (view/delete) their sources
- [ ] Questions indicate when they're based on custom sources
- [ ] File size limits and validation implemented
- [ ] Error handling for unsupported files

## 📊 Priority
Medium-High - adds significant value for personalized learning
```

---

---

### Issue #11: 🇺🇦 Ukrainian Language Support

**Title**: `Add Ukrainian language support`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/11  
**Labels**: `enhancement`, `i18n`, `localization`, `priority-medium`

**Description**:
```markdown
## 🇺🇦 Ukrainian Language Support

### Description
Add Ukrainian language support to the AI Interview Coach application to make it accessible to Ukrainian speakers.

### Details
- [ ] Create Ukrainian locale file (`locales/uk/common.json`)
- [ ] Translate all UI strings and messages from English/Russian
- [ ] Add Ukrainian option to the language selector component
- [ ] Test all functionality with Ukrainian language selected
- [ ] Ensure proper text rendering and layout for Ukrainian text
- [ ] Update language selector to include Ukrainian flag/option

### Benefits
- Expanded user base in Ukraine
- Better accessibility for Ukrainian speakers
- Cultural inclusivity and diversity
- Compliance with modern localization standards

### Acceptance Criteria
- [ ] All UI elements display correctly in Ukrainian
- [ ] Language selector includes Ukrainian option
- [ ] All translations are accurate and culturally appropriate
- [ ] No layout issues with Ukrainian text
- [ ] Application functions normally in Ukrainian mode

### Priority
Medium

### Labels
enhancement, i18n, localization, priority-medium
```

---

### Issue #12: 🇪🇸 Spanish Language Support

**Title**: `Add Spanish language support`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/12  
**Labels**: `enhancement`, `i18n`, `localization`, `priority-medium`

**Description**:
```markdown
## 🇪🇸 Spanish Language Support

### Description
Add Spanish language support to the AI Interview Coach application to make it accessible to Spanish speakers worldwide.

### Details
- [ ] Create Spanish locale file (`locales/es/common.json`)
- [ ] Translate all UI strings and messages to Spanish
- [ ] Add Spanish option to the language selector component
- [ ] Test all functionality with Spanish language selected
- [ ] Ensure proper text rendering and layout for Spanish text
- [ ] Update language selector to include Spanish flag/option
- [ ] Consider regional variations (Latin American vs Iberian Spanish)

### Benefits
- Access to large Spanish-speaking market (500+ million speakers)
- Better accessibility for Spanish speakers worldwide
- Market expansion in Latin America and Spain
- International reach and cultural inclusivity

### Acceptance Criteria
- [ ] All UI elements display correctly in Spanish
- [ ] Language selector includes Spanish option
- [ ] All translations are accurate and culturally appropriate
- [ ] No layout issues with Spanish text
- [ ] Application functions normally in Spanish mode
- [ ] Translations are neutral and accessible to all Spanish variants

### Priority
Medium

### Labels
enhancement, i18n, localization, priority-medium
```

---

### Issue #13: 🇵🇹 Portuguese Language Support

**Title**: `Add Portuguese language support`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/13  
**Labels**: `enhancement`, `i18n`, `localization`, `priority-medium`

**Description**:
```markdown
## 🇵🇹 Portuguese Language Support

### Description
Add Portuguese language support to the AI Interview Coach application to make it accessible to Portuguese speakers worldwide.

### Details
- [ ] Create Portuguese locale file (`locales/pt/common.json`)
- [ ] Translate all UI strings and messages to Portuguese
- [ ] Add Portuguese option to the language selector component
- [ ] Test all functionality with Portuguese language selected
- [ ] Ensure proper text rendering and layout for Portuguese text
- [ ] Update language selector to include Portuguese flag/option
- [ ] Consider regional variations (Brazilian vs European Portuguese)

### Benefits
- Access to Portuguese-speaking market (260+ million speakers)
- Better accessibility for Portuguese speakers in Brazil and Portugal
- Market expansion in Brazil and Portuguese-speaking countries
- Increased global reach and cultural inclusivity

### Acceptance Criteria
- [ ] All UI elements display correctly in Portuguese
- [ ] Language selector includes Portuguese option
- [ ] All translations are accurate and culturally appropriate
- [ ] No layout issues with Portuguese text
- [ ] Application functions normally in Portuguese mode
- [ ] Translations are neutral and accessible to all Portuguese variants

### Priority
Medium

### Labels
enhancement, i18n, localization, priority-medium
```

---

## 🏷️ Created Labels

### Type Labels:
- ✅ `bug` - Bug reports (red: #d73a4a)
- ✅ `enhancement` - New features or improvements (blue: #a2eeef)

### Area Labels:
- ✅ `ui` - User interface related (blue: #1d76db)
- ✅ `ai` - AI/ML functionality (purple: #8b5cf6)
- ✅ `dark-theme` - Dark theme related issues (gray: #374151)
- ✅ `i18n` - Internationalization and localization (green: #0e8a16)
- ✅ `localization` - Localization and language support (blue: #1d76db)

### Priority Labels:
- ✅ `priority-high` - High priority issues (red: #d93f0b)
- ✅ `priority-medium` - Medium priority issues (yellow: #fbca04)
- ✅ `priority-low` - Low priority issues (green: #0e8a16)

---

## 📝 Next Steps

### For Issue #3 (Dark Theme Bug):
1. Start with auditing `components/ThemeToggle.tsx`
2. Check CSS variables in `index.css`
3. Test all screens in dark mode
4. Fix contrast issues
5. Verify accessibility compliance

### For Issue #4 (Question Context):
1. Modify `services/geminiService.ts`
2. Add question history state management
3. Update AI prompts with context
4. Implement similarity checking
5. Add tests for uniqueness

### For Issue #5 (Custom Knowledge Sources):
1. Implement file upload functionality
2. Parse and extract text from uploaded files
3. Integrate custom sources into Gemini prompts
4. Implement source management

### For Issue #11 (Ukrainian Language Support):
1. Create `locales/uk/common.json` file
2. Translate all strings from existing locales
3. Update language selector component
4. Add Ukrainian flag/option to UI
5. Test all functionality with Ukrainian language
6. Ensure proper text rendering and layout

### For Issue #12 (Spanish Language Support):
1. Create `locales/es/common.json` file
2. Translate all strings to Spanish
3. Update language selector component
4. Add Spanish flag/option to UI
5. Test all functionality with Spanish language
6. Consider regional variations (Latin American vs Iberian Spanish)
7. Ensure proper text rendering and layout

### For Issue #13 (Portuguese Language Support):
1. Create `locales/pt/common.json` file
2. Translate all strings to Portuguese
3. Update language selector component
4. Add Portuguese flag/option to UI
5. Test all functionality with Portuguese language
6. Consider regional variations (Brazilian vs European Portuguese)
7. Ensure proper text rendering and layout

---

### Issue #6: 📝 Multiple Choice Questions Support

**Title**: `[FEATURE] Multiple Choice Questions Support`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/6  
**Labels**: `enhancement`, `ai`, `ui`, `priority-medium`

**Description**:
```markdown
## 🚀 Feature Description
Add support for multiple choice questions with single or multiple correct answers to provide variety in question formats and faster answering options.

## 🎯 Problem Statement
Currently, all questions are open-ended text inputs. This can be time-consuming and doesn't cover all types of interview questions. Multiple choice questions would:
- Speed up question answering
- Provide objective scoring
- Better test specific knowledge points
- Add variety to the interview format

## 💡 Proposed Solution
1. **Question Types**: Support both single-choice and multi-choice questions
2. **AI Generation**: Modify prompts to generate multiple choice options
3. **UI Components**: Add radio buttons and checkboxes for answers
4. **Automatic Scoring**: Implement objective scoring for MC questions
5. **Mixed Sessions**: Combine open-ended and multiple choice questions

## 📋 Implementation Details

### Question Format:
```typescript
interface MultipleChoiceQuestion {
  id: string;
  questionText: string;
  type: 'single-choice' | 'multi-choice';
  options: string[];
  correctAnswers: number[]; // indices of correct options
  topic: string;
  explanation?: string;
}
```

### UI Components:
- Radio buttons for single-choice questions
- Checkboxes for multi-choice questions  
- Visual indicators for correct/incorrect answers
- Progress indicators for MC vs open-ended questions

## ✅ Acceptance Criteria
- [ ] AI generates questions with 4-6 answer options
- [ ] Support for single-choice (radio) questions
- [ ] Support for multi-choice (checkbox) questions
- [ ] Automatic scoring for MC questions
- [ ] Visual feedback for correct/incorrect choices
- [ ] Mix of MC and open-ended questions in sessions
- [ ] Backward compatibility with existing question format

## 📊 Priority
Medium-High - significantly improves user experience
```

---

### Issue #7: 📋 Extended Evaluation Mode

**Title**: `[FEATURE] Extended Evaluation Mode with Detailed Criteria`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/7  
**Labels**: `enhancement`, `ai`, `evaluation`, `priority-medium`

**Description**:
```markdown
## 🚀 Feature Description
Add extended mode with detailed evaluation criteria and rubrics for more comprehensive feedback and professional interview simulation.

## 🎯 Problem Statement
Current evaluation provides basic feedback but lacks detailed scoring criteria. Professional interviews often evaluate candidates on multiple dimensions, and detailed feedback helps identify specific areas for improvement.

## 💡 Proposed Solution
1. **Multi-dimensional Scoring**: Evaluate answers on multiple criteria
2. **Detailed Rubrics**: Provide scoring rubrics for each difficulty level
3. **Weighted Scoring**: Different criteria have different importance weights
4. **Visual Score Breakdown**: Show scores for each evaluation dimension
5. **Detailed Reports**: Export comprehensive evaluation reports

## 📋 Implementation Details

### Evaluation Dimensions:
- **Accuracy** (25%): Correctness of the answer
- **Completeness** (20%): How thorough the answer is
- **Clarity** (20%): How well-explained and structured
- **Technical Depth** (20%): Level of technical detail
- **Real-world Application** (15%): Practical examples and use cases

### Scoring Scale:
- **1-2**: Poor - Major gaps or errors
- **3-4**: Below Average - Some issues present
- **5-6**: Average - Meets basic expectations
- **7-8**: Good - Above average performance
- **9-10**: Excellent - Outstanding response

### Extended Feedback Format:
```typescript
interface ExtendedFeedback {
  overallScore: number;
  dimensionScores: {
    accuracy: number;
    completeness: number;
    clarity: number;
    technicalDepth: number;
    realWorldApplication: number;
  };
  detailedFeedback: string;
  improvementSuggestions: string[];
  strengths: string[];
  weaknesses: string[];
}
```

## ✅ Acceptance Criteria
- [ ] Multi-dimensional scoring system implemented
- [ ] Detailed rubrics for each difficulty level
- [ ] Visual score breakdown in UI
- [ ] Weighted scoring calculation
- [ ] Extended feedback generation via AI
- [ ] Export functionality for detailed reports
- [ ] Toggle between basic and extended evaluation modes

## 📊 Priority
Medium - adds professional-level evaluation capabilities
```

---

## 🏷️ Updated Labels

### New Area Labels:
- ✅ `evaluation` - Evaluation and scoring related features (purple: #8b5cf6)
- ✅ `education` - Educational features for teachers and students (green: #10B981)
- ✅ `dashboard` - Dashboard and analytics features (blue: #3B82F6)
- ✅ `persistence` - Data persistence and session management (yellow: #F59E0B)
- ✅ `reliability` - Application stability and reliability (red: #EF4444)
- ✅ `authentication` - User authentication and authorization (purple: #8B5CF6)
- ✅ `user-management` - User management and profiles (indigo: #6366F1)

---

## 📝 Updated Next Steps

### For Issue #6 (Multiple Choice Questions):
1. Design question format and data structure
2. Update AI prompts to generate MC questions
3. Create UI components for radio/checkbox answers
4. Implement automatic scoring logic
5. Add session mixing for MC and open-ended questions

### For Issue #7 (Extended Evaluation Mode):
1. Design evaluation criteria framework
2. Create detailed rubrics for each difficulty level
3. Update AI prompts for multi-dimensional scoring
4. Implement score calculation and weighting
5. Create UI for detailed score display
6. Add report generation functionality

---

### Issue #8: 👥 Teacher Dashboard & Student Management

**Title**: `[FEATURE] Teacher Dashboard & Student Management System`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/8  
**Labels**: `enhancement`, `education`, `dashboard`, `priority-high`

**Background**: Based on educator feedback from Резеда Гумарова who tested the application with students in international law subjects and requested teacher oversight capabilities.

**Key Requirements**:
- Teacher registration and authentication
- Student management and class creation
- Real-time session monitoring
- Results dashboard with analytics
- Export functionality for grading
- Multi-tenant architecture for institutions

---

### Issue #9: 💾 Session Persistence & Auto-save

**Title**: `[BUG] Session Persistence and Auto-save Implementation`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/9  
**Labels**: `bug`, `enhancement`, `persistence`, `reliability`, `priority-high`

**Background**: User reported that application "crashes" during long periods of inactivity, causing loss of progress and answers.

**Key Requirements**:
- Auto-save every 30 seconds
- Session timeout warnings
- Resume incomplete sessions
- Local storage backup
- Recovery mechanisms

---

### Issue #10: 👤 User Identity & Registration

**Title**: `[FEATURE] User Identity and Registration System`

**Status**: ✅ Created  
**URL**: https://github.com/MaratGumarov/AnyTest/issues/10  
**Labels**: `enhancement`, `authentication`, `user-management`, `priority-high`

**Background**: Users need ability to enter their name/surname and have personalized accounts for result tracking.

**Key Requirements**:
- Student and teacher registration
- User profiles and preferences
- Session history tracking
- Guest mode support
- Institutional integration
5. Add tests for functionality and validation

## 🔗 Repository Links
- **Issues**: https://github.com/MaratGumarov/AnyTest/issues
- **Labels**: https://github.com/MaratGumarov/AnyTest/labels
- **Repository**: https://github.com/MaratGumarov/AnyTest 