import React from 'react';
import {
  AlertTriangle,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  MapPin,
  XCircle,
  ShieldCheck
} from 'lucide-react';

export default function EmployeeDisputesTab({
  disputesList = [],
  disputesLoading = false,
  setIsDisputeModalOpen
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] space-y-6 text-zinc-950 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                نظام التظلمات والاعتراضات السريع
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-mono font-medium">
                Disputes
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              تقديم اعتراض فوري على النقاط الحمراء أو السوداء أو أعطال الـ GPS لمراجعتها من قبل الإدارة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDisputeModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>تقديم تظلم جديد</span>
        </button>
      </div>

      {/* SKELETON LOADING STATE */}
      {disputesLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 rounded-xl border border-zinc-200"></div>
          ))}
        </div>
      ) : disputesList.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs font-medium">
          لا توجد طلبات اعتراض أو تظلمات مسجلة حتى الآن.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap text-zinc-700">رقم التظلم</th>
                <th className="py-3 px-4 whitespace-nowrap text-zinc-700">نوع الجزاء</th>
                <th className="py-3 px-4 whitespace-nowrap text-zinc-700">تاريخ الواقعة</th>
                <th className="py-3 px-4 text-zinc-700">سبب التظلم والاعتراض</th>
                <th className="py-3 px-4 whitespace-nowrap text-center text-zinc-700">حالة الاعتراض</th>
                <th className="py-3 px-4 text-zinc-700">رد الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 font-medium text-zinc-800 bg-white">
              {disputesList.map((ticket) => {
                let penaltyBadge = (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>نقطة حمراء (تأخير)</span>
                  </span>
                );
                if (ticket.penalty_type === 'black_point') {
                  penaltyBadge = (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-900 text-white border border-zinc-800 inline-flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>نقطة سوداء (غياب)</span>
                    </span>
                  );
                } else if (ticket.penalty_type === 'gps_issue') {
                  penaltyBadge = (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>مشكلة بالـ GPS</span>
                    </span>
                  );
                } else if (ticket.penalty_type === 'lateness') {
                  penaltyBadge = (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>خصم تأخير</span>
                    </span>
                  );
                }

                let statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                    <span>قيد المراجعة</span>
                  </span>
                );
                if (ticket.status === 'accepted') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>تم القبول ومسح الخصم</span>
                    </span>
                  );
                } else if (ticket.status === 'rejected') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>مرفوض</span>
                    </span>
                  );
                }

                return (
                  <tr key={ticket.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      <span className="font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold text-[11px] tabular-nums">
                        {ticket.ticket_code || `DISP-${ticket.id}-2026`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      {penaltyBadge}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono tabular-nums">{ticket.incident_date}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      <div className="text-zinc-900 font-medium text-xs max-w-xs sm:max-w-md leading-relaxed">
                        &quot;{ticket.reason}&quot;
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                      {statusBadge}
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      {ticket.admin_response ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-[11px] font-medium flex items-start gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ticket.admin_response}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px] italic">بانتظار رد مدير الفرع...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
