export const VERIFICATION_STATUS_CONFIG = {
  true: {
    label: 'True',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: '✓',
  },
  false: {
    label: 'False',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: '✗',
  },
  partially_true: {
    label: 'Partially True',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: '◐',
  },
  misleading: {
    label: 'Misleading',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: '⚠',
  },
  unverifiable: {
    label: 'Unverifiable',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: '?',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: '⚡',
  },
} as const;

export const CONFIDENCE_CONFIG = {
  high: {
    label: 'High Confidence',
    color: 'text-green-600 dark:text-green-400',
    value: 100,
  },
  medium: {
    label: 'Medium Confidence',
    color: 'text-yellow-600 dark:text-yellow-400',
    value: 66,
  },
  low: {
    label: 'Low Confidence',
    color: 'text-orange-600 dark:text-orange-400',
    value: 33,
  },
  insufficient: {
    label: 'Insufficient Data',
    color: 'text-gray-600 dark:text-gray-400',
    value: 10,
  },
} as const;

export const SUPPORTED_FILE_TYPES = {
  text: ['.txt', '.md', '.doc', '.docx'],
  audio: ['.wav', '.mp3', '.m4a', '.ogg', '.webm'],
  video: ['.mp4', '.avi', '.mov', '.webm'],
} as const;

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_TEXT_LENGTH = 10000; // 10k characters 