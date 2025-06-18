import { PlansPageTemplate } from '@/components/templates/PlansPageTemplate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PlansPage() {
  return (
    <ProtectedRoute>
      <PlansPageTemplate />
    </ProtectedRoute>
  );
}
 
export const metadata = {
  title: 'Subscription Plans - Truth Checker',
  description: 'Choose the perfect plan for your fact-checking needs. Flexible pricing for individuals and teams.',
}; 