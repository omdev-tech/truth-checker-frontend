export interface HeroSectionProps {
  onTryDemo: () => void;
  onSignUp: () => void;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface TrustMetric {
  id: string;
  value: string;
  label: string;
  description: string;
}

export interface FeaturesSectionProps {
  features: FeatureItem[];
}

export interface HowItWorksSectionProps {
  steps: ProcessStep[];
}

export interface TrustSectionProps {
  metrics: TrustMetric[];
}

export interface CTASectionProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
}

export interface GuestSession {
  id: string;
  usageCount: number;
  maxUsage: number;
  startTime: Date;
  expiresAt: Date;
}

export interface LandingPageProps {
  className?: string;
}

// Landing page content configuration
export interface LandingPageConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  features: FeatureItem[];
  howItWorks: ProcessStep[];
  trust: TrustMetric[];
  cta: {
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
} 