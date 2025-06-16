'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  X, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface GuestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

/**
 * Simplified Access Modal Component
 * Now only offers Google sign-in since users can try the fact-checker on the landing page
 */
export function GuestAccessModal({ 
  isOpen, 
  onClose, 
  onSignUp 
}: GuestAccessModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignUp = async () => {
    setIsProcessing(true);
    try {
      onSignUp();
      onClose();
    } catch (error) {
      console.error('Sign-up error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>

              <DialogTitle className="text-xl font-semibold">
                Ready to get to know the truth?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Value Proposition */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-4"
              >
                <p className="text-muted-foreground">
                  Join thousands of users fighting misinformation with unlimited AI-powered fact-checking.
                </p>

                <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Get Full Access</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Unlimited fact-checking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All media formats (text, audio, video)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Save your fact-check history</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time stream processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Priority processing</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3"
              >
                <Button 
                  onClick={handleSignUp}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 group h-12"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Sign Up with Google - Free
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Close button */}
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Maybe Later
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-2"
              >
                <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
                  <span>✓ No credit card required</span>
                  <span>✓ Instant access</span>
                  <span>✓ Cancel anytime</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Already tried our fact-checker? Time to unlock the full power!
                </p>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 