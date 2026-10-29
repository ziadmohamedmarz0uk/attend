import React from 'react';
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  History,
  CheckCircle2
} from 'lucide-react';

export default function OwnerAuditTab({
  auditLogs = [],
  auditPage = 1,
  setAuditPage,
  AUDITS_PER_PAGE = 10
}) {
  const totalPages = Math.ceil(auditLogs.length / AUDITS_PER_PAGE) || 1;
  const startIndex = (auditPage - 1) * AUDITS_PER_PAGE;
  const paginatedAudits = auditLogs.slice(startIndex, startIndex + AUDITS_PER_PAGE);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_-4px_rgba(0,0,0,0.03)] p-5 space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <History className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                سجل الرقابة والقرارات التنفيذية (Audit Logs)
              </h3>
              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80 tabular-nums">
                {auditLogs.length} عملية موثقة
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              تتبع زمني مشفر لجميع القرارات الإدارية، صرف المكافآت، والتعديلات المالية
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {auditLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-zinc-200/70 border-dashed bg-zinc-50/50 space-y-2">
            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400 shadow-2xs">
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h4 className="text-xs font-semibold text-zinc-900">
              لا توجد عمليات رقابية مسجلة حتى الآن
            </h4>
            <p className="text-[11px] text-zinc-500 font-normal">
              سيتم تسجيل أي إجراء أو تعديل مالي بصورة تلقائية في هذا السجل.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedAudits.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-900 uppercase bg-white px-2.5 py-0.5 rounded-md border border-zinc-200/90 shadow-2xs">
                        {log.action}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                        {new Date(log.created_at).toLocaleString('ar-EG', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-700 bg-white px-2.5 py-0.5 rounded-md border border-zinc-200/80 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.75} />
                      <span>المنفذ:</span>
                      <strong className="text-zinc-950 font-semibold">{log.performed_by}</strong>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-zinc-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-zinc-200/60 shadow-2xs">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {auditLogs.length > AUDITS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                <span className="tabular-nums font-normal">
                  عرض <strong className="text-zinc-950">{startIndex + 1}</strong> إلى{' '}
                  <strong className="text-zinc-950">
                    {Math.min(startIndex + AUDITS_PER_PAGE, auditLogs.length)}
                  </strong>{' '}
                  من أصل <strong className="text-zinc-950">{auditLogs.length}</strong> عملية
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuditPage((prev) => Math.max(prev - 1, 1))}
                    disabled={auditPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>السابق</span>
                  </button>

                  <span className="text-xs font-normal text-zinc-500 tabular-nums px-2">
                    صفحة <strong className="text-zinc-950 font-semibold">{auditPage}</strong> من{' '}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setAuditPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={auditPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
