import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans dir-rtl relative animate-pulse">
      {/* Right Sidebar Skeleton */}
      <aside className="hidden md:flex fixed top-0 bottom-0 right-0 w-64 bg-white border-l border-slate-200 p-5 flex-col justify-between z-40">
        <div className="space-y-6">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-2.5 bg-slate-100 rounded w-32" />
            </div>
          </div>

          {/* User Badge Skeleton */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-300" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-20" />
              <div className="h-2.5 bg-slate-200 rounded w-16" />
            </div>
          </div>

          {/* Nav Skeleton */}
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-xl border border-slate-200/60" />
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="h-9 bg-slate-100 rounded-xl" />
          <div className="h-9 bg-slate-100 rounded-xl" />
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 md:mr-64 min-h-screen flex flex-col">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1.5">
            <div className="h-5 bg-slate-200 rounded w-44" />
            <div className="h-3 bg-slate-100 rounded w-60" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-28 bg-emerald-50 rounded-full border border-emerald-200" />
            <div className="h-8 w-32 bg-slate-100 rounded-full border border-slate-200" />
          </div>
        </header>

        {/* Body Grid Skeleton */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-96 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-44 bg-slate-100 rounded-2xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100" />
                    <div className="h-4 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Lower Section Skeleton */}
          <div className="h-80 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl border border-slate-200" />
              ))}
            </div>
            <div className="h-44 bg-slate-50 rounded-xl border border-slate-200" />
          </div>
        </main>
      </div>
    </div>
  );
}
