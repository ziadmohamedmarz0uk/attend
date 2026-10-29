import React from 'react';
import {
  Calendar,
  Check,
  Clock,
  Loader2,
  X,
  Activity,
  MapPin,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export default function OwnerOverviewTab({
  pendingLeaves = [],
  overviewLeavesPage = 1,
  setOverviewLeavesPage,
  ITEMS_PER_PAGE = 5,
  handleReviewLeave,
  leaveProcessingId = null,
  recentLogs = [],
  recentLogsPage = 1,
  setRecentLogsPage,
  employees = [],
  handleQuickBonusDisburse,
  openOverrideModal,
  setActiveTab
}) {
  const leavesTotalPages = Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE) || 1;
  const logsTotalPages = Math.ceil(recentLogs.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
      {/* LEFT & CENTER COLUMNS (2 cols): Pending Leave Requests & Live Logs */}
      <div className="lg:col-span-2 space-y-5">
        {/* 1. PENDING LEAVES CARD */}
        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_18px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
                <Calendar className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                  طلبات الإجازات بانتظار الاعتماد
                </h3>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">
                  اعتماد الإجازات يفعّل الحصانة التلقائية ضد احتساب الغياب أو النقاط الحمراء
                </p>
              </div>
            </div>

            {pendingLeaves.length > 0 && (
              <span className="text-xs font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200/80 tabular-nums">
                {pendingLeaves.length} طلب قيد المراجعة
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5">
            {pendingLeaves.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-zinc-200/70 border-dashed bg-zinc-50/50 space-y-2">
                <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <h4 className="text-xs font-semibold text-zinc-900">
                  لا توجد طلبات إجازة معلقة حالياً
                </h4>
                <p className="text-[11px] text-zinc-500 font-normal">
                  جميع طلبات الإجازات المقدمة تمت معالجتها وتحديث السجلات.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingLeaves
                  .slice(
                    (overviewLeavesPage - 1) * ITEMS_PER_PAGE,
                    overviewLeavesPage * ITEMS_PER_PAGE
                  )
                  .map((leave) => (
                    <div
                      key={leave.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Monogram */}
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {leave.user?.name ? leave.user.name[0] : 'م'}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-950 group-hover:text-black truncate">
                              {leave.user?.name || 'موظف'}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                              {leave.leave_type || 'إجازة اعتيادية'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-normal">
                            <span className="flex items-center gap-1 font-mono tabular-nums">
                              <Clock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />{' '}
                              {leave.start_date}
                              {leave.end_date && leave.end_date !== leave.start_date
                                ? ` إلى ${leave.end_date}`
                                : ''}
                            </span>
                            {leave.reason && (
                              <span className="truncate border-r border-zinc-200 pr-3">
                                {leave.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleReviewLeave(leave.id, 'approved')}
                          disabled={leaveProcessingId === leave.id}
                          className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {leaveProcessingId === leave.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                          ) : (
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          )}
                          <span>اعتماد</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewLeave(leave.id, 'rejected')}
                          disabled={leaveProcessingId === leave.id}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            {pendingLeaves.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 text-xs text-zinc-500">
                <span className="tabular-nums">
                  صفحة <strong className="text-zinc-950 font-semibold">{overviewLeavesPage}</strong>{' '}
                  من {leavesTotalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOverviewLeavesPage((prev) => Math.max(prev - 1, 1))}
                    disabled={overviewLeavesPage === 1}
                    className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    <span>السابق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOverviewLeavesPage((prev) => Math.min(prev + 1, leavesTotalPages))
                    }
                    disabled={overviewLeavesPage === leavesTotalPages}
                    className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. LIVE GPS TELEMETRY LOGS */}
        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_18px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
                <Activity className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                    رادار تسجيلات الحضور اللحظية (Live GPS Telemetry)
                  </h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">
                  بث لحظي مباشر للحضور والانصراف مع فحص Haversine للتثبت الجغرافي
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              تزامن فوري
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50/90 text-zinc-500 border-b border-zinc-200/80 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-5 font-semibold">الموظف</th>
                  <th className="py-3 px-4 font-semibold">وقت التسجيل</th>
                  <th className="py-3 px-4 font-semibold">تصنيف النقطة</th>
                  <th className="py-3 px-4 font-semibold text-center">الموقع الجغرافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {recentLogs.length > 0 ? (
                  recentLogs
                    .slice((recentLogsPage - 1) * ITEMS_PER_PAGE, recentLogsPage * ITEMS_PER_PAGE)
                    .map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-zinc-50/80 transition-colors group duration-150"
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-medium text-xs flex items-center justify-center shrink-0">
                              {log.user?.name ? log.user.name[0] : 'م'}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-950 text-xs group-hover:text-black">
                                {log.user?.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-normal">
                                {log.user?.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-700 font-mono text-xs tabular-nums">
                          {log.check_in_time}
                        </td>
                        <td className="py-3 px-4">
                          {log.point_type === 'green' || log.point_type === 'early_green' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200/70 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              نقطة خضراء (+1)
                            </span>
                          ) : log.point_type === 'red' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 font-semibold text-xs border border-rose-200/70 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              نقطة حمراء (-1)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-white font-semibold text-xs border border-zinc-900 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                              نقطة سوداء
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-zinc-950 transition-colors font-medium text-xs bg-white hover:bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 shadow-2xs group/link"
                          >
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-zinc-900" strokeWidth={1.75} />
                            <span>عرض الخريطة</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                          </a>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-zinc-500 text-xs font-normal">
                      لا توجد تسجيلات حضور حتى اللحظة لليوم.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Logs Pagination */}
          {recentLogs.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
              <span className="tabular-nums">
                صفحة <strong className="text-zinc-950 font-semibold">{recentLogsPage}</strong> من{' '}
                {logsTotalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRecentLogsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={recentLogsPage === 1}
                  className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>السابق</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecentLogsPage((prev) => Math.min(prev + 1, logsTotalPages))}
                  disabled={recentLogsPage === logsTotalPages}
                  className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN (1 col): Executive Quick Actions & Top Personnel */}
      <div className="space-y-5">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_18px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                الإجراءات والقرارات الفورية
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                صرف مكافآت مباشرة أو تعديل أرصدة ونقاط الموظفين
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {employees.slice(0, 5).map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between bg-zinc-50/70 border border-zinc-200/80 p-3 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-2xs group"
              >
                <div className="overflow-hidden min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                      {emp.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 tabular-nums font-mono">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {emp.green_points}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {emp.red_points}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-900 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                      {emp.black_points}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickBonusDisburse(emp)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    title="صرف مكافأة استثنائية فورية"
                  >
                    <Award className="w-3 h-3 text-zinc-300" strokeWidth={1.75} />
                    <span>بونص</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverrideModal(emp)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-2xs"
                    title="تعديل يدوي إداري للنقاط والرصيد"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-zinc-500" strokeWidth={1.75} />
                    <span>تعديل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className="w-full text-center py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-xs font-semibold text-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>عرض وإدارة جميع الموظفين ({employees.length}) &larr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
