import React from 'react';
import {
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function OwnerDisputesTab({
  disputesList = [],
  disputesPage = 1,
  setDisputesPage,
  ITEMS_PER_PAGE = 5,
  handleReviewDispute
}) {
  const totalPages = Math.ceil(disputesList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (disputesPage - 1) * ITEMS_PER_PAGE;
  const paginatedDisputes = disputesList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_-4px_rgba(0,0,0,0.03)] p-5 space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                إدارة التظلمات والاعتراضات الإدارية
              </h3>
              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80 tabular-nums">
                {disputesList.length} تظلم مسجل
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              مراجعة اعتراضات الموظفين على تسجيلات التأخير أو الخصم والبت فيها بقرارات نافذة
            </p>
          </div>
        </div>
      </div>

      {disputesList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-zinc-200/70 border-dashed bg-zinc-50/50 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          </div>
          <h4 className="text-xs font-semibold text-zinc-900">
            لا توجد تظلمات أو اعتراضات مسجلة حالياً
          </h4>
          <p className="text-[11px] text-zinc-500 font-normal">
            كافة اعتراضات الموظفين تم البت فيها وتسوية السجلات.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200/80 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5 font-semibold">الموظف والبيانات الوظيفية</th>
                <th className="py-3 px-4 whitespace-nowrap font-semibold">نوع الجزاء وتاريخه</th>
                <th className="py-3 px-4 font-semibold">المبرر والسبب المقدم</th>
                <th className="py-3 px-4 whitespace-nowrap text-center font-semibold">حالة التظلم</th>
                <th className="py-3 px-4 text-center font-semibold">إجراء الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {paginatedDisputes.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="py-3.5 px-5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {ticket.user?.name ? ticket.user.name[0] : 'م'}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-950 text-xs group-hover:text-black">
                          {ticket.user?.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-normal">
                          {ticket.user?.department || 'عام'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      {ticket.penalty_type === 'red_point' ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          نقطة تأخير (-1)
                        </span>
                      ) : ticket.penalty_type === 'gps_issue' ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                          تعذر إشارة GPS
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-white border border-zinc-900 inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          نقطة غياب سوداء
                        </span>
                      )}
                      <div className="text-[10px] text-zinc-500 font-mono tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                        <span>{ticket.incident_date}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-middle">
                    <div className="text-zinc-700 font-normal text-xs leading-relaxed bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-200/70 max-w-sm shadow-2xs">
                      &quot;{ticket.reason}&quot;
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                    {ticket.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        بانتظار القرار
                      </span>
                    ) : ticket.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        تم قبول التظلم
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/70 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        تم الرفض
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center align-middle">
                    {ticket.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReviewDispute(ticket.id, 'accepted')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>قبول وإلغاء الجزاء</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewDispute(ticket.id, 'rejected')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>رفض</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 font-normal">
                        {ticket.admin_response || 'تم اتخاذ الإجراء واعتماده'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {disputesList.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs text-zinc-600">
          <span className="tabular-nums font-normal">
            عرض <strong className="text-zinc-950">{startIndex + 1}</strong> إلى{' '}
            <strong className="text-zinc-950">
              {Math.min(startIndex + ITEMS_PER_PAGE, disputesList.length)}
            </strong>{' '}
            من أصل <strong className="text-zinc-950">{disputesList.length}</strong> تظلم
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDisputesPage((prev) => Math.max(prev - 1, 1))}
              disabled={disputesPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>السابق</span>
            </button>

            <span className="text-xs font-normal text-zinc-500 tabular-nums px-2">
              صفحة <strong className="text-zinc-950 font-semibold">{disputesPage}</strong> من{' '}
              {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setDisputesPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={disputesPage === totalPages}
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
