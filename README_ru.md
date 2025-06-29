# AI Interview Coach 🤖💼

**Ваш ИИ-тренер для подготовки к техническим собеседованиям**

## Описание

AI Interview Coach - это интерактивное веб-приложение, которое помогает подготовиться к техническим собеседованиям с использованием искусственного интеллекта Google Gemini. Приложение генерирует вопросы по различным IT-темам и предоставляет детальную обратную связь по вашим ответам.

## Функционал

### 🎯 Основные возможности
- **Персонализированные вопросы**: Генерация вопросов по выбранной теме и уровню сложности
- **Интеллектуальная оценка**: ИИ анализирует ваши ответы и дает подробную обратную связь
- **Удобный интерфейс**: Карточки с вопросами, которые можно пролистывать свайпами
- **Голосовой ввод**: Возможность отвечать на вопросы голосом
- **Сводка сессии**: Подробный отчет по всем отвеченным вопросам
- **🌐 Многоязычная поддержка**: Полная интернационализация с поддержкой русского и английского языков

### 🌍 Языковая поддержка
- **Автоматическое определение языка**: Определяет язык браузера и устанавливает его по умолчанию
- **Плавное переключение языков**: Переключение между языками без перезагрузки страницы
- **Локализованный ИИ-контент**: Вопросы и обратная связь генерируются на выбранном языке
- **Сохранение языковых предпочтений**: Запоминает ваш выбор языка

### 📚 Поддерживаемые темы
- **Frontend разработка**: React, JavaScript, CSS, HTML
- **Backend разработка**: Node.js, API, архитектура серверов
- **Full-stack разработка**: Комплексная разработка приложений
- **DevOps**: CI/CD, Docker, облачные платформы
- **Мобильная разработка**: iOS, Android, React Native
- **Data Science**: Анализ данных, визуализация, статистика
- **Machine Learning**: ML алгоритмы, нейронные сети
- **Алгоритмы и структуры данных**: Основы компьютерных наук
- **Базы данных**: SQL, NoSQL, проектирование БД
- **Тестирование ПО**: Методологии и фреймворки тестирования
- **Пользовательские темы**: Возможность указать свою тему для персонализированных вопросов

### 🎓 Уровни сложности
- **Junior** (Джуниор) - для начинающих разработчиков
- **Middle** (Мидл) - для разработчиков среднего уровня
- **Senior** (Сеньор) - для опытных разработчиков

## Технологии

- **Frontend**: React 19 + TypeScript + Vite
- **ИИ**: Google Gemini API
- **Интернационализация**: react-i18next, i18next
- **Дополнительные библиотеки**: 
  - React Markdown для рендеринга обратной связи
  - Web Speech API для голосового ввода
  - i18next-browser-languagedetector для автоматического определения языка

## Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- Gemini API ключ от Google

### Шаги установки

1. **Клонирование репозитория**
   ```bash
   git clone <url-репозитория>
   cd ai-interview-coach
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка API ключа**
   - Создайте файл `.env.local` в корне проекта
   - Добавьте ваш Gemini API ключ:
     ```
     VITE_API_KEY=ваш_gemini_api_ключ_здесь
     ```

4. **Запуск приложения**
   ```bash
   npm run dev -- --host
   ```

5. **Откройте в браузере**
   - Локально: `http://localhost:5173`
   - В сети: `http://192.168.1.171:5173` (для доступа с мобильных устройств)

## Получение Gemini API ключа

1. Перейдите на [Google AI Studio](https://aistudio.google.com/)
2. Войдите в свой Google аккаунт
3. Создайте новый API ключ
4. Скопируйте ключ и добавьте его в `.env.local`

## Структура проекта

```
ai-interview-coach/
├── src/
│   ├── components/          # React компоненты
│   │   ├── SetupScreen.tsx  # Экран настройки сессии
│   │   ├── QuestionSwiper.tsx # Карусель вопросов
│   │   ├── SummaryScreen.tsx # Экран сводки
│   │   ├── LanguageToggle.tsx # Переключатель языков
│   │   └── ...
│   ├── services/            # Сервисы
│   │   └── geminiService.ts # Интеграция с Gemini API
│   ├── hooks/              # Пользовательские хуки
│   │   ├── useLanguage.ts  # Управление языками
│   │   └── useConstants.ts # Динамические константы
│   ├── i18n/               # Интернационализация
│   │   └── index.ts        # Конфигурация i18n
│   ├── types.ts            # TypeScript типы
│   ├── constants.ts        # Константы приложения
│   └── App.tsx            # Главный компонент
├── locales/                # Файлы переводов
│   ├── en/                 # Английские переводы
│   │   └── common.json
│   └── ru/                 # Русские переводы
│       └── common.json
├── .env.local             # Переменные окружения (создать)
├── package.json           # Зависимости
└── README.md             # Документация
```

## Скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run preview` - Предварительный просмотр сборки

## Как использовать

1. **Настройка сессии**: Выберите тему и уровень сложности
2. **Выбор языка**: Приложение автоматически определяет язык браузера, или вы можете переключить язык вручную
3. **Ответы на вопросы**: Отвечайте на вопросы текстом или голосом
4. **Получение обратной связи**: Нажмите "Проверить ответ" для получения оценки ИИ
5. **Навигация**: Свайпите или используйте кнопки для перехода между вопросами
6. **Завершение сессии**: Просмотрите сводку всех вопросов и ответов

## Возможности интерфейса

- **Навигация свайпами**: Листайте вопросы влево/вправо
- **Голосовой ввод**: Кнопка микрофона для записи ответа
- **Раскрывающиеся разделы**: Кликабельные секции для показа/скрытия информации
- **Адаптивный дизайн**: Работает на мобильных устройствах
- **Переключатель языков**: Мгновенное переключение между поддерживаемыми языками
- **Поддержка тем**: Светлая и темная темы оформления

## Интернационализация

Приложение поддерживает несколько языков с функциями:

- **Автоматическое определение**: Определение языка браузера при первом посещении
- **Ручное переключение**: Компонент переключения языков в заголовке
- **Постоянные предпочтения**: Выбор языка сохраняется в localStorage
- **Локализация ИИ**: Вопросы и обратная связь генерируются на выбранном языке
- **Перевод интерфейса**: Полный перевод пользовательского интерфейса

### Добавление новых языков

Для добавления поддержки нового языка:

1. Создайте файл перевода в `locales/[код-языка]/common.json`
2. Добавьте поддержку языка в `src/hooks/useLanguage.ts`
3. Обновите определение языка в `src/i18n/index.ts`
4. Добавьте языко-специфичные промпты в `services/geminiService.ts`

## Лицензия

Проект создан для образовательных целей.

## Вклад в проект

Если вы хотите внести свой вклад в развитие проекта:
1. Создайте форк репозитория
2. Создайте ветку с вашими изменениями
3. Отправьте Pull Request

## Поддержка

Если у вас возникли проблемы или вопросы, создайте Issue в репозитории.

---

**Удачной подготовки к собеседованиям! 🚀**
