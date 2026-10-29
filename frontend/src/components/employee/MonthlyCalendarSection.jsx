import React from 'react';
import {
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function MonthlyCalendarSection({
  monthName = 'أكتوبر 2026',
  calendarStats = { green_count: 0, red_count: 0, black_count: 0, leave_count: 0 },
  calendarLoading = false,
  fetchMonthlyHistory,
  firstDayOffset = 0,
  monthlyHistory = [],
  selectedDay,
  setSelectedDay
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] space-y-6 text-zinc-950 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                سجل الحضور الشهري والأرشيف
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono font-semibold">
                {monthName}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">أرشيف شهري يعرض السلوك والانضباط وحالة الـ GPS اليومية</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchMonthlyHistory && fetchMonthlyHistory()}
          disabled={calendarLoading}
          className="px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-all flex items-center gap-2 border border-zinc-200 cursor-pointer disabled:opacity-60 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calendarLoading ? 'animate-spin text-zinc-950' : 'text-zinc-500'}`} />
          <span>تحديث التقييم الشهري</span>
        </button>
      </div>

      {/* Monthly Summary KPI Banner Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>حضور مبكر (سليم)</span>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-900 tabular-nums">
            {calendarStats?.green_count || 0} يوم
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>تأخيرات (حمراء)</span>
          </div>
          <span className="text-sm font-bold font-mono text-amber-900 tabular-nums">
            {calendarStats?.red_count || 0} يوم
          </span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>غياب (سوداء)</span>
          </div>
          <span className="text-sm font-bold font-mono text-rose-900 tabular-nums">
            {calendarStats?.black_count || 0} يوم
          </span>
        </div>

        <div className="bg-zinc-100/70 border border-zinc-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-700">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>إجازات وعطلات</span>
          </div>
          <span className="text-sm font-bold font-mono text-zinc-900 tabular-nums">
            {calendarStats?.leave_count || 0} يوم
          </span>
        </div>
      </div>

      {/* SKELETON LOADING STATE */}
      {calendarLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-zinc-100 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded-xl border border-zinc-200"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Weekday Columns Header (RTL starting from Saturday) */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-500 pb-2 border-b border-zinc-100">
              <div>السبت</div>
              <div>الأحد</div>
              <div>الإثنين</div>
              <div>الثلاثاء</div>
              <div>الأربعاء</div>
              <div>الخميس</div>
              <div>الجمعة</div>
            </div>

            {/* Days Grid with Padding Offset */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty Offset Padding Cells for Correct Weekday Alignment */}
              {Array.from({ length: firstDayOffset }).map((_, emptyIdx) => (
                <div
                  key={`empty-${emptyIdx}`}
                  className="p-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 opacity-40 min-h-[64px]"
                />
              ))}

              {/* Actual Calendar Month Days */}
              {monthlyHistory.map((dayItem) => {
                const isSelected = selectedDay && selectedDay.day === dayItem.day;

                // Styled Day Cell Tokens
                let bgStyle = 'bg-zinc-50/60 border-zinc-200/70 text-zinc-600 hover:bg-zinc-100/80';
                let statusDot = 'bg-zinc-300';
                let statusBadgeText = '';

                if (dayItem.status === 'green') {
                  bgStyle = 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950 hover:bg-emerald-100/80';
                  statusDot = 'bg-emerald-500 animate-pulse';
                  statusBadgeText = dayItem.check_in || 'مبكر';
                } else if (dayItem.status === 'red') {
                  bgStyle = 'bg-amber-50/60 border-amber-200/80 text-amber-950 hover:bg-amber-100/80';
                  statusDot = 'bg-amber-500';
                  statusBadgeText = 'تأخير';
                } else if (dayItem.status === 'black') {
                  bgStyle = 'bg-rose-50/60 border-rose-200/80 text-rose-950 hover:bg-rose-100/80';
                  statusDot = 'bg-rose-500';
                  statusBadgeText = 'غياب';
                } else if (dayItem.status === 'leave') {
                  bgStyle = 'bg-cyan-50/60 border-cyan-200/80 text-cyan-950 hover:bg-cyan-100/80';
                  statusDot = 'bg-cyan-500';
                  statusBadgeText = 'إجازة';
                } else if (dayItem.status === 'weekend') {
                  bgStyle = 'bg-zinc-50/40 border-zinc-200/50 text-zinc-400 hover:bg-zinc-100/50';
                  statusDot = 'bg-zinc-300';
                  statusBadgeText = 'عطلة';
                }

                return (
                  <button
                    type="button"
                    key={dayItem.day}
                    onClick={() => setSelectedDay(dayItem)}
                    className={`p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between min-h-[66px] transition-all relative text-right group cursor-pointer ${bgStyle} ${
                      isSelected
                        ? 'ring-2 ring-zinc-950 border-zinc-950 scale-[1.03] z-10 shadow-md bg-white'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 tabular-nums">
                        {dayItem.day}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                    </div>
                    <div className="text-[10px] font-medium truncate mt-1 text-zinc-600">
                      {statusBadgeText || dayItem.day_name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend (مفتاح التوضيح - Zero Emojis) */}
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-700">حضور مبكر وسليم (التزام)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-zinc-700">تأخير بعد 10 ص (نقطة حمراء)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-zinc-700">غياب بدون عذر (نقطة سوداء)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-zinc-700">إجازة معتمدة / عطلة رسمية</span>
              </div>
            </div>
          </div>

          {/* Selected Day Details Card (Right 1 Column) */}
          <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            {selectedDay ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                    <div>
                      <span className="text-[11px] text-zinc-500 font-medium block">تفاصيل السجل لليوم المحدد</span>
                      <h4 className="text-sm font-bold text-zinc-900 mt-0.5">
                        {selectedDay.day_name} {selectedDay.day} {monthName}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        selectedDay.status === 'green'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedDay.status === 'red'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : selectedDay.status === 'black'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : selectedDay.status === 'upcoming'
                          ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {selectedDay.status === 'green' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {selectedDay.status === 'red' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {selectedDay.status === 'black' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {selectedDay.status === 'upcoming' && <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                      {selectedDay.status === 'green'
                        ? 'حضور مبكر'
                        : selectedDay.status === 'red'
                        ? 'تأخير'
                        : selectedDay.status === 'black'
                        ? 'غائب'
                        : selectedDay.status === 'upcoming'
                        ? 'يوم قادم'
                        : 'إجازة / عطلة'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        وقت الحضور المسجل:
                      </span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {selectedDay.check_in || 'غير مسجل'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        وقت الانصراف المتوقع:
                      </span>
                      <span className="font-mono font-bold text-zinc-800 tabular-nums">
                        {selectedDay.check_out || '04:00 PM'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        حالة نطاق الـ GPS:
                      </span>
                      <span className="font-semibold text-zinc-800">
                        {selectedDay.geofence || 'مقبول بمقر الشركة'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-200/80 space-y-1 shadow-xs">
                      <span className="text-zinc-500 font-medium block">البيان وحساب النقاط:</span>
                      <p className="font-medium text-zinc-800 text-xs leading-relaxed">
                        {selectedDay.points_note || 'سجل حضور يومي عادي.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 text-[11px] text-zinc-500 font-medium text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>سجل يومي موثق ومحمى ضد التغيير</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs font-medium">
                اختر أي يوم من أيام التقويم لعرض تفاصيل الحضور والنقاط.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
