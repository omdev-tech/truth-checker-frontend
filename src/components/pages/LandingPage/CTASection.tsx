'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Zap } from 'lucide-react';
import { CTASectionProps } from '@/lib/types/landing';
import { LANDING_PAGE_CONFIG } from '@/lib/config/landing';

/**
 * CTA Section Component
 * Final conversion opportunity with social proof and urgency
 * Follows conversion optimization best practices
 */
export function CTASection({ onGetStarted, onTryDemo }: CTASectionProps) {
  const { cta } = LANDING_PAGE_CONFIG;

  const socialProofItems = [
    { icon: Users, text: "10,000+ active users" },
    { icon: Star, text: "4.9/5 user rating" },
    { icon: Zap, text: "2M+ claims verified" }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main CTA */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {cta.title}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {cta.description}
          </p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
            >
              {cta.primaryButton}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={onTryDemo}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              {cta.secondaryButton}
            </Button>
          </motion.div>

          {/* Social Proof */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12"
          >
            {socialProofItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm md:text-base font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
 */}
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            
            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>3 free fact-checks included</span>
            </div>
            
            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Upgrade anytime</span>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
} 