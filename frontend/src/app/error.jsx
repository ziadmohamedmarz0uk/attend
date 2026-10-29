'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled Root Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900">
            عذراً، حدث خطأ غير متوقع
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            واجه النظام مشكلة طارئة أثناء معالجة الصفحة. تم تسجيل الخطأ ويمكنك إعادة المحاولة بأمان.
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
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/login"
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
