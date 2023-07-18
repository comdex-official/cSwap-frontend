import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function _error() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, []);

  return null;
}
