import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  RotateCcw,
  Loader2,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function TrafficLightLedger({
  profile,
  handleRedeemRedPoint,
  isRedeemingRed = false,
  counterReaction = null
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full flex flex-col justify-between">
      {/* Real-Time Live Reaction Banner (Dynamic Toast Bar) */}
      {counterReaction && (
        <div
          className={`sm:col-span-2 p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs ${
            counterReaction.type === 'shield'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
              : counterReaction.type === 'early_green'
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-900'
              : counterReaction.type === 'red'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-900'
              : counterReaction.type === 'black'
              ? 'bg-zinc-950 text-amber-300 border-zinc-800'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                counterReaction.type === 'shield'
                  ? 'bg-amber-500 text-white'
                  : counterReaction.type === 'early_green'
                  ? 'bg-cyan-600 text-white'
                  : counterReaction.type === 'red'
                  ? 'bg-rose-600 text-white'
                  : counterReaction.type === 'black'
                  ? 'bg-zinc-900 text-amber-400 border border-zinc-700'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {counterReaction.type === 'shield' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : counterReaction.type === 'early_green' ? (
                <Sparkles className="w-4 h-4" />
              ) : counterReaction.type === 'red' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>{counterReaction.title?.trim()}</span>
              </h4>
              <p className="text-[11px] opacity-90 font-normal mt-0.5">{counterReaction.text?.trim()}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {counterReaction.badges?.map((badge, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-2xs ${badge.className}`}
              >
                {badge.label?.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card 1: Green Points (Commitment) */}
      <div className="rounded-2xl p-4 sm:p-4.5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
                النقاط الخضراء (الالتزام)
              </h4>
              <p className="text-[10px] text-zinc-500 font-normal">سجل الانضباط اليومي</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>حضور منضبط</span>
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-950 tracking-tight font-mono tabular-nums">
              +{profile?.green_points || 0}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-700">نقطة مكتسبة</span>
              <span className="text-[10px] text-zinc-500 font-medium">+1 نقطة يومياً</span>
            </div>
          </div>

          <div className="text-end">
            <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md inline-block">
              هدف البونص: 20
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-normal">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-[10px]">08:30 ص - 09:15 ص</span>
          </span>
          <span className="text-emerald-700 font-semibold text-[10px]">نافذة الحضور وفترة السماح</span>
        </div>
      </div>

      {/* Card 2: Red Points (Late Arrival) */}
      <div className="rounded-2xl p-4 sm:p-4.5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
                النقاط الحمراء (التأخير)
              </h4>
              <p className="text-[10px] text-zinc-500 font-normal">جزاءات التأخير الصباحي</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
              (profile?.red_points || 0) > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (profile?.red_points || 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <span>{(profile?.red_points || 0) > 0 ? 'يوجد تأخير' : 'سجل نظيف'}</span>
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-950 tracking-tight font-mono tabular-nums">
              {profile?.red_points || 0}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-700">نقطة تأخير</span>
              <span className="text-[10px] text-zinc-500 font-medium">-250 ج.م / تأخير</span>
            </div>
          </div>

          <div className="text-end">
            {(profile?.red_points || 0) === 0 ? (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                راتبك محمي
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block">
                خصم {(profile?.red_points || 0) * 250} ج.م
              </span>
            )}
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-normal">
          {(profile?.red_points || 0) > 0 ? (
            <button
              onClick={handleRedeemRedPoint}
              disabled={isRedeemingRed || (profile?.green_points || 0) < 5}
              className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="استبدال 5 نقاط خضراء لإلغاء نقطة حمراء"
            >
              {isRedeemingRed ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>إلغاء نقطة حمراء مقابل 5 خضراء</span>
            </button>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-mono text-[10px]">09:16 ص - 10:30 ص</span>
              </span>
              <span className="text-zinc-600 font-medium text-[10px]">يحميه درع الحماية تلقائياً</span>
            </>
          )}
        </div>
      </div>

      {/* Card 3: Black Points (Absence) */}
      <div className="rounded-2xl p-4 sm:p-4.5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-amber-400 flex items-center justify-center shadow-2xs">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
                النقاط السوداء (الغياب)
              </h4>
              <p className="text-[10px] text-zinc-500 font-normal">إغلاق البوابة وعدم الحضور</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
              (profile?.black_points || 0) > 0
                ? 'bg-zinc-900 text-amber-400 border-zinc-800'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (profile?.black_points || 0) > 0 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
            <span>{(profile?.black_points || 0) > 0 ? 'يوجد غياب' : 'لا يوجد غياب'}</span>
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-950 tracking-tight font-mono tabular-nums">
              {profile?.black_points || 0}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900">نقطة غياب</span>
              <span className="text-[10px] text-zinc-500 font-medium">-500 ج.م / يوم</span>
            </div>
          </div>

          <div className="text-end">
            {(profile?.black_points || 0) > 0 ? (
              <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                خصم {(profile?.black_points || 0) * 500} ج.م
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                سجل نظيف
              </span>
            )}
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-normal">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-700" />
            <span className="font-mono text-[10px]">بعد 12:00 ظهراً (Black Cutoff)</span>
          </span>
          <span className="text-zinc-600 font-medium text-[10px]">تقيد عند إغلاق البوابة (-500 ج.م)</span>
        </div>
      </div>

      {/* Card 4: Early Green Credits (Defense Shield) */}
      <div className="rounded-2xl p-4 sm:p-4.5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
                الكريديت التعويضي
              </h4>
              <p className="text-[10px] text-zinc-500 font-normal">درع الحماية التلقائي للراتب</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>درع نشط</span>
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-950 tracking-tight font-mono tabular-nums">
              {profile?.early_green_credits || 0}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-cyan-800">رصيد حماية</span>
              <span className="text-[10px] text-zinc-500 font-medium">يمتص خصم التأخير</span>
            </div>
          </div>

          <div className="text-end">
            <span className="text-[10px] font-semibold text-cyan-900 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md inline-block">
              حماية 250 ج.م
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-normal">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span className="font-mono text-[10px]">08:30 ص - 09:00 ص</span>
          </span>
          <span className="text-cyan-800 font-semibold text-[10px]">يكتسب بالحضور المبكر</span>
        </div>
      </div>
    </div>
  );
}
