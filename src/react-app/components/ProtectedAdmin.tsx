import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedAdminProps = {
  children: ReactNode;
};

export default function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('blogAdminToken');

    if (sessionStorage.getItem('adminAuth') !== 'true' || !token) {
      setStatus('denied');
      return () => { cancelled = true; };
    }

    const apiBase = window.location.hostname.includes('netlify.app')
      ? 'https://emigration-pro.aiservices4biz.workers.dev'
      : '';

    fetch(`${apiBase}/api/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Session expired');
        if (!cancelled) setStatus('allowed');
      })
      .catch(() => {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('blogAdminToken');
        if (!cancelled) setStatus('denied');
      });

    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
        <p>Verifying your admin session…</p>
      </div>
    );
  }

  if (status === 'denied') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/system-login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
