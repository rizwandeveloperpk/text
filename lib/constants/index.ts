export const FREE_CONVERSION_LIMIT = 2;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const GUEST_USAGE_STORAGE_KEY = 'htr_guest_usage';

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  profile: '/profile',
  dashboard: '/dashboard',
  history: '/dashboard/history',
  favorites: '/dashboard/favorites',
  settings: '/dashboard/settings',
  billing: '/dashboard/billing',
  newConversion: '/dashboard/new',
  admin: '/admin',
};

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out, no card required.',
    features: [
      '2 free conversions',
      'Copy & download as TXT',
      'Standard OCR speed',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For students, writers, and researchers.',
    features: [
      'Unlimited conversions',
      'Unlimited history',
      'Priority OCR processing',
      'PDF export',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
];

export const FAQ_ITEMS = [
  {
    question: 'How accurate is the handwriting recognition?',
    answer:
      'Our AI is tuned specifically for handwritten English, preserving structure like paragraphs, bullet points, and numbering. Where a word truly cannot be read, it is marked instead of guessed.',
  },
  {
    question: 'What image formats can I upload?',
    answer: 'JPG, JPEG, PNG, and WEBP files up to 10 MB each.',
  },
  {
    question: 'Do I need an account to try it?',
    answer:
      'No. You get 2 free conversions as a guest. After that, a free account keeps your history saved and unlocks more credits.',
  },
  {
    question: 'Can I export my converted text?',
    answer: 'Yes — copy it directly, download as a .txt file, or export as a PDF on the Pro plan.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Your images and extracted text are stored securely and are only ever visible to your account.',
  },
];

export const QUALITY_OPTIONS = [
  { value: 'fast', label: 'Fast', temperature: 0.4 },
  { value: 'balanced', label: 'Balanced quality', temperature: 0.15 },
  { value: 'high', label: 'High accuracy', temperature: 0 },
] as const;

export const LANGUAGE_HINT_OPTIONS = [
  { value: 'auto', label: 'Auto detect' },
  { value: 'English', label: 'English' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
] as const;
