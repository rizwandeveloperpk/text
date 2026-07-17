import { ProfileContent } from '@/components/profile/ProfileContent';

// See app/dashboard/layout.tsx for why this is force-dynamic — /profile is
// a standalone route (not nested under the dashboard layout), so it needs
// its own copy of this route-segment config rather than inheriting it.
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return <ProfileContent />;
}
