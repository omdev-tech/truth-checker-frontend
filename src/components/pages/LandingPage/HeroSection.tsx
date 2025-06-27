'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Shield, Microscope, ExternalLink } from 'lucide-react';
import { HeroSectionProps } from '@/lib/types/landing';
import { useTranslation } from 'react-i18next';

/**
 * Hero Section Component
 * Compelling landing page hero with animations and clear CTAs
 * Follows conversion optimization best practices
 */
export function HeroSection({ onTryDemo, onSignUp }: HeroSectionProps) {
  const { t } = useTranslation(['common', 'dashboard']);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const trustIndicators = [
    { icon: Zap, text: t('dashboard:features.textAnalysis.title') },
    { icon: Shield, text: t('dashboard:features.mediaUpload.title') },
    { icon: CheckCircle, text: t('common:general.confidence') }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('dashboard:hero.title')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
          >
            {t('dashboard:hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t('dashboard:hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              size="lg"
              onClick={onTryDemo}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {t('common:actions.tryAgain')}
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/gallery'}
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              Browse Gallery
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={onSignUp}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              {t('common:navigation.signup')}
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 md:gap-12"
          >
            {trustIndicators.map((indicator, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <indicator.icon className="h-5 w-5 text-primary" />
                <span className="text-sm md:text-base font-medium">
                  {indicator.text}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Stand up for Science Badge */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute top-32 right-8 hidden lg:block z-20"
      >
        <a
          href="https://www.standupforscience.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          {/* Floating Card */}
          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30">
            {/* Header with icon and badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Microscope className="h-4 w-4 text-primary" />
                </div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            {/* Movement text */}
            <div className="text-left">
              <div className="text-sm font-bold text-primary leading-tight tracking-wide">
                STAND UP
              </div>
              <div className="text-xs text-muted-foreground/80 leading-none">
                FOR
              </div>
              <div className="text-sm font-bold text-primary leading-tight tracking-wide">
                SCIENCE
              </div>
            </div>
          </div>
        </a>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full p-1">
          <motion.div
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mx-auto"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
} 