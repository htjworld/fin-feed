import { Suspense } from 'react';
import FinFeedApp from '@/components/FinFeedApp';

export default function Page() {
  return (
    <Suspense>
      <FinFeedApp />
    </Suspense>
  );
}
