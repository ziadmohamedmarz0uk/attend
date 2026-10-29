import React from 'react';
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  Sparkles,
  Edit3,
  History,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  FileText,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Wifi,
  Coins,
  Check,
  X
} from 'lucide-react';

export default function EmployeeWalletTab({
  profile,
  monthlyBonusAmount = 2500,
  handleClaimBonus,
  isClaimingBonus = false,
  bonusClaimedThisMonth = false,
  editingInstaPay = false,
  setEditingInstaPay,
  instaPayHandle = '',
  setInstaPayHandle,
  handleSaveInstaPay,
  isSavingInstaPay = false,
  payoutsSummary = { total_disbursed_egp: 0, pending_payouts_count: 0 },
  fetchPayoutsHistory,
  payoutsLoading = false,
  payoutsList = [],
  ledgerHistory = []
}) {
  const isBonusEligible =
    (profile?.red_points || 0) === 0 && (profile?.black_points || 0) === 0;

  return (
    <div className="space-y-6 text-zinc-950">
      {/* LUXURY FINTECH INSTAPAY VIRTUAL CARD & BONUS CLAIM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Luxury Executive Virtual Card (Mercury / Stripe style) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden border border-zinc-700/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/10">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                InstaPay Direct
              </span>
            </div>
            <Wifi className="w-4 h-4 text-zinc-400 rotate-90" />
          </div>

          {/* Balance Display */}
          <div className="py-4 relative z-10">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">
              الرصيد المالي المتاح للسحب
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white">
                {(Number(profile?.financial_balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                EGP
              </span>
            </div>
          </div>

          {/* Card Bottom Row: Handle & Chip */}
          <div className="flex items-end justify-between pt-2 border-t border-white/10 relative z-10">
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">المستفيد المعتمد</span>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {profile?.name || 'حساب الموظف'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>موثق بنكياً</span>
            </div>
          </div>
        </div>

        {/* Right: Bonus Claim & InstaPay Configuration */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                  بونص الالتزام والانضباط الشهري
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                  + {monthlyBonusAmount.toLocaleString()} EGP
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                مكافأة فورية تودع بحسابك البنكي تلقائياً عند الحفاظ على سجل خالٍ من المخالفات.
              </p>
            </div>

            {/* Executive RBAC Governance Status Pill */}
            <div className="flex items-center">
              {bonusClaimedThisMonth ? (
                <div className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 font-bold text-xs flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                  <span>تم اعتماد وصرف البونص لهذا الشهر من الإدارة</span>
                </div>
              ) : isBonusEligible ? (
                <div className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center gap-2 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-zinc-200" />
                  <span>مؤهل للبونص — في انتظار الاعتماد والصرف اليدوي من الإدارة</span>
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                  <span>غير مؤهل للبونص هذا الشهر (توجد نقاط حمراء أو سوداء)</span>
                </div>
              )}
            </div>
          </div>

          {/* Config & Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* InstaPay Handle Editor */}
            <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">عنوان InstaPay المعتمد للسحب:</span>
                {!editingInstaPay && (
                  <button
                    type="button"
                    onClick={() => setEditingInstaPay(true)}
                    aria-label="تعديل عنوان InstaPay"
                    className="text-zinc-500 hover:text-zinc-950 transition-colors p-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer rounded-md hover:bg-zinc-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                )}
              </div>

              <div className="pt-0.5">
                {editingInstaPay ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (handleSaveInstaPay) handleSaveInstaPay(instaPayHandle);
                    }}
                    className="flex items-center gap-1.5 w-full"
                  >
                    <input
                      type="text"
                      aria-label="عنوان InstaPay المعتمد"
                      value={instaPayHandle}
                      onChange={(e) => setInstaPayHandle(e.target.value)}
                      placeholder="username@instapay"
                      className="bg-white border border-zinc-900 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg text-zinc-900 outline-none flex-1 shadow-2xs"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSavingInstaPay}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                      title="حفظ في قاعدة البيانات"
                    >
                      {isSavingInstaPay ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>حفظ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingInstaPay(false)}
                      className="px-2 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-semibold cursor-pointer"
                      title="إلغاء"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-900 truncate">
                      {instaPayHandle || 'user@instapay'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mr-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      حساب معتمد
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bonus Rules & Status */}
            <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80 space-y-1.5">
              <span className="text-xs text-zinc-500 font-medium block">شروط استحقاق البونص:</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-zinc-800">
                  0 نقاط سوداء + 0 نقاط حمراء
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isBonusEligible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isBonusEligible ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      مستحق للبونص
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      غير مستحق
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* RBAC Financial Governance Policy Notice */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <span className="font-bold text-zinc-950 block">حوكمة الصلاحيات المالية (Enterprise RBAC):</span>
                <span className="text-zinc-500 font-normal">
                  تحديد مبالغ الخصومات وصرف مكافآت البونص يخضع للقرار والاعتماد اليدوي الحصري للمدير التنفيذي (Owner). لا تملك حسابات الموظفين صلاحية الصرف الذاتي لضمان النزاهة والانضباط المالي المؤسسي.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSTAPAY PAYOUT & BONUS HISTORY SECTION */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] space-y-6 text-zinc-950 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                  سجل معاملات وسحوبات InstaPay
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono font-medium">
                  Payout History
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                سجل عمليات صرف بونص الالتزام والسحوبات والتحويلات اللحظية المعتمدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left dir-ltr bg-zinc-50 px-3.5 py-1.5 rounded-xl border border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium block">إجمالي السحوبات</span>
              <span className="text-sm font-bold font-mono text-emerald-700 dir-ltr tabular-nums">
                +{(payoutsSummary?.total_disbursed_egp || 0).toLocaleString()} <span className="text-[11px]">EGP</span>
              </span>
            </div>

            <button
              type="button"
              onClick={fetchPayoutsHistory}
              disabled={payoutsLoading}
              className="px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${payoutsLoading ? 'animate-spin text-zinc-950' : 'text-zinc-500'}`} />
              <span>تحديث السجل</span>
            </button>
          </div>
        </div>

        {/* SKELETON LOADING STATE */}
        {payoutsLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded-xl border border-zinc-200"></div>
            ))}
          </div>
        ) : payoutsList.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs font-medium">
            لا توجد معاملات سحب أو بونص مسجلة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold">
                  <th className="py-3 px-4 whitespace-nowrap text-zinc-700">رقم المرجع</th>
                  <th className="py-3 px-4 text-zinc-700">تفاصيل المعاملة</th>
                  <th className="py-3 px-4 whitespace-nowrap text-zinc-700">التاريخ والوقت</th>
                  <th className="py-3 px-4 whitespace-nowrap text-zinc-700">حساب InstaPay</th>
                  <th className="py-3 px-4 whitespace-nowrap text-zinc-700">المبلغ</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center text-zinc-700">حالة التحويل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 font-medium text-zinc-800 bg-white">
                {payoutsList.map((item) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>تم التحويل بنجاح</span>
                    </span>
                  );
                  if (item.status === 'processing') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                        <span>جاري المعالجة</span>
                      </span>
                    );
                  } else if (item.status === 'rejected') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>مرفوضة / معلقة</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <span className="font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold text-[11px] inline-block tabular-nums">
                          {item.reference_code || `INSTA-${item.id}-2026`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="space-y-0.5 max-w-xs sm:max-w-md">
                          <div className="text-zinc-900 font-semibold text-xs leading-snug">
                            {item.title}
                          </div>
                          {item.notes && (
                            <div className="text-[11px] text-zinc-500 font-normal italic flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5 text-zinc-500 font-normal text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span dir="ltr" className="font-mono tabular-nums">
                            {item.created_at ? item.created_at.replace('T', ' ').substring(0, 16) : '2026-09-30'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-mono text-zinc-700 font-semibold text-[11px]">
                            {item.insta_pay_handle || 'ahmed.hassan@instapay'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <span className="text-xs font-bold text-emerald-700 font-mono dir-ltr inline-block tabular-nums">
                          +{parseFloat(item.amount).toFixed(2)}{' '}
                          <span className="text-[10px] font-semibold text-emerald-700">ج.م</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FINANCIAL & POINTS TRANSACTION HISTORY LEDGER TABLE */}
      <div className="bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>سجل المعاملات المالية والمكافآت (MySQL Ledger)</span>
          </div>
          <span className="text-xs text-zinc-500 font-medium">محدّث تلقائياً من قاعدة البيانات</span>
        </div>

        {ledgerHistory.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-medium">
            لا توجد معاملات ماليّة مسجلة في السجل حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold">
                  <th className="py-3 px-4">رقم المعاملة</th>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">نوع المعاملة</th>
                  <th className="py-3 px-4">تفاصيل البيان</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 font-medium text-zinc-800 bg-white">
                {ledgerHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-500 tabular-nums">#{item.id}</td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px] tabular-nums">
                      {item.created_at ? item.created_at.replace('T', ' ').substring(0, 16) : '2026-09-30'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {item.transaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-900 font-semibold">{item.description}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dir-ltr text-right font-mono tabular-nums text-xs">
                      +{parseFloat(item.amount_deducted_or_rewarded).toFixed(2)} ج.م
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        مكتملة
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
