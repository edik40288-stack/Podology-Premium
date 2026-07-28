export type ContentItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  asset?: string;
  icon?: string;
  price?: string;
  duration?: string;
  role?: string;
  experience?: string;
  mapUrl?: string;
  panoramaUrl?: string;
  buttonText?: string;
  color?: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HeroBlock = {
  greetingTemplate: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  backgroundImageUrl: string;
};

export type ExpertBlock = {
  title: string;
  subtitle: string;
  description: string;
  address: string;
  mapUrl: string;
  buttonText: string;
  backgroundColor: string;
  backgroundImageUrl: string;
};

export type ContentSection = {
  title: string;
  description: string;
  items: ContentItem[];
};

export type InteriorSection = ContentSection & {
  panoramas: ContentItem[];
};

export type HomeContentPayload = {
  brandName: string;
  topHero: HeroBlock;
  expertBlock: ExpertBlock;
  about: ContentSection;
  certificates: ContentSection;
  interior: InteriorSection;
  works: ContentSection;
  services: ContentSection;
  specialists: ContentSection;
  profile: ContentSection;
};

export type TextFieldKey =
  | 'topHero.greetingTemplate'
  | 'topHero.title'
  | 'topHero.subtitle'
  | 'topHero.backgroundColor'
  | 'topHero.backgroundImageUrl'
  | 'expertBlock.title'
  | 'expertBlock.subtitle'
  | 'expertBlock.description'
  | 'expertBlock.address'
  | 'expertBlock.mapUrl'
  | 'expertBlock.buttonText'
  | 'expertBlock.backgroundColor'
  | 'expertBlock.backgroundImageUrl'
  | 'about.title'
  | 'about.description'
  | 'certificates.title'
  | 'certificates.description'
  | 'interior.title'
  | 'interior.description'
  | 'works.title'
  | 'works.description'
  | 'services.title'
  | 'services.description'
  | 'specialists.title'
  | 'specialists.description'
  | 'profile.title'
  | 'profile.description';

export type ItemSectionKey =
  | 'about.items'
  | 'certificates.items'
  | 'interior.items'
  | 'interior.panoramas'
  | 'works.items'
  | 'services.items'
  | 'specialists.items'
  | 'profile.items';

export type ItemFieldKey =
  | 'title'
  | 'subtitle'
  | 'description'
  | 'imageUrl'
  | 'asset'
  | 'icon'
  | 'price'
  | 'duration'
  | 'role'
  | 'experience'
  | 'mapUrl'
  | 'panoramaUrl'
  | 'buttonText'
  | 'color';

export const textFieldLabels: Record<TextFieldKey, string> = {
  'topHero.greetingTemplate': 'Приветствие на главном экране',
  'topHero.title': 'Верхний заголовок',
  'topHero.subtitle': 'Верхнее описание',
  'topHero.backgroundColor': 'Цвет верхнего блока',
  'topHero.backgroundImageUrl': 'Картинка верхнего блока',
  'expertBlock.title': 'Заголовок блока эксперта',
  'expertBlock.subtitle': 'Подзаголовок блока эксперта',
  'expertBlock.description': 'Описание блока эксперта',
  'expertBlock.address': 'Адрес',
  'expertBlock.mapUrl': 'Ссылка на карту',
  'expertBlock.buttonText': 'Текст кнопки карты',
  'expertBlock.backgroundColor': 'Цвет блока эксперта',
  'expertBlock.backgroundImageUrl': 'Фон-картинка блока эксперта',
  'about.title': 'Название раздела “О центре”',
  'about.description': 'Описание раздела “О центре”',
  'certificates.title': 'Название раздела “Сертификаты”',
  'certificates.description': 'Описание раздела “Сертификаты”',
  'interior.title': 'Название раздела “Интерьер”',
  'interior.description': 'Описание раздела “Интерьер”',
  'works.title': 'Название раздела “Наши работы”',
  'works.description': 'Описание раздела “Наши работы”',
  'services.title': 'Название раздела “Услуги”',
  'services.description': 'Описание раздела “Услуги”',
  'specialists.title': 'Название раздела “Специалисты”',
  'specialists.description': 'Описание раздела “Специалисты”',
  'profile.title': 'Название раздела “Профиль”',
  'profile.description': 'Описание раздела “Профиль”',
};

export const itemSectionLabels: Record<ItemSectionKey, string> = {
  'about.items': 'О центре',
  'certificates.items': 'Сертификаты',
  'interior.items': 'Фото интерьера',
  'interior.panoramas': '360° обзоры',
  'works.items': 'Наши работы',
  'services.items': 'Услуги',
  'specialists.items': 'Специалисты',
  'profile.items': 'Разделы профиля',
};
