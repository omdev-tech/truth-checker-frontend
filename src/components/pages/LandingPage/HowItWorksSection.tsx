'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { HowItWorksSectionProps } from '@/lib/types/landing';
import { useTranslation } from 'react-i18next';

/**
 * Icon mapping for process steps
 */
const iconMap = {
  Upload,
  Brain,
  CheckCircle,
} as const;

/**
 * How It Works Section Component
 * Shows the 3-step process with clear visual flow
 * Emphasizes simplicity and speed
 */
export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  const { t } = useTranslation(['dashboard']);
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Upload;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Define static steps with translation keys
  const translatedSteps = [
    {
      id: 'upload',
      step: 1,
      title: t('dashboard:howItWorks.steps.upload.title'),
      description: t('dashboard:howItWorks.steps.upload.description'),
      icon: 'Upload'
    },
    {
      id: 'analyze',
      step: 2,
      title: t('dashboard:howItWorks.steps.analyze.title'),
      description: t('dashboard:howItWorks.steps.analyze.description'),
      icon: 'Brain'
    },
    {
      id: 'results',
      step: 3,
      title: t('dashboard:howItWorks.steps.results.title'),
      description: t('dashboard:howItWorks.steps.results.description'),
      icon: 'CheckCircle'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
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
              {t('dashboard:howItWorks.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('dashboard:howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {translatedSteps.map((step, index) => {
              const IconComponent = getIcon(step.icon);
              const isLastStep = index === translatedSteps.length - 1;
              
              return (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="text-center group">
                    {/* Step Number & Icon */}
                    <div className="relative mb-6">
                      {/* Background Circle */}
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      
                      {/* Step Number Badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>

                    {/* Step Content */}
                    <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow Connector (Desktop only) */}
                  {!isLastStep && (
                    <div className="hidden md:block absolute top-10 left-full w-full z-10 pointer-events-none">
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                        viewport={{ once: true }}
                      >
                        <ArrowRight className="h-6 w-6 text-primary/40 -ml-6" />
                      </motion.div>
                    </div>
                  )}

                  {/* Mobile Arrow (below each step except last) */}
                  {!isLastStep && (
                    <motion.div
                      className="md:hidden flex justify-center mt-8"
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <ArrowRight className="h-6 w-6 text-primary/40 rotate-90" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Process Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{t('dashboard:howItWorks.metrics.processingTime')}</div>
              <div className="text-sm text-muted-foreground">{t('dashboard:howItWorks.metrics.processingTimeLabel')}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{t('dashboard:howItWorks.metrics.accuracyRate')}</div>
              <div className="text-sm text-muted-foreground">{t('dashboard:howItWorks.metrics.accuracyLabel')}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{t('dashboard:howItWorks.metrics.availability')}</div>
              <div className="text-sm text-muted-foreground">{t('dashboard:howItWorks.metrics.availabilityLabel')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 