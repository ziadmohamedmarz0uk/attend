import React from 'react';
import {
  Send,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function EmployeeLeavesTab({
  leaveForm = { startDate: '', endDate: '', reason: '', isSubmitting: false },
  setLeaveForm,
  handleSubmitLeave,
  leavesList = []
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-zinc-950">
      {/* Submit Leave Form */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">تقديم طلب إجازة رسمي</h3>
            <p className="text-[11px] text-zinc-500">الإجازات المعتمدة تمنح حصانة كاملة ضد خصومات الحضور</p>
          </div>
        </div>

        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="leave-start-date" className="block text-xs font-semibold text-zinc-700">
              تاريخ البداية:
            </label>
            <input
              id="leave-start-date"
              type="date"
              required
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full bg-zinc-50/70 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-xs text-zinc-900 outline-none font-semibold transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leave-end-date" className="block text-xs font-semibold text-zinc-700">
              تاريخ النهاية:
            </label>
            <input
              id="leave-end-date"
              type="date"
              required
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full bg-zinc-50/70 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-xs text-zinc-900 outline-none font-semibold transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leave-reason" className="block text-xs font-semibold text-zinc-700">
              سبب الإجازة:
            </label>
            <textarea
              id="leave-reason"
              required
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="اكتب سبب طلب الإجازة باختصار..."
              className="w-full bg-zinc-50/70 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl p-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none resize-none font-medium transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={leaveForm.isSubmitting}
            className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {leaveForm.isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>إرسال طلب الإجازة للاعتماد</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Leave Requests History */}
      <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900">
              سجل طلبات الإجازة السابقة والحالية
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            تحديث مباشر
          </span>
        </div>

        {leavesList.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs font-medium">
            لم تقم بتقديم طلبات إجازة سابقة حتى الآن.
          </div>
        ) : (
          <div className="space-y-3">
            {leavesList.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 flex items-center justify-between gap-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-mono tabular-nums text-zinc-800">
                      من {leave.start_date} إلى {leave.end_date}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 italic leading-relaxed">&quot;{leave.reason}&quot;</p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${
                    leave.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : leave.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {leave.status === 'approved' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  {leave.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  {leave.status !== 'approved' && leave.status !== 'rejected' && (
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>
                    {leave.status === 'approved'
                      ? 'مقبولة (حصانة مفعلة)'
                      : leave.status === 'rejected'
                      ? 'مرفوضة'
                      : 'بانتظار القرار'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
