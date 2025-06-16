'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock } from 'lucide-react';
import { TrustSectionProps } from '@/lib/types/landing';

/**
 * Icon mapping for trust metrics
 */
const iconMap = {
  accuracy: Award,
  sources: Shield,
  claims: Users,
  'response-time': Clock,
} as const;

/**
 * Trust Section Component
 * Builds credibility with metrics and transparency
 * Addresses user concerns about AI reliability
 */
export function TrustSection({ metrics }: TrustSectionProps) {
  const getIcon = (metricId: string) => {
    const IconComponent = iconMap[metricId as keyof typeof iconMap];
    return IconComponent || Shield;
  };

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

  const metricVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="trust" className="py-24 bg-muted/30">
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
            Trust &
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Transparency
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our commitment to scientific accuracy and transparency in AI-powered fact-checking. 
            Every result is backed by verifiable sources and rigorous methodology.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {metrics.map((metric) => {
            const IconComponent = getIcon(metric.id);
            
            return (
              <motion.div
                key={metric.id}
                variants={metricVariants}
                className="text-center group"
              >
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border/50 group-hover:border-primary/20 transition-all duration-300 group-hover:shadow-lg">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {metric.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {metric.label}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {metric.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Scientific Method */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Scientific Method</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on peer-reviewed research and established fact-checking methodologies 
                used by professional journalists and researchers.
              </p>
            </div>

            {/* Open Source */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Source Transparency</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every fact-check includes detailed source citations and confidence scores. 
                Our methodology is transparent and continuously audited.
              </p>
            </div>

            {/* Continuous Improvement */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Community Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our models are continuously improved through expert feedback and 
                community contributions from fact-checkers worldwide.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to verify with confidence?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Join thousands of users who trust our AI-powered fact-checking to 
              separate truth from misinformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span className="text-sm text-muted-foreground">✓ No credit card required</span>
              <span className="text-sm text-muted-foreground">✓ Free trial included</span>
              <span className="text-sm text-muted-foreground">✓ Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 