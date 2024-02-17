'use client';
import { useEffect } from 'react';
import { Loading } from 'react-basics';
import { useRouter, useSearchParams } from 'next/navigation';
import { setClientAuthToken } from 'lib/client';
import { Suspense } from 'react';

export default function SSOPage() {
  const router = useRouter();
  const search = useSearchParams();
  const url = search.get('url');
  const token = search.get('token');

  useEffect(() => {
    if (url && token) {
      setClientAuthToken(token);

      router.push(url);
    }
  }, [router, url, token]);

  return (
    <Suspense>
      <Loading />
    </Suspense>
  );
}
