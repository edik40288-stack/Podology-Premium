import 'package:podology_premium_client/src/models/client_models.dart';

final demoServices = <ServiceItem>[
  const ServiceItem(
    id: 1001,
    title: 'Подологическая обработка',
    subtitle: 'Аккуратный уход за стопами и ногтями',
    price: 'от 2500 ₽',
    duration: '60 мин',
    iconText: '🦶',
    category: 'Подология',
  ),
  const ServiceItem(
    id: 1002,
    title: 'Обработка проблемного ногтя',
    subtitle: 'Деликатная работа со сложными зонами',
    price: 'от 1500 ₽',
    duration: '40 мин',
    iconText: '✨',
    category: 'Ногти',
  ),
  const ServiceItem(
    id: 1003,
    title: 'Консультация специалиста',
    subtitle: 'Осмотр, рекомендации и план ухода',
    price: 'от 1000 ₽',
    duration: '30 мин',
    iconText: '💬',
    category: 'Консультация',
  ),
];

final demoSpecialists = <SpecialistItem>[
  const SpecialistItem(
    id: 2001,
    name: 'Александра Куцытой',
    role: 'Специалист-подолог',
    experience: 'Опытный специалист центра',
    description: 'Премиальный уход, внимательная работа и индивидуальные рекомендации.',
    imageSource: '',
  ),
  const SpecialistItem(
    id: 2002,
    name: 'Специалист центра',
    role: 'Подолог',
    experience: 'Профессиональный уход',
    description: 'Аккуратная работа, комфортная атмосфера и понятный план ухода.',
    imageSource: '',
  ),
];

final demoHomeContent = HomeContent(
  brandName: 'PODOLOG KUTSYTOI',
  topHero: const HeroBlock(
    greetingTemplate: 'Здравствуйте',
    title: 'Премиальный подологический центр',
    subtitle: 'Запись, услуги, специалисты и чат с центром в одном приложении.',
    backgroundColor: '#FAF8F1',
    backgroundImageUrl: '',
  ),
  expertBlock: const ExpertBlock(
    title: 'Центр подологии',
    subtitle: 'Профессиональный уход',
    description: 'Комфортный приём, понятная запись и связь с центром через приложение.',
    address: 'Адрес центра уточняйте у администратора',
    mapUrl: '',
    buttonText: 'Открыть карту',
    backgroundColor: '#E6F4E6',
    backgroundImageUrl: '',
  ),
  about: const ContentSection(title: 'О центре', description: 'Премиальный сервис для клиентов.', items: []),
  certificates: const ContentSection(title: 'Сертификаты', description: 'Документы специалистов.', items: []),
  interior: const InteriorSection(title: 'Интерьер', description: 'Атмосфера центра.', items: [], panoramas: []),
  works: const ContentSection(title: 'Работы', description: 'Примеры работ центра.', items: []),
  services: const ContentSection(title: 'Услуги', description: 'Выберите подходящую услугу центра.', items: []),
  specialists: const ContentSection(title: 'Специалисты', description: 'Команда центра.', items: []),
  profile: const ContentSection(title: 'Профиль', description: 'Данные клиента и настройки.', items: []),
);
