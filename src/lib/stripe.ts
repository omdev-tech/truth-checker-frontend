import { loadStripe, Stripe } from '@stripe/stripe-js';

// Singleton pattern to ensure Stripe is only loaded once
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Redirect to Stripe Checkout
 * This is typically called when the user clicks "Upgrade Plan"
 */
export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }
  
  const { error } = await stripe.redirectToCheckout({
    sessionId: sessionId,
  });
  
  if (error) {
    console.error('Stripe checkout error:', error);
    throw new Error(error.message || 'An error occurred during checkout');
  }
};

/**
 * Check if we're returning from a successful payment
 * This can be used on the success page to show appropriate messaging
 */
export const getCheckoutSessionFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('session_id');
};

/**
 * Check if payment was cancelled
 */
export const wasPaymentCancelled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('payment') === 'cancelled';
};

/**
 * Check if payment was successful
 */
export const wasPaymentSuccessful = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('payment') === 'success';
}; 