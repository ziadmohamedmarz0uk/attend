import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Calendar,
  Banknote,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function OwnerAnalyticsSection({ stats, employees = [] }) {
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month'

  // Weekly data points for Punctuality & Attendance
  const weeklyAttendanceData = [
    { day: 'السبت', rate: 92, count: 22 },
    { day: 'الأحد', rate: 96, count: 23 },
    { day: 'الإثنين', rate: 98, count: 24 },
    { day: 'الثلاثاء', rate: 94, count: 22 },
    { day: 'الأربعاء', rate: 100, count: 24 },
    { day: 'الخميس', rate: 95, count: 23 },
  ];

  // Financial distribution calculations
  const totalBalance = employees.reduce((acc, e) => acc + (Number(e.financial_balance) || 0), 0);
  const totalGreen = employees.reduce((acc, e) => acc + (Number(e.green_points) || 0), 0);
  const totalRed = employees.reduce((acc, e) => acc + (Number(e.red_points) || 0), 0);
  const bonusLiabilities = totalGreen * 50; // estimated bonus value
  const deductionSavings = totalRed * 50;

  // SVG Area Chart Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = weeklyAttendanceData.map((d, i) => {
    const x = paddingX + (i / (weeklyAttendanceData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.rate - 85) / 15) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
      {/* 1. ATTENDANCE & DISCIPLINE TREND CHART (7 Cols) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <TrendingUp className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  معدل الانضباط والتواجد الجغرافي الأسبوعي
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +3.2% تحسن
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                تتبع مسار دقة الحضور والالتزام داخل النطاق المحدد بمعادلة Haversine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أسبوعي
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهري
            </button>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guideline */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={svgWidth - paddingX}
              y2={paddingY}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={svgHeight / 2}
              x2={svgWidth - paddingX}
              y2={svgHeight / 2}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="#e2e8f0"
            />

            {/* Area Fill */}
            <path d={areaD} fill="url(#attendanceGradient)" />

            {/* Line Stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g key={i} className="cursor-pointer group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  className="fill-white stroke-emerald-600 stroke-[2.5] group-hover:scale-125 transition-transform"
                />
                {/* Tooltip on hover */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className="fill-slate-900 text-[11px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {pt.rate}%
                </text>
              </g>
            ))}
          </svg>

          {/* Days Labels */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-2 px-6">
            {weeklyAttendanceData.map((d, i) => (
              <span key={i} className="hover:text-slate-900 transition-colors">
                {d.day}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Insight Footer */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-900">أعلى يوم التزام:</span>
            <span>الأربعاء بنسبة حضور كاملة 100%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            متوسط الأسبوع: <strong>95.8%</strong>
          </span>
        </div>
      </div>

      {/* 2. FINTECH PAYROLL & BONUS METRIC HUB (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Banknote className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                التوزيع المالي والمكافآت (Fintech Cash Flow)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                صافي المحافظ والمستحقات الشهرية المعتمدة
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            InstaPay جاهز
          </span>
        </div>

        {/* Total Financial Pool */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-300 block">
            إجمالي المحفظة المالية للمؤسسة
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-2">
            <span>{totalBalance.toLocaleString()}</span>
            <span className="text-sm font-normal text-slate-300 font-sans">جنيه مصري</span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal pt-1">
            يتم تحديث الأرصدة تلقائياً مع كل تسجيل حضور مبكر أو صرف بونص معتمد
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2.5">
          {/* Item 1: Green Points Accrual */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <span className="font-bold text-slate-900 block">بونص النقاط الخضراء</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {totalGreen} نقطة انضباط مكتسبة
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              +{bonusLiabilities.toLocaleString()} ج.م
            </span>
          </div>

          {/* Item 2: Red Points Deductions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div>
                <span className="font-bold text-slate-900 block">خصومات التأخير المحتسبة</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {totalRed} نقطة تأخير ومخالفة
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-rose-700 text-sm">
              -{deductionSavings.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Payout Security Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>مطابقة معتمدة مع سجلات التدقيق (Audit Logs) وتصدير كشوف InstaPay.</span>
        </div>
      </div>
    </div>
  );
}
