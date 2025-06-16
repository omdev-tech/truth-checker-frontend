import { MainPageTemplate } from '@/components/templates/MainPageTemplate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function FactCheckerApp() {
  return (
    <ProtectedRoute requireAuth={false}>
      <MainPageTemplate />
    </ProtectedRoute>
  );
} 