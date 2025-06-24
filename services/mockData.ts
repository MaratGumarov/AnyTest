import { GeneratedQuestion, Difficulty } from '../types';

// Предзагруженные вопросы по Java для быстрого тестирования
export const JAVA_MOCK_QUESTIONS: Record<Difficulty, GeneratedQuestion[]> = {
  [Difficulty.JUNIOR]: [
    {
      question: "Что такое JVM и какую роль она играет в выполнении Java-программ?",
      answer: "JVM (Java Virtual Machine) - это виртуальная машина, которая исполняет Java-байткод. Она обеспечивает платформенную независимость Java-программ, управляет памятью (включая сборку мусора), обеспечивает безопасность выполнения кода и оптимизирует производительность. JVM преобразует байткод в машинный код конкретной платформы."
    },
    {
      question: "В чем разница между == и equals() в Java?",
      answer: "== сравнивает ссылки на объекты (для примитивов - значения), а equals() сравнивает содержимое объектов. Например, для строк: String a = new String(\"hello\"); String b = new String(\"hello\"); здесь a == b вернет false (разные ссылки), а a.equals(b) вернет true (одинаковое содержимое)."
    },
    {
      question: "Что такое наследование в Java и как оно реализуется?",
      answer: "Наследование - это механизм ООП, позволяющий классу наследовать свойства и методы другого класса. В Java используется ключевое слово extends. Подкласс получает все public и protected члены суперкласса. Java поддерживает только единичное наследование классов, но множественное наследование интерфейсов через implements."
    },
    {
      question: "Объясните разницу между String, StringBuilder и StringBuffer.",
      answer: "String - неизменяемый (immutable) класс, каждая операция создает новый объект. StringBuilder - изменяемый класс для эффективной работы со строками в однопотоковой среде. StringBuffer - аналог StringBuilder, но потокобезопасный (synchronized). StringBuilder быстрее StringBuffer, но не потокобезопасен."
    },
    {
      question: "Что такое полиморфизм в Java? Приведите пример.",
      answer: "Полиморфизм - способность объектов разных классов отвечать на одинаковые сообщения по-разному. В Java реализуется через переопределение методов и интерфейсы. Пример: Animal animal = new Dog(); animal.makeSound(); - вызовется метод makeSound() именно класса Dog, хотя переменная имеет тип Animal."
    }
  ],
  [Difficulty.MIDDLE]: [
    {
      question: "Объясните работу сборщика мусора в Java. Какие алгоритмы сборки мусора вы знаете?",
      answer: "Сборщик мусора автоматически освобождает память от недостижимых объектов. Основные алгоритмы: Serial GC (однопоточный), Parallel GC (многопоточный), G1GC (низкие паузы), ZGC и Shenandoah (сверхнизкие паузы). Память делится на поколения: Young (Eden, S0, S1) и Old Generation. Объекты сначала создаются в Eden, затем перемещаются в Survivor Space, и наконец в Old Generation."
    },
    {
      question: "Что такое ConcurrentHashMap и чем он отличается от HashMap и Hashtable?",
      answer: "ConcurrentHashMap - потокобезопасная реализация Map для многопоточной среды. Отличия: HashMap не потокобезопасен, Hashtable полностью синхронизирован (медленный), ConcurrentHashMap использует сегментированную блокировку. В Java 8+ ConcurrentHashMap использует CAS-операции и блокировку на уровне узлов, что обеспечивает высокую производительность в многопоточной среде."
    },
    {
      question: "Объясните принципы работы ThreadLocal в Java.",
      answer: "ThreadLocal предоставляет переменные, локальные для потока - каждый поток имеет свою копию переменной. Используется для хранения контекстной информации (например, соединения с БД, пользовательские сессии). Важно вызывать remove() для предотвращения утечек памяти. Реализация основана на ThreadLocalMap внутри каждого Thread."
    },
    {
      question: "Что такое Stream API в Java 8? Приведите примеры использования.",
      answer: "Stream API - функциональный подход к обработке коллекций. Позволяет выполнять операции фильтрации, преобразования, агрегации в декларативном стиле. Пример: list.stream().filter(x -> x > 10).map(x -> x * 2).collect(Collectors.toList()). Операции делятся на промежуточные (lazy) и терминальные. Поддерживает параллельную обработку через parallelStream()."
    },
    {
      question: "Объясните паттерн Singleton и его реализации в Java.",
      answer: "Singleton обеспечивает создание единственного экземпляра класса. Реализации: 1) Eager initialization (статическая инициализация), 2) Lazy initialization (проверка на null), 3) Thread-safe lazy (synchronized), 4) Double-checked locking, 5) Enum singleton (рекомендуемый). Enum автоматически обеспечивает потокобезопасность и защиту от рефлексии и сериализации."
    }
  ],
  [Difficulty.SENIOR]: [
    {
      question: "Объясните модель памяти Java (JMM) и проблемы видимости в многопоточности.",
      answer: "Java Memory Model определяет, как потоки взаимодействуют через память. Каждый поток имеет локальную память (кэш), изменения могут быть не видны другим потокам. Проблемы: visibility, atomicity, ordering. Решения: volatile (гарантирует видимость), synchronized (монопольный доступ), happens-before отношения. Final поля видны всем потокам после конструктора. Atomic классы используют CAS для lock-free операций."
    },
    {
      question: "Как работает ClassLoader в Java? Объясните иерархию и процесс загрузки классов.",
      answer: "ClassLoader загружает классы в JVM. Иерархия: Bootstrap (системные классы), Extension/Platform (расширения), Application (classpath). Принцип delegation: сначала родительский загрузчик. Этапы: Loading (чтение байткода), Linking (verification, preparation, resolution), Initialization (статические блоки). Можно создавать custom ClassLoader для hot-reload, изоляции, загрузки из нестандартных источников."
    },
    {
      question: "Объясните различные виды ссылок в Java: strong, weak, soft, phantom.",
      answer: "Strong reference - обычные ссылки, объект не может быть собран GC. Weak reference - позволяет GC собрать объект, используется в WeakHashMap, кэшах. Soft reference - собирается при нехватке памяти, подходит для кэшей. Phantom reference - уведомляет о сборке объекта, используется для cleanup. ReferenceQueue позволяет отслеживать собранные weak/soft/phantom ссылки."
    },
    {
      question: "Что такое Fork/Join Framework? Как работает work-stealing алгоритм?",
      answer: "Fork/Join Framework для параллельных вычислений по принципу divide-and-conquer. ForkJoinTask разделяется на подзадачи (fork), затем результаты объединяются (join). Work-stealing: каждый поток имеет deque задач, при нехватке работы 'крадет' задачи у других потоков. RecursiveTask возвращает результат, RecursiveAction - void. Эффективен для CPU-intensive задач с рекурсивной декомпозицией."
    },
    {
      question: "Объясните принципы работы JIT-компилятора в HotSpot JVM.",
      answer: "JIT (Just-In-Time) компилятор оптимизирует часто выполняемый байткод в нативный код. HotSpot профилирует выполнение, выявляет 'горячие' участки кода. C1 (client) - быстрая компиляция с базовыми оптимизациями, C2 (server) - агрессивные оптимизации. Tiered compilation использует оба. Оптимизации: inlining, loop unrolling, escape analysis, dead code elimination. Deoptimization откатывает оптимизации при изменении условий."
    }
  ]
};

// Функция для получения моковых вопросов
export function getMockQuestions(difficulty: Difficulty, count: number = 5): GeneratedQuestion[] {
  const questions = JAVA_MOCK_QUESTIONS[difficulty] || [];
  return questions.slice(0, count);
} 