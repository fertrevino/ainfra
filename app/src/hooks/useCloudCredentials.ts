import { useState, useEffect } from 'react';
import { CloudCredentials } from '@/types';
// import { supabase } from '@/supabaseClient';

interface UseCloudCredentialsReturn {
  credentials: CloudCredentials[];
  hasCredentials: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCloudCredentials(): UseCloudCredentialsReturn {
  const [credentials, setCredentials] = useState<CloudCredentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = async () => {
    // try {
    //   setLoading(true);
    //   setError(null);

    //   const session = await supabase.auth.getSession();
    //   const accessToken = session.data.session?.access_token;
    //   const userId = session.data.session?.user?.id;

    //   if (!accessToken) {
    //     setCredentials([]);
    //     return;
    //   }

    //   if (!userId) {
    //     console.warn('[useCloudCredentials] No user_id found in session');
    //     setError('No user_id found in session');
    //     setCredentials([]);
    //     setLoading(false);
    //     return;
    //   }

    //   const url = `/api/cloud-credentials?user_id=${encodeURIComponent(userId)}`;
    //   const response = await fetch(url, {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });
    //   console.log('Fetching cloud credentials:', { url, status: response.status });

    //   if (!response.ok) {
    //     throw new Error('Failed to fetch credentials');
    //   }

    //   const data = await response.json();
    //   setCredentials(data.credentials || []);
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'Unknown error');
    //   setCredentials([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return {
    credentials,
    hasCredentials: credentials.length > 0,
    loading,
    error,
    refetch: fetchCredentials,
  };
}
