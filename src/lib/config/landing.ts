import { LandingPageConfig } from '@/lib/types/landing';

/**
 * Landing Page Content Configuration
 * Centralized content management following DRY principle
 * Easy to modify content without touching components
 */
export const LANDING_PAGE_CONFIG: LandingPageConfig = {
  hero: {
    title: "Get to know the truth",
    subtitle: "Verify claims. Fight misinformation. Defend truth.",
    description: "AI-powered fact-checking for text, audio, video, and live streams. Get instant verification with transparent sources and scientific accuracy.",
    primaryCTA: "Try Truth Checker",
    secondaryCTA: "Sign Up with Google"
  },

  features: [
    {
      id: 'multi-format',
      title: 'Multi-Format Support',
      description: 'Fact-check text, audio, video, and live streams with advanced AI processing.',
      icon: 'FileText',
      benefits: [
        'Text document analysis',
        'Audio transcription & verification',
        'Video content fact-checking',
        'Real-time stream monitoring'
      ]
    },
    {
      id: 'real-time',
      title: 'Real-Time Processing',
      description: 'Get instant fact-checking results with our optimized AI pipeline.',
      icon: 'Zap',
      benefits: [
        'Sub-second response times',
        'Live stream monitoring',
        'Batch processing support',
        'Real-time notifications'
      ]
    },
    {
      id: 'transparent-sources',
      title: 'Source Transparency',
      description: 'Every fact-check comes with verifiable sources and methodology.',
      icon: 'Shield',
      benefits: [
        'Credible source citations',
        'Methodology transparency',
        'Confidence scoring',
        'Audit trail tracking'
      ]
    },
    {
      id: 'scientific-method',
      title: 'Scientific Methodology',
      description: 'Built on peer-reviewed research and scientific fact-checking standards.',
      icon: 'Microscope',
      benefits: [
        'Evidence-based verification',
        'Peer-reviewed methods',
        'Bias detection algorithms',
        'Continuous model improvement'
      ]
    }
  ],

  howItWorks: [
    {
      id: 'upload',
      step: 1,
      title: 'Upload Content',
      description: 'Submit text, upload files, or provide URLs for streams and videos.',
      icon: 'Upload'
    },
    {
      id: 'analyze',
      step: 2,
      title: 'AI Analysis',
      description: 'Our AI extracts claims and cross-references with verified sources.',
      icon: 'Brain'
    },
    {
      id: 'verify',
      step: 3,
      title: 'Get Results',
      description: 'Receive detailed fact-check results with sources and confidence scores.',
      icon: 'CheckCircle'
    }
  ],

  trust: [
    {
      id: 'accuracy',
      value: '94%',
      label: 'Accuracy Rate',
      description: 'Verified against human fact-checkers'
    },
    {
      id: 'sources',
      value: '10,000+',
      label: 'Verified Sources',
      description: 'Credible databases and publications'
    },
    {
      id: 'claims',
      value: '1M+',
      label: 'Claims Processed',
      description: 'Fact-checks completed successfully'
    },
    {
      id: 'response-time',
      value: '< 10s',
      label: 'Average Response',
      description: 'Lightning-fast fact verification'
    }
  ],

  cta: {
    title: "Ready to Stand Up for Science?",
    description: "Join thousands of users fighting misinformation with evidence-based fact-checking.",
    primaryButton: "Get Started Free",
    secondaryButton: "Try Demo"
  }
};

/**
 * Guest Session Configuration
 */
export const GUEST_CONFIG = {
  MAX_USAGE: 3,
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  FEATURES_ALLOWED: ['text'] as const,
} as const;

/**
 * Navigation Configuration
 */
export const NAVIGATION_CONFIG = {
  logo: {
    text: "Truth Checker",
    icon: "Search"
  },
  links: [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
    { id: 'trust', label: 'Trust & Safety', href: '#trust' },
  ],
  actions: {
    signIn: 'Sign In',
    getStarted: 'Get Started'
  }
} as const; 