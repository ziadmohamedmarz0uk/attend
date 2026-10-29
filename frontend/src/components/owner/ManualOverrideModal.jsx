import React from 'react';
import { ShieldCheck, X, Loader2 } from 'lucide-react';

export default function ManualOverrideModal({
  overrideModal,
  setOverrideModal,
  handleSubmitOverride
}) {
  if (!overrideModal.isOpen || !overrideModal.employee) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
      />
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-150 border border-zinc-200 shadow-2xl">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 id="override-modal-title" className="text-sm font-bold text-zinc-950">
                تعديل إداري وتوثيق رصيد
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                للموظف: <strong className="text-zinc-900">{overrideModal.employee.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmitOverride} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="override-amount-egp" className="text-xs font-semibold text-zinc-700 block">
                إضافة أو خصم مالي (ج.م)
              </label>
              <input
                id="override-amount-egp"
                type="number"
                step="0.01"
                value={overrideModal.amountEgp}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, amountEgp: e.target.value }))
                }
                placeholder="مثال: 500 (مكافأة) أو -250 (خصم)"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 outline-none shadow-2xs transition-all font-mono"
              />
              <p className="text-[10px] text-zinc-500 font-normal mt-0.5">
                القيمة الموجبة للإضافة، والسالبة (-) للخصم من المحفظة المالية.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="override-add-green" className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>تعديل النقاط الخضراء</span>
              </label>
              <input
                id="override-add-green"
                type="number"
                value={overrideModal.addGreen}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, addGreen: e.target.value }))
                }
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none shadow-2xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="override-add-red" className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>تعديل النقاط الحمراء</span>
              </label>
              <input
                id="override-add-red"
                type="number"
                value={overrideModal.addRed}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, addRed: e.target.value }))
                }
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none shadow-2xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="override-add-black" className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>تعديل النقاط السوداء</span>
              </label>
              <input
                id="override-add-black"
                type="number"
                value={overrideModal.addBlack}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, addBlack: e.target.value }))
                }
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none shadow-2xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="override-add-early" className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>تعديل التعويض المبكر</span>
              </label>
              <input
                id="override-add-early"
                type="number"
                value={overrideModal.addEarlyCredits}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, addEarlyCredits: e.target.value }))
                }
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none shadow-2xs font-mono"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label htmlFor="override-reason" className="text-xs font-semibold text-zinc-700 block">
                سبب ومبرر القرار الإداري (يؤرشف رسمياً)
              </label>
              <textarea
                id="override-reason"
                required
                rows={2}
                value={overrideModal.reason}
                onChange={(e) =>
                  setOverrideModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="اكتب مبرر هذا التعديل بوضوح لتوثيقه في سجل الرقابة والتدقيق..."
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg p-3 text-xs text-zinc-900 outline-none shadow-2xs transition-all font-normal"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              إلغاء الأمر
            </button>
            <button
              type="submit"
              disabled={overrideModal.isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {overrideModal.isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              ) : null}
              <span>اعتماد وتوثيق التعديل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
