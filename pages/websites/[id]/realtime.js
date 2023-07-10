import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import RealtimeDashboard from 'components/pages/realtime/RealtimeDashboard';

export default function () {
  const router = useRouter();
  const { id: websiteId } = router.query;

  if (!websiteId) {
    return null;
  }

  return (
    <AppLayout>
      <RealtimeDashboard websiteId={websiteId} />
    </AppLayout>
  );
}
