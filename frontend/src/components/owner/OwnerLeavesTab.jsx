import React from 'react';
import {
  Calendar,
  Check,
  Clock,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OwnerLeavesTab({
  pendingLeaves = [],
  leavesPage = 1,
  setLeavesPage,
  ITEMS_PER_PAGE = 5,
  handleReviewLeave,
  leaveProcessingId = null
}) {
  const totalPages = Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (leavesPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeaves = pendingLeaves.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_-4px_rgba(0,0,0,0.03)] p-5 space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                إدارة اعتمادات الإجازات والمعافاة
              </h3>
              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80 tabular-nums">
                {pendingLeaves.length} طلب معلق
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              اعتماد الإجازات يمنح الموظف حصانة إدارية تلقائية ضد احتساب الغياب أو النقاط الحمراء
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {pendingLeaves.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-zinc-200/70 border-dashed bg-zinc-50/50 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          </div>
          <h4 className="text-xs font-semibold text-zinc-900">
            لا توجد طلبات إجازة معلقة للمراجعة
          </h4>
          <p className="text-[11px] text-zinc-500 font-normal">
            كافة طلبات الإجازات المقدمة تمت معالجتها بانتظام.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLeaves.map((leave) => (
            <div
              key={leave.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Monogram */}
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
                  {leave.user?.name ? leave.user.name[0] : 'م'}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-black truncate">
                      {leave.user?.name || 'موظف'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                      {leave.user?.department || 'عام'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {leave.leave_type || 'إجازة اعتيادية'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 font-normal">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-zinc-700 bg-white px-2 py-0.5 rounded-md border border-zinc-200/80 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
                      <span>{leave.start_date}</span>
                      <span className="text-zinc-400">←</span>
                      <span>{leave.end_date}</span>
                    </span>

                    {leave.reason && (
                      <span className="text-zinc-600 truncate border-r border-zinc-200 pr-3">
                        سبب الإجازة: <span className="text-zinc-900 font-medium">{leave.reason}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => handleReviewLeave(leave.id, 'approved')}
                  disabled={leaveProcessingId === leave.id}
                  className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
                >
                  {leaveProcessingId === leave.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  )}
                  <span>قبول واعتماد</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewLeave(leave.id, 'rejected')}
                  disabled={leaveProcessingId === leave.id}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>رفض الطلب</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pendingLeaves.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs text-zinc-600">
          <span className="tabular-nums font-normal">
            عرض <strong className="text-zinc-950">{startIndex + 1}</strong> إلى{' '}
            <strong className="text-zinc-950">
              {Math.min(startIndex + ITEMS_PER_PAGE, pendingLeaves.length)}
            </strong>{' '}
            من أصل <strong className="text-zinc-950">{pendingLeaves.length}</strong> طلب
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLeavesPage((prev) => Math.max(prev - 1, 1))}
              disabled={leavesPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>السابق</span>
            </button>

            <span className="text-xs font-normal text-zinc-500 tabular-nums px-2">
              صفحة <strong className="text-zinc-950 font-semibold">{leavesPage}</strong> من{' '}
              {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setLeavesPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={leavesPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
