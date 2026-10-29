import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Activity,
  Banknote,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Zap,
  ArrowUpDown,
  Award,
  Eye,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Mail,
  UserCheck
} from 'lucide-react';

export default function OwnerEmployeesTab({
  searchTerm,
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  departments = [],
  filteredEmployees = [],
  employeesPage = 1,
  setEmployeesPage,
  ITEMS_PER_PAGE = 6,
  openOverrideModal,
  handleQuickBonusDisburse
}) {
  const [activeQuickFilter, setActiveQuickFilter] = useState('all'); // 'all' | 'present' | 'absent' | 'perfect'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'balance_desc' | 'green_desc' | 'red_desc' | 'name_asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const [dossierEmployee, setDossierEmployee] = useState(null); // Employee selected for deep dossier sheet

  // Executive high-level calculations
  const metrics = useMemo(() => {
    const total = filteredEmployees.length;
    const attended = filteredEmployees.filter((e) => e.has_checked_in_today).length;
    const totalBalance = filteredEmployees.reduce(
      (acc, e) => acc + (Number(e.financial_balance) || 0),
      0
    );
    const perfectCount = filteredEmployees.filter(
      (e) => Number(e.red_points || 0) === 0 && Number(e.black_points || 0) === 0
    ).length;
    const attendancePct = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      attended,
      attendancePct,
      totalBalance,
      perfectCount
    };
  }, [filteredEmployees]);

  // Apply Quick Filter and Sorting
  const processedEmployees = useMemo(() => {
    let list = [...filteredEmployees];

    // Filter by tab
    if (activeQuickFilter === 'present') {
      list = list.filter((e) => e.has_checked_in_today);
    } else if (activeQuickFilter === 'absent') {
      list = list.filter((e) => !e.has_checked_in_today);
    } else if (activeQuickFilter === 'perfect') {
      list = list.filter(
        (e) => Number(e.red_points || 0) === 0 && Number(e.black_points || 0) === 0
      );
    }

    // Sort
    if (sortBy === 'balance_desc') {
      list.sort((a, b) => (Number(b.financial_balance) || 0) - (Number(a.financial_balance) || 0));
    } else if (sortBy === 'green_desc') {
      list.sort((a, b) => (Number(b.green_points) || 0) - (Number(a.green_points) || 0));
    } else if (sortBy === 'red_desc') {
      list.sort((a, b) => (Number(b.red_points) || 0) - (Number(a.red_points) || 0));
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
    }

    return list;
  }, [filteredEmployees, activeQuickFilter, sortBy]);

  const totalPages = Math.ceil(processedEmployees.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (employeesPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = processedEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Multi-selection handlers
  const handleToggleSelectAll = () => {
    if (selectedEmployeeIds.size === paginatedEmployees.length) {
      setSelectedEmployeeIds(new Set());
    } else {
      const newSet = new Set(paginatedEmployees.map((e) => e.id));
      setSelectedEmployeeIds(newSet);
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchBonusPrompt = () => {
    if (selectedEmployeeIds.size === 0) return;
    const selectedEmps = processedEmployees.filter((e) => selectedEmployeeIds.has(e.id));
    if (openOverrideModal && selectedEmps[0]) {
      openOverrideModal(selectedEmps[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* 1. EXECUTIVE KPI SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Workforce */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              إجمالي القوة العاملة
            </span>
            <div className="text-3xl font-extrabold text-zinc-900 tabular-nums tracking-tight font-mono">
              {metrics.total} <span className="text-xs font-normal text-zinc-500 font-sans">موظف</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              موزعون على {departments.length} أقسام تشغيلية
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
            <Users className="w-6 h-6 text-zinc-700" strokeWidth={1.75} />
          </div>
        </div>

        {/* Metric 2: Live Attendance Today */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                نسبة الحضور المباشر
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 tabular-nums tracking-tight font-mono flex items-baseline gap-2">
              <span>{metrics.attendancePct}%</span>
              <span className="text-xs font-normal text-zinc-500 font-sans">
                ({metrics.attended} من {metrics.total})
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> فحص جغرافي معتمد
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <Activity className="w-6 h-6" strokeWidth={1.75} />
          </div>
        </div>

        {/* Metric 3: Total Financial Balances */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              إجمالي المحافظ المستحقة
            </span>
            <div className="text-3xl font-extrabold text-zinc-900 tabular-nums tracking-tight font-mono">
              {metrics.totalBalance.toLocaleString()}{' '}
              <span className="text-xs font-normal text-zinc-500 font-sans">ج.م</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              مجموع الأرصدة الحالية لجميع الموظفين
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <Banknote className="w-6 h-6" strokeWidth={1.75} />
          </div>
        </div>

        {/* Metric 4: Discipline & Perfect Record */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              سجل انضباط مثالي
            </span>
            <div className="text-3xl font-extrabold text-zinc-900 tabular-nums tracking-tight font-mono">
              {metrics.perfectCount} <span className="text-xs font-normal text-zinc-500 font-sans">موظف</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              مؤهلون بالكامل لبونص الالتزام الشهري
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* 2. ATTENDANCE SEGMENT PROGRESS BAR */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
            <span>نسبة جاهزية حضور القوة العاملة لليوم</span>
          </span>
          <span className="text-zinc-600 font-mono tabular-nums font-semibold">
            {metrics.attended} موظف حضروا • {metrics.total - metrics.attended} لم يسجلوا بعد ({metrics.attendancePct}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-zinc-900 h-full transition-all duration-700 rounded-full shadow-xs"
            style={{ width: `${metrics.attendancePct}%` }}
          />
        </div>
      </div>

      {/* 3. MAIN DIRECTORY CARD & ADVANCED TOOLBAR */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
                <Users className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                    دليل الموظفين والحسابات المالية
                  </h3>
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/70 tabular-nums">
                    {processedEmployees.length} موظف
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">
                  إدارة شاملة للأرصدة المالية، النقاط المرورية، والقرارات الإدارية الفورية
                </p>
              </div>
            </div>

            {/* Controls Strip: Search, Department, Sort & View Mode */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  strokeWidth={1.75}
                />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setEmployeesPage(1);
                  }}
                  className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-xl pr-9 pl-8 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all shadow-2xs font-normal"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => {
                    setFilterDepartment(e.target.value);
                    setEmployeesPage(1);
                  }}
                  className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 cursor-pointer shadow-2xs transition-all"
                >
                  <option value="all">كافة الأقسام ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setEmployeesPage(1);
                  }}
                  className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 cursor-pointer shadow-2xs transition-all"
                >
                  <option value="default">الترتيب الافتراضي</option>
                  <option value="balance_desc">الأعلى رصيداً مالياً</option>
                  <option value="green_desc">الأكثر نقاطاً خضراء (+)</option>
                  <option value="red_desc">الأكثر نقاطاً حمراء (-)</option>
                  <option value="name_asc">الترتيب الأبجدي (أ - ي)</option>
                </select>
              </div>

              {/* View Mode Toggle (Grid vs List) */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="عرض الكروت التنفيذية"
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="عرض الجدول المالي الكامل"
                >
                  <List className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Segment Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-zinc-400 ml-2">تصفية سريعة:</span>
            {[
              { id: 'all', label: 'الكل', count: filteredEmployees.length },
              {
                id: 'present',
                label: 'حضر اليوم بالـ GPS',
                count: filteredEmployees.filter((e) => e.has_checked_in_today).length
              },
              {
                id: 'absent',
                label: 'لم يحضر بعد',
                count: filteredEmployees.filter((e) => !e.has_checked_in_today).length
              },
              {
                id: 'perfect',
                label: 'سجل مثالي (مؤهل للبونص)',
                count: metrics.perfectCount
              }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveQuickFilter(tab.id);
                  setEmployeesPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeQuickFilter === tab.id
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                    activeQuickFilter === tab.id
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'bg-white text-zinc-600 shadow-2xs'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. CONTENT VIEW: GRID CARDS VIEW OR LIST TABLE VIEW */}
        {viewMode === 'grid' ? (
          /* ================= GRID VIEW (PERSONNEL CARDS) ================= */
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => {
                const isSelected = selectedEmployeeIds.has(emp.id);

                return (
                  <div
                    key={emp.id}
                    className={`rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600'
                        : 'border-zinc-200/90 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {/* Card Header: Monogram, Name & Checkbox */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                            {emp.name ? emp.name[0] : 'م'}
                          </div>
                          {emp.has_checked_in_today ? (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
                              title="حضر اليوم بنطاق GPS"
                            />
                          ) : (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-zinc-300 ring-2 ring-white"
                              title="لم يسجل حضور اليوم"
                            />
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <h4
                            onClick={() => setDossierEmployee(emp)}
                            className="font-bold text-zinc-900 text-sm truncate hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {emp.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                            <span className="font-semibold text-zinc-700">{emp.department || 'عام'}</span>
                            <span>•</span>
                            <span className="truncate">{emp.email}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSelectRow(emp.id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 cursor-pointer"
                        aria-label={`تحديد ${emp.name}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>

                    {/* Financial Balance Strip */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          الرصيد المالي المعتمد
                        </span>
                        <div className="text-lg font-bold font-mono text-zinc-900 tabular-nums">
                          {Number(emp.financial_balance || 0).toLocaleString()}{' '}
                          <span className="text-xs font-normal text-zinc-500 font-sans">ج.م</span>
                        </div>
                      </div>

                      {emp.has_checked_in_today ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          حاضر اليوم
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                          لم يحضر بعد
                        </span>
                      )}
                    </div>

                    {/* Traffic Light Ledger Capsule */}
                    <div className="flex items-center justify-between p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 tabular-nums text-center">
                      <div className="flex-1 py-1 rounded-lg bg-white text-emerald-700 font-bold text-xs shadow-2xs border border-emerald-200/60">
                        +{emp.green_points || 0} خضراء
                      </div>
                      <div className="flex-1 py-1 rounded-lg bg-white text-rose-700 font-bold text-xs shadow-2xs border border-rose-200/60 mx-1">
                        -{emp.red_points || 0} حمراء
                      </div>
                      <div className="flex-1 py-1 rounded-lg bg-zinc-900 text-white font-bold text-xs shadow-2xs">
                        {emp.black_points || 0} سوداء
                      </div>
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickBonusDisburse && handleQuickBonusDisburse(emp)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>بونص (+250)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openOverrideModal(emp)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                        <span>تعديل إداري</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDossierEmployee(emp)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                        title="عرض الملف الشامل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {paginatedEmployees.length === 0 && (
              <div className="text-center py-12 px-4 rounded-xl border border-zinc-200 border-dashed bg-zinc-50/50 space-y-3">
                <Search className="w-6 h-6 text-zinc-400 mx-auto" />
                <h4 className="text-xs font-bold text-zinc-900">لا توجد نتائج مطابقة لمعايير البحث</h4>
                <p className="text-[11px] text-zinc-500">جرب تعديل كلمات البحث أو مسح تصفية الأقسام</p>
              </div>
            )}
          </div>
        ) : (
          /* ================= LIST TABLE VIEW ================= */
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/90 text-zinc-500 border-b border-zinc-200/80 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 text-center w-10">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      {selectedEmployeeIds.size === paginatedEmployees.length &&
                      paginatedEmployees.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 font-semibold">الموظف والبيانات الوظيفية</th>
                  <th className="py-3 px-4 font-semibold">الرصيد المالي الحالي</th>
                  <th className="py-3 px-4 font-semibold">دفتر النقاط المرورية</th>
                  <th className="py-3 px-4 font-semibold text-center">التعويض المبكر</th>
                  <th className="py-3 px-5 font-semibold text-center">الإجراءات والقرارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {paginatedEmployees.map((emp) => {
                  const isSelected = selectedEmployeeIds.has(emp.id);

                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors group duration-150 ${
                        isSelected ? 'bg-indigo-50/30' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(emp.id)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setDossierEmployee(emp)}
                        >
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {emp.name ? emp.name[0] : 'م'}
                            </div>
                            {emp.has_checked_in_today ? (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
                            ) : (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-300 ring-2 ring-white" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-zinc-900 text-xs sm:text-sm group-hover:text-indigo-600 flex items-center gap-1.5 truncate transition-colors">
                              <span>{emp.name}</span>
                              {emp.department && (
                                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  {emp.department}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate font-normal">
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-xs">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-zinc-900 text-sm tabular-nums dir-ltr text-right">
                            {Number(emp.financial_balance || 0).toLocaleString()}{' '}
                            <span className="text-[11px] font-normal text-zinc-500 font-sans">ج.م</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-600 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">
                            رصيد معتمد
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center p-0.5 bg-zinc-100 border border-zinc-200 rounded-lg gap-1 shadow-2xs tabular-nums">
                            <div className="px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200 flex items-center gap-1 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>+{emp.green_points || 0}</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200 flex items-center gap-1 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>-{emp.red_points || 0}</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-md bg-zinc-900 text-white border border-zinc-900 flex items-center gap-1 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                              <span>{emp.black_points || 0}</span>
                            </div>
                          </div>

                          <div>
                            {emp.has_checked_in_today ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                حضر اليوم بالـ GPS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-normal text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                لم يسجل حضور اليوم
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 font-mono text-xs font-bold tabular-nums shadow-2xs">
                          <Zap className="w-3 h-3 text-zinc-500" strokeWidth={2} />
                          <span>{emp.early_green_credits || 0} رصيد</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickBonusDisburse && handleQuickBonusDisburse(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>بونص</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openOverrideModal(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-semibold text-xs transition-all shadow-xs hover:shadow active:scale-[0.98] cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDossierEmployee(emp)}
                            className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer shadow-2xs"
                            title="عرض الملف الشامل"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. EXECUTIVE PAGINATION FOOTER */}
        {processedEmployees.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-200/80 bg-zinc-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
            <div className="tabular-nums font-normal">
              عرض{' '}
              <span className="font-bold text-zinc-900">
                {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, processedEmployees.length)}
              </span>{' '}
              من أصل{' '}
              <span className="font-bold text-zinc-900">{processedEmployees.length}</span> موظف
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setEmployeesPage((prev) => Math.max(prev - 1, 1))}
                disabled={employeesPage === 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>السابق</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= employeesPage - 1 && p <= employeesPage + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEmployeesPage(p)}
                        className={`w-7 h-7 rounded-xl text-xs font-bold tabular-nums transition-colors cursor-pointer flex items-center justify-center ${
                          employeesPage === p
                            ? 'bg-zinc-950 text-white shadow-xs'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-2xs'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === employeesPage - 2 || p === employeesPage + 2) {
                    return (
                      <span key={p} className="text-zinc-400 px-0.5">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                onClick={() => setEmployeesPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={employeesPage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. FLOATING BATCH ACTION BAR (WHEN EMPLOYEES SELECTED) */}
      {selectedEmployeeIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-zinc-950 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-zinc-800 flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>
                تم تحديد <strong className="text-white font-bold font-mono">{selectedEmployeeIds.size}</strong> موظف
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800"></div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchBonusPrompt}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Award className="w-3.5 h-3.5" strokeWidth={2} />
                <span>صرف مكافأة للمحددين</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEmployeeIds(new Set())}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DEEP PERSONNEL DOSSIER SHEET / MODAL */}
      {dossierEmployee && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs"
            onClick={() => setDossierEmployee(null)}
          />
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-150 border border-zinc-200 shadow-2xl space-y-0">
            {/* Dossier Header */}
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                  {dossierEmployee.name ? dossierEmployee.name[0] : 'م'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900">{dossierEmployee.name}</h3>
                    {dossierEmployee.has_checked_in_today && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        حاضر اليوم بالـ GPS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-normal mt-0.5">
                    {dossierEmployee.department || 'القسم العام'} • كود المعرف: #{dossierEmployee.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDossierEmployee(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-5">
              {/* Financial & Points Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    الرصيد المالي الحالي
                  </span>
                  <div className="text-2xl font-bold text-zinc-900 font-mono tabular-nums">
                    {Number(dossierEmployee.financial_balance || 0).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-zinc-500 font-sans">ج.م</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-normal block">
                    مستحقات قابلة للتحويل عبر InstaPay
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    رصيد التعويض المبكر
                  </span>
                  <div className="text-2xl font-bold text-zinc-900 font-mono tabular-nums">
                    {dossierEmployee.early_green_credits || 0}{' '}
                    <span className="text-xs font-normal text-zinc-500 font-sans">رصيد</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-normal block">
                    حصانة تلقائية لحالات التأخير
                  </span>
                </div>
              </div>

              {/* Traffic Light Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-900 block">
                  ميزانية النقاط المرورية المعتمدة
                </span>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                    <span className="text-[11px] font-bold text-emerald-800 block">نقاط خضراء</span>
                    <span className="text-xl font-bold text-emerald-900 font-mono tabular-nums block">
                      +{dossierEmployee.green_points || 0}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-normal block">انضباط مبكر</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-0.5">
                    <span className="text-[11px] font-bold text-rose-800 block">نقاط حمراء</span>
                    <span className="text-xl font-bold text-rose-900 font-mono tabular-nums block">
                      -{dossierEmployee.red_points || 0}
                    </span>
                    <span className="text-[10px] text-rose-700 font-normal block">تأخيرات</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-900 text-white space-y-0.5">
                    <span className="text-[11px] font-bold text-zinc-300 block">نقاط سوداء</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums block">
                      {dossierEmployee.black_points || 0}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal block">مخالفات جسيمة</span>
                  </div>
                </div>
              </div>

              {/* Employee Contact & Verified System Info */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs text-zinc-600">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">البريد الإلكتروني المعتمد:</span>
                  <span className="font-semibold text-zinc-900 font-mono">{dossierEmployee.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">حالة الربط الجغرافي بالـ GPS:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    مفعل ومربوط بنطاق العمل
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier Footer Action Bar */}
            <div className="p-5 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDossierEmployee(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                إغلاق الملف
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = dossierEmployee;
                    setDossierEmployee(null);
                    handleQuickBonusDisburse && handleQuickBonusDisburse(target);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>صرف مكافأة (+250)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = dossierEmployee;
                    setDossierEmployee(null);
                    openOverrideModal(target);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>تعديل إداري شامل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
