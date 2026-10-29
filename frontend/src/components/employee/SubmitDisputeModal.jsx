import React from 'react';
import { AlertTriangle, X, Loader2, Send } from 'lucide-react';

export default function SubmitDisputeModal({
  isOpen,
  onClose,
  disputeForm = { penaltyType: 'red_point', incidentDate: '', reason: '', isSubmitting: false },
  setDisputeForm,
  handleSubmitDispute
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-modal-title"
      className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-zinc-950 shadow-2xl relative space-y-6 dir-rtl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="dispute-modal-title" className="text-base font-bold text-zinc-900 flex items-center gap-2">
                تقديم تظلم واعتراض رسمي
              </h3>
              <p className="text-xs text-zinc-500 font-medium">سيتم توجيه التظلم فوراً للوحة الإدارة للاعتماد</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitDispute} className="space-y-4 text-right">
          {/* Penalty Type Select */}
          <div className="space-y-1.5">
            <label htmlFor="penalty-type" className="text-xs font-semibold text-zinc-700 block">
              اختر نوع الجزاء المراد التظلم عليه <span className="text-rose-600">*</span>
            </label>
            <select
              id="penalty-type"
              value={disputeForm.penaltyType}
              onChange={(e) => setDisputeForm((prev) => ({ ...prev, penaltyType: e.target.value }))}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors"
            >
              <option value="red_point">نقطة حمراء (تأخير حضور)</option>
              <option value="black_point">نقطة سوداء (خصم غياب)</option>
              <option value="gps_issue">خلل أو انقطاع في إشارة الـ GPS</option>
              <option value="lateness">خصم تأخير مروري طارئ</option>
            </select>
          </div>

          {/* Date of Incident */}
          <div className="space-y-1.5">
            <label htmlFor="incident-date" className="text-xs font-semibold text-zinc-700 block">
              تاريخ الواقعة أو المخالفة <span className="text-rose-600">*</span>
            </label>
            <input
              id="incident-date"
              type="date"
              value={disputeForm.incidentDate}
              onChange={(e) => setDisputeForm((prev) => ({ ...prev, incidentDate: e.target.value }))}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors dir-rtl"
            />
          </div>

          {/* Detailed Reason Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="dispute-reason" className="text-xs font-semibold text-zinc-700 block">
              سبب التظلم والتوضيح التفصيلي <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="dispute-reason"
              rows={4}
              value={disputeForm.reason}
              onChange={(e) => setDisputeForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="اكتب التبرير بالتفصيل (مثل: تأخير بسبب حادث بالطريق الدائري، انقطاع تغطية الشبكة عند بوابة الشركة...)"
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors leading-relaxed font-medium"
            />
          </div>

          {/* Form Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={disputeForm.isSubmitting}
              className="flex-1 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {disputeForm.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري إرسال التظلم للإدارة...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>إرسال التظلم والاعتراض للإدارة</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
