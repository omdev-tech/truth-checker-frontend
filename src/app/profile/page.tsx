import { ProfilePageTemplate } from '@/components/templates/ProfilePageTemplate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageTemplate />
    </ProtectedRoute>
  );
}

export const metadata = {
  title: 'Profile - Truth Checker',
  description: 'Manage your account, view usage statistics, and update your subscription plan.',
}; 