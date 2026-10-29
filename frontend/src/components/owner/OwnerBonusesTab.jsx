import React, { useState } from 'react';
import {
  Sparkles,
  Banknote,
  Users,
  User,
  Search,
  Check,
  ShieldCheck,
  Loader2,
  X,
  TrendingDown,
  Scale,
  History,
  Sliders,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export default function OwnerBonusesTab({
  monthlyBonusSetting = 2500,
  setMonthlyBonusSetting,
  lateDeductionSetting = 250,
  setLateDeductionSetting,
  absenceDeductionSetting = 500,
  setAbsenceDeductionSetting,
  isSavingBonusSetting = false,
  handleSaveBonusSetting,
  grantBonusForm,
  setGrantBonusForm,
  handleGrantBonus,
  deductionForm,
  setDeductionForm,
  handleApplyDeduction,
  bonusEmployeeSearch,
  setBonusEmployeeSearch,
  employees = [],
  auditLogs = []
}) {
  const [activeSubTab, setActiveSubTab] = useState('policies'); // 'policies' | 'grant_bonus' | 'apply_deduction' | 'audit_trail'

  // Filter financial audit records
  const financialAudits = (auditLogs || []).filter(
    (log) =>
      log.action === 'GRANT_BONUS' ||
      log.action === 'APPLY_DEDUCTION' ||
      log.action === 'UPDATE_BONUS_SETTING' ||
      log.action === 'MANUAL_OVERRIDE' ||
      (log.details && (log.details.includes('خصم') || log.details.includes('مكافأة') || log.details.includes('بونص')))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-zinc-950">
      {/* Top Banner - Executive Luxury Monochrome */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-sm shrink-0">
              <Scale className="w-6 h-6 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                  إدارة الخصومات والمكافآت المالية
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300">
                  صلاحية حصرية للمدير التنفيذي (Owner RBAC)
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-normal mt-1 leading-relaxed">
                التحكم المركزي في مبالغ الخصومات وسياسات البونص، وتطبيق الجزاءات أو صرف المكافآت يدوياً مع التوثيق الرقابي الفوري.
              </p>
            </div>
          </div>

          {/* Quick Stats Badges in Monochrome */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="bg-zinc-50 border border-zinc-200/90 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-500">بونص الالتزام:</span>
              <span className="text-xs font-bold text-zinc-950 font-mono tabular-nums dir-ltr">
                {Number(monthlyBonusSetting || 0).toLocaleString()} <span className="text-[10px] text-zinc-500 font-sans">ج.م</span>
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/90 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-500">خصم التأخير:</span>
              <span className="text-xs font-bold text-zinc-950 font-mono tabular-nums dir-ltr">
                {Number(lateDeductionSetting || 0).toLocaleString()} <span className="text-[10px] text-zinc-500 font-sans">ج.م</span>
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/90 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-500">خصم الغياب:</span>
              <span className="text-xs font-bold text-zinc-950 font-mono tabular-nums dir-ltr">
                {Number(absenceDeductionSetting || 0).toLocaleString()} <span className="text-[10px] text-zinc-500 font-sans">ج.م</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sub-navigation Controls (Pills) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-6 mt-6 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setActiveSubTab('policies')}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'policies'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" strokeWidth={2} />
            <span>سياسات ومبالغ الخصومات والبونص</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('grant_bonus')}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'grant_bonus'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            <span>صرف مكافأة / بونص يدوي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('apply_deduction')}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'apply_deduction'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/80'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" strokeWidth={2} />
            <span>تطبيق خصم مالي يدوي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_trail')}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'audit_trail'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/80'
            }`}
          >
            <History className="w-3.5 h-3.5" strokeWidth={2} />
            <span>سجل القرارات والتدقيق المالي ({financialAudits.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: POLICIES CONFIGURATION */}
      {activeSubTab === 'policies' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Sliders className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">تحديد السياسات والمبالغ المعتمدة للمؤسسة</h4>
                <p className="text-xs text-zinc-500 font-normal">
                  تحدد هذه القيم مبالغ المكافآت والجزاءات التلقائية واليدوية المعتمدة حصرياً من قِبل المدير.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
              تعميم على مستوى النظام
            </span>
          </div>

          <form onSubmit={handleSaveBonusSetting} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Field 1: Monthly Commitment Bonus */}
              <div className="bg-zinc-50/80 border border-zinc-200/80 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                      <span>بونص الالتزام الشهري:</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-medium">مكافأة</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">المبلغ المستحق شهرياً للموظف الخالي من المخالفات.</p>
                  
                  <div className="relative pt-1">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={monthlyBonusSetting}
                      onChange={(e) => setMonthlyBonusSetting(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-lg p-2.5 pr-3 pl-12 text-xs font-mono font-bold text-zinc-950 outline-none transition-colors dir-ltr shadow-xs"
                      placeholder="2500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                      ج.م
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-medium text-zinc-400 block">قيم مقترحة:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[2000, 2500, 3000, 4000, 5000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMonthlyBonusSetting(preset)}
                        className={`py-1 px-1 rounded text-[11px] font-mono transition-colors border cursor-pointer ${
                          parseFloat(monthlyBonusSetting) === preset
                            ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 2: Late Arrival Deduction */}
              <div className="bg-zinc-50/80 border border-zinc-200/80 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-zinc-700" />
                      <span>خصم التأخير (نقطة حمراء):</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-medium">خصم</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">المبلغ المخصوم عند تسجيل الحضور المتأخر.</p>
                  
                  <div className="relative pt-1">
                    <input
                      type="number"
                      min="0"
                      step="25"
                      required
                      value={lateDeductionSetting}
                      onChange={(e) => setLateDeductionSetting(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-lg p-2.5 pr-3 pl-12 text-xs font-mono font-bold text-zinc-950 outline-none transition-colors dir-ltr shadow-xs"
                      placeholder="250"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                      ج.م
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-medium text-zinc-400 block">قيم مقترحة:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[150, 200, 250, 300, 400, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLateDeductionSetting(preset)}
                        className={`py-1 px-1 rounded text-[11px] font-mono transition-colors border cursor-pointer ${
                          parseFloat(lateDeductionSetting) === preset
                            ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Absence Deduction */}
              <div className="bg-zinc-50/80 border border-zinc-200/80 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-700" />
                      <span>خصم الغياب (نقطة سوداء):</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-medium">خصم</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">المبلغ المخصوم عن يوم الغياب الكامل دون إذن.</p>
                  
                  <div className="relative pt-1">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={absenceDeductionSetting}
                      onChange={(e) => setAbsenceDeductionSetting(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-lg p-2.5 pr-3 pl-12 text-xs font-mono font-bold text-zinc-950 outline-none transition-colors dir-ltr shadow-xs"
                      placeholder="500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                      ج.م
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-medium text-zinc-400 block">قيم مقترحة:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[300, 500, 600, 750, 1000, 1500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAbsenceDeductionSetting(preset)}
                        className={`py-1 px-1 rounded text-[11px] font-mono transition-colors border cursor-pointer ${
                          parseFloat(absenceDeductionSetting) === preset
                            ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingBonusSetting}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingBonusSetting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={2} />
                ) : (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
                <span>حفظ وتعميم سياسات الخصومات والبونص</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: GRANT INSTANT BONUS */}
      {activeSubTab === 'grant_bonus' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Sparkles className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">صرف مكافأة مالية فورية واستثنائية</h4>
                <p className="text-xs text-zinc-500 font-normal">
                  إيداع مكافأة نقدية في حساب موظف محدد أو تعميمها على جميع الموظفين مع ذكر سبب الصرف.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
              إيداع مالي مباشر
            </span>
          </div>

          <form onSubmit={handleGrantBonus} className="space-y-5">
            {/* Beneficiary Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800">المستفيد من المكافأة:</label>
                <span className="text-xs text-zinc-500 font-medium">
                  {grantBonusForm.targetUserId === 'all'
                    ? `جميع الموظفين (${employees.length})`
                    : employees.find((e) => String(e.id) === String(grantBonusForm.targetUserId))?.name || 'تم التحديد'}
                </span>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setGrantBonusForm((prev) => ({ ...prev, targetUserId: 'all' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    grantBonusForm.targetUserId === 'all'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Users className="w-4 h-4" strokeWidth={1.75} />
                  <span>جميع الموظفين ({employees.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (grantBonusForm.targetUserId === 'all') {
                      const firstEmp = employees[0]?.id || '2';
                      setGrantBonusForm((prev) => ({ ...prev, targetUserId: String(firstEmp) }));
                    }
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    grantBonusForm.targetUserId !== 'all'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <User className="w-4 h-4" strokeWidth={1.75} />
                  <span>موظف محدد</span>
                </button>
              </div>

              {/* Specific Employee Selection List */}
              {grantBonusForm.targetUserId !== 'all' && (
                <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 mt-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
                    <input
                      type="text"
                      value={bonusEmployeeSearch}
                      onChange={(e) => setBonusEmployeeSearch(e.target.value)}
                      placeholder="ابحث باسم الموظف أو القسم..."
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg pr-9 pl-8 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 font-normal"
                    />
                    {bonusEmployeeSearch && (
                      <button
                        type="button"
                        onClick={() => setBonusEmployeeSearch('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {employees
                      .filter(
                        (emp) =>
                          emp.name.toLowerCase().includes(bonusEmployeeSearch.toLowerCase()) ||
                          (emp.department && emp.department.toLowerCase().includes(bonusEmployeeSearch.toLowerCase()))
                      )
                      .map((emp) => {
                        const isSelected = String(grantBonusForm.targetUserId) === String(emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => setGrantBonusForm((prev) => ({ ...prev, targetUserId: String(emp.id) }))}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-zinc-100 border-zinc-400 shadow-xs'
                                : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-800'
                                }`}
                              >
                                {emp.name.charAt(0)}
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-zinc-900 block truncate">{emp.name}</span>
                                <span className="text-[10px] text-zinc-500 block truncate">{emp.department || 'عام'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-zinc-50 text-zinc-900 border border-zinc-200 font-bold">
                                {parseFloat(emp.financial_balance || 0).toLocaleString()} ج.م
                              </span>
                              {isSelected ? (
                                <div className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-zinc-300" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">مبلغ المكافأة (ج.م):</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="50"
                  required
                  value={grantBonusForm.amount}
                  onChange={(e) => setGrantBonusForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="مثال: 1000"
                  className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-xl p-3 pr-3 pl-12 text-xs font-mono font-bold text-zinc-950 outline-none dir-ltr shadow-xs"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">ج.م</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {[250, 500, 1000, 1500, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGrantBonusForm((prev) => ({ ...prev, amount: preset }))}
                    className={`py-1.5 px-1 rounded-lg text-xs font-mono font-medium transition-colors border cursor-pointer ${
                      parseFloat(grantBonusForm.amount) === preset
                        ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">سبب أو مبرر صرف المكافأة:</label>
              <input
                type="text"
                required
                value={grantBonusForm.reason}
                onChange={(e) => setGrantBonusForm((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="مثال: مكافأة تميز وإنجاز استثنائي في تسليم المهام"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-xl p-3 text-xs text-zinc-900 outline-none font-normal shadow-xs"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['أداء استثنائي وتفاني', 'تسليم المشروع في الموعد', 'انضباط والتزام ممتاز', 'موظف الشهر المتميز'].map(
                  (reasonText) => (
                    <button
                      key={reasonText}
                      type="button"
                      onClick={() => setGrantBonusForm((prev) => ({ ...prev, reason: reasonText }))}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                    >
                      {reasonText}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={grantBonusForm.isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {grantBonusForm.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={2} />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
                <span>صرف المكافأة فوراً وإيداعها في الحساب</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: APPLY INSTANT DEDUCTION */}
      {activeSubTab === 'apply_deduction' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <TrendingDown className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">تطبيق خصم مالي / جزاء إداري يدوي</h4>
                <p className="text-xs text-zinc-500 font-normal">
                  خصم مبلغ مالي مباشرة من رصيد الموظف بناءً على قرار إداري رسمي مع التوثيق في سجل التدقيق.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
              خصم إداري مباشر
            </span>
          </div>

          <form onSubmit={handleApplyDeduction} className="space-y-5">
            {/* Beneficiary Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800">الموظف المراد الخصم منه:</label>
                <span className="text-xs text-zinc-500 font-medium">
                  {deductionForm.targetUserId === 'all'
                    ? `جميع الموظفين (${employees.length})`
                    : employees.find((e) => String(e.id) === String(deductionForm.targetUserId))?.name || 'تم التحديد'}
                </span>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    const firstEmp = employees[0]?.id || '2';
                    setDeductionForm((prev) => ({ ...prev, targetUserId: String(firstEmp) }));
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    deductionForm.targetUserId !== 'all'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <User className="w-4 h-4" strokeWidth={1.75} />
                  <span>موظف محدد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeductionForm((prev) => ({ ...prev, targetUserId: 'all' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    deductionForm.targetUserId === 'all'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Users className="w-4 h-4" strokeWidth={1.75} />
                  <span>جميع الموظفين ({employees.length})</span>
                </button>
              </div>

              {/* Specific Employee Selection List */}
              {deductionForm.targetUserId !== 'all' && (
                <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 mt-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
                    <input
                      type="text"
                      value={bonusEmployeeSearch}
                      onChange={(e) => setBonusEmployeeSearch(e.target.value)}
                      placeholder="ابحث باسم الموظف أو القسم..."
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg pr-9 pl-8 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 font-normal"
                    />
                    {bonusEmployeeSearch && (
                      <button
                        type="button"
                        onClick={() => setBonusEmployeeSearch('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {employees
                      .filter(
                        (emp) =>
                          emp.name.toLowerCase().includes(bonusEmployeeSearch.toLowerCase()) ||
                          (emp.department && emp.department.toLowerCase().includes(bonusEmployeeSearch.toLowerCase()))
                      )
                      .map((emp) => {
                        const isSelected = String(deductionForm.targetUserId) === String(emp.id);
                        const curBalance = parseFloat(emp.financial_balance || 0);
                        const deductAmt = parseFloat(deductionForm.amount || 0);
                        const projectedBalance = Math.max(0, curBalance - deductAmt);

                        return (
                          <div
                            key={emp.id}
                            onClick={() => setDeductionForm((prev) => ({ ...prev, targetUserId: String(emp.id) }))}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-zinc-100 border-zinc-400 shadow-xs'
                                : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-800'
                                }`}
                              >
                                {emp.name.charAt(0)}
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-zinc-900 block truncate">{emp.name}</span>
                                <span className="text-[10px] text-zinc-500 block truncate">{emp.department || 'عام'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-left">
                                <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-zinc-50 text-zinc-900 border border-zinc-200 font-bold block">
                                  {curBalance.toLocaleString()} ج.م
                                </span>
                                {isSelected && deductAmt > 0 && (
                                  <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
                                    بعد الخصم: {projectedBalance.toLocaleString()} ج.م
                                  </span>
                                )}
                              </div>
                              {isSelected ? (
                                <div className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-zinc-300" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">مبلغ الخصم (ج.م):</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="25"
                  required
                  value={deductionForm.amount}
                  onChange={(e) => setDeductionForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="مثال: 250"
                  className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-xl p-3 pr-3 pl-12 text-xs font-mono font-bold text-zinc-950 outline-none dir-ltr shadow-xs"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">ج.م</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {[100, 150, 200, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeductionForm((prev) => ({ ...prev, amount: preset }))}
                    className={`py-1.5 px-1 rounded-lg text-xs font-mono font-medium transition-colors border cursor-pointer ${
                      parseFloat(deductionForm.amount) === preset
                        ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    -{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">سبب ومبرر توقيع الخصم الإداري:</label>
              <input
                type="text"
                required
                value={deductionForm.reason}
                onChange={(e) => setDeductionForm((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="مثال: خصم إداري بسبب مخالفة لائحة العمل أو التأخر المتكرر"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 rounded-xl p-3 text-xs text-zinc-900 outline-none font-normal shadow-xs"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['تأخير متكرر بدون إذن مسبق', 'مخالفة لائحة الانضباط الداخلي', 'غياب غير مبرر عن العمل', 'قرار جزاء إداري رسمي'].map(
                  (reasonText) => (
                    <button
                      key={reasonText}
                      type="button"
                      onClick={() => setDeductionForm((prev) => ({ ...prev, reason: reasonText }))}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                    >
                      {reasonText}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={deductionForm.isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {deductionForm.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={2} />
                ) : (
                  <ArrowDownLeft className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
                <span>اعتماد وتطبيق الخصم المالي فوراً</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 4: FINANCIAL AUDIT TRAIL */}
      {activeSubTab === 'audit_trail' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <History className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">سجل القرارات والتدقيق المالي للمدير</h4>
                <p className="text-xs text-zinc-500 font-normal">
                  سجل غير قابل للتعديل يوثق جميع عمليات تحديد السياسات وصرف المكافآت وتطبيق الخصومات.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
              {financialAudits.length} إجراء مالي مسجل
            </span>
          </div>

          {financialAudits.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <History className="w-8 h-8 mx-auto mb-2 text-zinc-300" strokeWidth={1.5} />
              <p className="text-xs">لم يتم تسجيل أي قرارات مالية حديثة بعد.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {financialAudits.map((item, idx) => (
                <div key={item.id || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-950">{item.action}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleString('ar-EG') : 'الآن'}
                      </span>
                    </div>
                    <p className="text-zinc-600 font-normal leading-relaxed">{item.details}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium">
                      بواسطة: {item.performed_by || 'المدير التنفيذي'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Governance Card */}
      <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-800">
            <ShieldCheck className="w-4 h-4 text-zinc-700" strokeWidth={2} />
          </div>
          <div>
            <span className="font-bold text-zinc-950 block">حوكمة الصلاحيات والأمان المالي (Enterprise RBAC):</span>
            <span className="text-zinc-500 font-normal">
              جميع الصلاحيات المالية محصورة بالمدير (Owner). محاولات تغيير المبالغ أو صرف المكافآت من غير المدير تُحظر تلقائياً برمز 403 Forbidden.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
