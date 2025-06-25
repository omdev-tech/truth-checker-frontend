'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Zap, 
  Shield, 
  Microscope,
  CheckCircle,
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeaturesSectionProps } from '@/lib/types/landing';
import { useTranslation } from 'react-i18next';

/**
 * Icon mapping for dynamic icon rendering
 * Maintains type safety while allowing flexible icon usage
 */
const iconMap = {
  FileText,
  Zap,
  Shield,
  Microscope,
  CheckCircle,
} as const;

/**
 * Features Section Component
 * Showcases key product features with animations and clear benefits
 * Uses cards for better visual hierarchy
 */
export function FeaturesSection({ features }: FeaturesSectionProps) {
  const { t } = useTranslation(['dashboard']);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || FileText;
  };

  // Define static features with translation keys
  const translatedFeatures = [
    {
      id: 'multi-format',
      title: t('dashboard:features.textAnalysis.title'),
      description: t('dashboard:features.textAnalysis.description'),
      icon: 'FileText',
      benefits: t('dashboard:features.textAnalysis.benefits', { returnObjects: true }) as string[]
    },
    {
      id: 'real-time',
      title: t('dashboard:features.mediaUpload.title'),
      description: t('dashboard:features.mediaUpload.description'),
      icon: 'Zap',
      benefits: t('dashboard:features.mediaUpload.benefits', { returnObjects: true }) as string[]
    },
    {
      id: 'transparent-sources',
      title: t('dashboard:features.liveStreams.title'),
      description: t('dashboard:features.liveStreams.description'),
      icon: 'Shield',
      benefits: t('dashboard:features.liveStreams.benefits', { returnObjects: true }) as string[]
    },
    {
      id: 'scientific-method',
      title: t('dashboard:features.liveRecording.title'),
      description: t('dashboard:features.liveRecording.description'),
      icon: 'Microscope',
      benefits: t('dashboard:features.liveRecording.benefits', { returnObjects: true }) as string[]
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('dashboard:features.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('dashboard:features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {translatedFeatures.map((feature) => {
            const IconComponent = getIcon(feature.icon);
            
            return (
              <motion.div key={feature.id} variants={cardVariants}>
                <Card className="h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-background/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {feature.benefits.map((benefit, index) => (
                        <div 
                          key={index}
                          className="flex items-center space-x-3 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            {t('dashboard:features.cta')}
          </p>
          <div className="inline-flex items-center space-x-2 text-primary font-medium">
            <span>{t('dashboard:features.tryNow')}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
} 