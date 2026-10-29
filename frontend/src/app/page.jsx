'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'owner') {
          router.replace('/dashboard/owner');
        } else {
          router.replace('/dashboard/employee');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        <p className="text-slate-600 text-sm font-bold">جاري تحميل نظام الحضور والرواتب الذكي...</p>
      </div>
    </div>
  );
}
