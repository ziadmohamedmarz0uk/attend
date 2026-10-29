'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, LayoutDashboard, LogOut } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">
            تعذر تحميل بيانات لوحة التحكم
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            حدث خطأ أثناء الاتصال بالخادم أو جلب بيانات الحضور الحية. بياناتك وموقعك بأمان ولم تتأثر أي سجلات.
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 truncate">
            معرف الخطأ: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تحميل اللوحة</span>
          </button>

          <Link
            href="/login"
            className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
