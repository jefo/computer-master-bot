export interface Order {
    id: string;
    title: string;
    description: string;
    budget: string;
    skills: string[];
}

export interface Specialist {
    id: string;
    name: string;
    profession: string;
    experience: string;
    rate: string;
    city: string;
    tags: string[];
    portfolio: string;
    about: string;
}

export interface Client {
    id: string;
    name: string;
    company: string;
    description: string;
    contactEmail: string;
}

export const MOCK_ORDERS: Order[] = [
    {
        id: 'order_1',
        title: 'Разработка UI/UX для мобильного приложения',
        description: 'Требуется опытный UI/UX дизайнер для создания интуитивно понятного и привлекательного интерфейса мобильного приложения для стартапа в сфере финтеха.',
        budget: 'от 80 000 руб.',
        skills: ['UI/UX', 'Figma', 'Mobile Design', 'Prototyping']
    },
    {
        id: 'order_2',
        title: 'Монтаж видеоролика для YouTube-канала',
        description: 'Нужен видеомонтажер для регулярного создания динамичных видеороликов для образовательного YouTube-канала. Работа с исходниками, добавление графики, звука.',
        budget: '5 000 руб. за ролик',
        skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Sound Design']
    },
    {
        id: 'order_3',
        title: 'Создание логотипа и фирменного стиля',
        description: 'Разработка уникального логотипа и полного фирменного стиля для новой кофейни. Требуется креативный подход и понимание трендов.',
        budget: '40 000 руб.',
        skills: ['Logo Design', 'Branding', 'Illustrator', 'Photoshop']
    },
    {
        id: 'order_4',
        title: 'Написание текстов для сайта (копирайтинг)',
        description: 'Требуется копирайтер для написания продающих текстов для нового корпоративного сайта. Тематика: IT-услуги. Опыт в SEO-копирайтинге приветствуется.',
        budget: '2 000 руб. за 1000 знаков',
        skills: ['Copywriting', 'SEO', 'Marketing', 'IT']
    },
    {
        id: 'order_5',
        title: 'Разработка чат-бота для поддержки клиентов',
        description: 'Нужен разработчик для создания чат-бота на базе Telegram для автоматизации ответов на часто задаваемые вопросы и маршрутизации запросов.',
        budget: 'от 60 000 руб.',
        skills: ['Python', 'Node.js', 'Telegram API', 'NLP']
    },
    {
        id: 'order_6',
        title: 'Создание 3D-модели персонажа для игры',
        description: 'Требуется 3D-моделлер для создания детализированного персонажа для инди-игры в жанре фэнтези. Опыт работы с Blender или Maya обязателен.',
        budget: '50 000 руб.',
        skills: ['3D Modeling', 'Blender', 'Maya', 'Character Design']
    }
];

export const MOCK_SPECIALISTS: Specialist[] = [
    {
        id: 'spec_1',
        name: 'Иван Петров',
        profession: 'UI/UX Дизайнер',
        experience: '5 лет',
        rate: 'от 2500 руб/час',
        city: 'Москва',
        tags: ['web', 'uiux', 'figma', 'landing'],
        portfolio: 'behance.net/ivan',
        about: 'Делаю конверсионные лендинги и интерфейсы для стартапов. Помогаю бизнесу говорить с пользователем на одном языке.'
    },
    {
        id: 'spec_2',
        name: 'Мария Смирнова',
        profession: 'Видеомонтажер',
        experience: '3 года',
        rate: 'от 1500 руб/час',
        city: 'Санкт-Петербург',
        tags: ['video', 'premiere', 'youtube', 'motion'],
        portfolio: 'youtube.com/masha_edit',
        about: 'Создаю динамичные и цепляющие видеоролики для блогов и бизнеса. Быстро, качественно, с душой.'
    },
    {
        id: 'spec_3',
        name: 'Алексей Козлов',
        profession: 'Графический Дизайнер',
        experience: '7 лет',
        rate: 'от 3000 руб/час',
        city: 'Екатеринбург',
        tags: ['logo', 'branding', 'illustrator', 'print'],
        portfolio: 'dribbble.com/alex_design',
        about: 'Разрабатываю уникальные логотипы и фирменные стили, которые выделяют ваш бренд. От идеи до реализации.'
    },
    {
        id: 'spec_4',
        name: 'Елена Новикова',
        profession: 'Копирайтер',
        experience: '4 года',
        rate: 'от 1000 руб/1000 знаков',
        city: 'Новосибирск',
        tags: ['copywriting', 'seo', 'marketing', 'texts'],
        portfolio: 'textbroker.ru/elena_copy',
        about: 'Пишу продающие и вовлекающие тексты для сайтов, блогов и соцсетей. Увеличиваю конверсию и лояльность клиентов.'
    },
    {
        id: 'spec_5',
        name: 'Дмитрий Волков',
        profession: 'Разработчик Telegram-ботов',
        experience: '6 лет',
        rate: 'от 3500 руб/час',
        city: 'Казань',
        tags: ['python', 'telegram', 'bots', 'backend'],
        portfolio: 'github.com/dmitry_bots',
        about: 'Создаю умных и эффективных Telegram-ботов для бизнеса любой сложности. От идеи до запуска.'
    },
    {
        id: 'spec_6',
        name: 'Анна Морозова',
        profession: '3D-моделлер',
        experience: '2 года',
        rate: 'от 2000 руб/час',
        city: 'Краснодар',
        tags: ['3d', 'blender', 'maya', 'characters'],
        portfolio: 'artstation.com/anna_3d',
        about: 'Воплощаю идеи в объемные формы. Создаю реалистичные и стилизованные 3D-модели для игр и визуализаций.'
    }
];

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'client_1',
        name: 'ООО "Инновации"',
        company: 'Инновации',
        description: 'Мы ищем талантливых фрилансеров для наших проектов в сфере IT и маркетинга.',
        contactEmail: 'hr@innovations.com'
    }
];
