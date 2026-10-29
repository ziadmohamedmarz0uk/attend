import React from 'react';
import {
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Clock,
  ShieldCheck,
  Building2,
  Radio,
  Lock
} from 'lucide-react';
import { calculateDistanceMeters } from '../../utils/formatters';

export default function GeofenceCheckInCard({
  activeBranches = [],
  selectedBranch,
  setSelectedBranch,
  currentCoords,
  currentAccuracy,
  distanceToHQ,
  setDistanceToHQ,
  isInsideGeofence,
  isSimulationMode,
  setIsSimulationMode,
  locationStatus,
  hasCheckedInToday,
  isCheckingIn,
  getCurrentGateStatus,
  useRealGpsLocation,
  handleCheckIn,
  handleResetTodayCheckIn,
  handleMarkAbsence,
  handleTestScenario,
  isProduction = false
}) {
  const currentGate = getCurrentGateStatus
    ? getCurrentGateStatus()
    : { isOpen: true, statusKey: 'on_time', badgeText: 'في الموعد', timeFormatted: '', tier: 'green' };

  const isLocating = locationStatus === 'locating';
  const isGeofenceBlocked = !isInsideGeofence;
  const isGateBlocked = !currentGate.isOpen;
  const isBeforeHours = currentGate.statusKey === 'before_hours';
  const isGateCutoff = currentGate.statusKey === 'closed';

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between space-y-4 relative overflow-hidden">
      {/* Top Hairline Ambient Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 pointer-events-none" />

      {/* Header: Title & Geofence Status Badge */}
      <div className="space-y-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-950 leading-tight">بوابة الحضور الذكية</h4>
              <p className="text-[11px] text-zinc-500 font-normal">نطاق جغرافي مؤمّن • Geofence V2.4</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 shrink-0 ${
              isInsideGeofence
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInsideGeofence ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isInsideGeofence ? 'داخل النطاق' : 'خارج النطاق'}</span>
          </span>
        </div>

        {/* Mode Segmented Switcher (Disabled / Hidden in Production Mode) */}
        {!isProduction ? (
          <div className="p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/70 grid grid-cols-2 gap-1 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsSimulationMode(false);
                if (useRealGpsLocation) useRealGpsLocation(selectedBranch);
              }}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isSimulationMode
                  ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold'
                  : 'text-zinc-500 hover:text-zinc-950 font-medium'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>الموقع الفعلي (GPS)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSimulationMode(true)}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSimulationMode
                  ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold'
                  : 'text-zinc-500 hover:text-zinc-950 font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-800" />
              <span>وضع المحاكاة السريع</span>
            </button>
          </div>
        ) : (
          <div className="py-1 px-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between text-[11px] text-zinc-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحديد الموقع الفعلي عبر الأقمار الصناعية (Live GPS)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              مؤمّن ضد التلاعب
            </span>
          </div>
        )}
      </div>

      {/* Mode-Specific Body */}
      {(!isSimulationMode || isProduction) ? (
        /* 1. REAL GPS MODE */
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          {/* Gate Status Bar with Live Digital Clock */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentGate.statusKey === 'on_time'
                    ? 'bg-emerald-500 animate-pulse'
                    : currentGate.statusKey === 'late'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="font-semibold text-zinc-800 text-[11px]">{currentGate.badgeText}</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-zinc-800 px-2 py-0.5 rounded-md bg-white border border-zinc-200 dir-ltr tabular-nums">
              {currentGate.timeFormatted || '08:30 ص'}
            </span>
          </div>

          {/* BESPOKE RADAR HUD VISUALIZER (Linear / Apple Find My style) */}
          <div className="relative rounded-2xl bg-gradient-to-b from-zinc-50/90 via-zinc-50/50 to-zinc-100/60 border border-zinc-200/80 p-4 overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Background Sonar Rings Vector Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="30" fill="none" stroke="#d4d4d8" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="#f4f4f5" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="2 4" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="2 4" />
              </svg>
            </div>

            {/* Glowing Center Beacon */}
            <div className="relative mb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isInsideGeofence
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 ring-4 ring-emerald-500/10 shadow-xs'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/30 ring-4 ring-rose-500/10 shadow-xs'
                }`}
              >
                <Navigation
                  className={`w-5 h-5 transition-transform ${
                    isInsideGeofence ? 'rotate-[-45deg] text-emerald-600' : 'rotate-[135deg] text-rose-600'
                  }`}
                />
              </div>
              <span
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isInsideGeofence ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Main Distance Readout */}
            <div className="relative z-10 flex items-baseline justify-center gap-1.5 dir-ltr">
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight font-mono tabular-nums">
                {distanceToHQ !== null
                  ? distanceToHQ >= 1000
                    ? (distanceToHQ / 1000).toFixed(1)
                    : distanceToHQ
                  : locationStatus === 'locating'
                  ? '...'
                  : '0'}
              </span>
              <span className="text-xs font-bold text-zinc-600 font-sans">
                {distanceToHQ !== null && distanceToHQ >= 1000 ? 'كم' : 'متر'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 font-medium mt-1">
              {isInsideGeofence
                ? `داخل نطاق السماح (${selectedBranch?.radius_meters || 50}م)`
                : `يلزم الاقتراب لمسافة ${selectedBranch?.radius_meters || 50}م`}
            </p>

            {/* Micro GPS Precision & Satellite Strength Bar */}
            <div className="mt-2.5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-zinc-200/80 shadow-2xs text-[10px] text-zinc-600">
              <div className="flex items-end gap-0.5" title="قوة إشارة الـ GPS">
                <span className={`w-1 h-1.5 rounded-xs ${currentAccuracy ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span className={`w-1 h-2 rounded-xs ${currentAccuracy && currentAccuracy <= 100 ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span className={`w-1 h-2.5 rounded-xs ${currentAccuracy && currentAccuracy <= 50 ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span className={`w-1 h-3 rounded-xs ${currentAccuracy && currentAccuracy <= 20 ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
              </div>
              <span className="font-mono tabular-nums">
                {currentAccuracy ? `دقة إشارة: ±${currentAccuracy}م` : 'إشارة GPS متصلة'}
              </span>
            </div>
          </div>

          {/* Branch Selector Dropdown */}
          {activeBranches.length > 1 ? (
            <div className="space-y-1">
              <label htmlFor="branch-selector" className="text-[10px] font-semibold text-zinc-500 block text-right">
                فرع الحضور المختار:
              </label>
              <div className="relative">
                <select
                  id="branch-selector"
                  value={selectedBranch?.id || ''}
                  onChange={(e) => {
                    const b = activeBranches.find((x) => x.id === parseInt(e.target.value));
                    if (b) {
                      setSelectedBranch(b);
                      if (currentCoords && setDistanceToHQ) {
                        const d = calculateDistanceMeters(
                          currentCoords.latitude,
                          currentCoords.longitude,
                          b.latitude,
                          b.longitude
                        );
                        setDistanceToHQ(d);
                      }
                    }
                  }}
                  className="w-full text-xs font-semibold bg-zinc-50/80 hover:bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors cursor-pointer"
                >
                  {activeBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} (نطاق: {branch.radius_meters}م)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-zinc-50/80 border border-zinc-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-700 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{selectedBranch?.name || 'المقر الرئيسي'}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                نطاق {selectedBranch?.radius_meters || 50}م
              </span>
            </div>
          )}

          {/* Action Button Section with Context-Aware Logic */}
          <div className="pt-1">
            {hasCheckedInToday ? (
              <div className="space-y-2">
                <div className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم تسجيل حضور اليوم بنجاح</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetTodayCheckIn}
                  className="w-full py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة الضبط للتجربة مجدداً</span>
                </button>
              </div>
            ) : isBeforeHours ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl font-semibold text-xs bg-zinc-100 text-zinc-400 border border-zinc-200 flex items-center justify-center gap-2 cursor-not-allowed shadow-2xs"
                >
                  <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>بوابة الحضور مغلقة (تبدأ 07:00 ص)</span>
                </button>
                <p className="text-[10px] text-zinc-500 text-center font-normal">
                  يمكنك استخدام &quot;وضع المحاكاة السريع&quot; بالأعلى لتجربة البصمة الآن
                </p>
              </div>
            ) : isGateCutoff ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAbsence && handleMarkAbsence()}
                  disabled={isCheckingIn}
                  className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-400 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تسجيل غياب اليوم واحتساب نقطة سوداء</span>
                </button>
                <p className="text-[10px] text-zinc-500 text-center font-normal">
                  أغلقت البوابة بعد الساعة 12:00 ظهراً
                </p>
              </div>
            ) : (() => {
              const isDisabled = isCheckingIn || isLocating || isGeofenceBlocked;
              let btnClass = 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-xs cursor-pointer active:scale-98';
              let btnIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              let btnLabel = 'تسجيل الحضور الآن (في الموعد)';

              if (isCheckingIn) {
                btnClass = 'bg-zinc-100 text-zinc-700 border border-zinc-200 cursor-wait';
                btnIcon = <Loader2 className="w-4 h-4 animate-spin shrink-0 text-zinc-700" />;
                btnLabel = 'جاري التحقق وتسجيل الحضور بالـ GPS...';
              } else if (isLocating) {
                btnClass = 'bg-zinc-100 text-zinc-600 border border-zinc-200 cursor-wait';
                btnIcon = <Loader2 className="w-4 h-4 animate-spin shrink-0 text-zinc-500" />;
                btnLabel = 'جاري تحديد موقعك بالـ GPS...';
              } else if (isGeofenceBlocked) {
                btnClass = 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed';
                btnIcon = <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />;
                btnLabel = `خارج نطاق الفرع (${
                  distanceToHQ !== null
                    ? distanceToHQ >= 1000
                      ? `${(distanceToHQ / 1000).toFixed(1)} كم`
                      : `${distanceToHQ}م`
                    : 'بعيد'
                })`;
              } else if (currentGate.tier === 'red') {
                btnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer active:scale-98';
                btnIcon = <AlertTriangle className="w-4 h-4 text-white shrink-0" />;
                btnLabel = 'تسجيل الحضور الآن (فترة تأخير)';
              }

              return (
                <button
                  type="button"
                  onClick={() => handleCheckIn && handleCheckIn()}
                  disabled={isDisabled}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${btnClass}`}
                >
                  {btnIcon}
                  <span>{btnLabel}</span>
                </button>
              );
            })()}
          </div>
        </div>
      ) : (
        /* 2. SIMPLE, PROFESSIONAL TESTING MODE (3 SCENARIOS + 1 RESET) */
        <div className="space-y-2.5 flex-1 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-900 flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>اختر سيناريو لتجربة العدادات:</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700">
              ضغطة واحدة
            </span>
          </div>

          {/* 5 Clickable Scenario Cards */}
          <div className="space-y-1.5 overflow-y-auto max-h-[340px] pr-0.5">
            {/* Scenario 1: Early Window (08:30 - 09:00 AM) */}
            <button
              type="button"
              onClick={() => handleTestScenario && handleTestScenario('early_credit')}
              disabled={isCheckingIn}
              className="w-full p-2 rounded-xl bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-200/80 transition-all text-start group flex items-center justify-between gap-2 shadow-2xs cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  08:45
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-cyan-950">
                    1. نافذة الحضور المبكر (08:30 - 09:00 ص)
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    يمنحك +1 خضراء و +1 كريديت تعويضي لحماية راتبك
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-cyan-800 border border-cyan-200 group-hover:bg-cyan-700 group-hover:text-white transition-all shrink-0">
                تجربة ←
              </span>
            </button>

            {/* Scenario 2: Official Grace Period (09:00 - 09:15 AM) */}
            <button
              type="button"
              onClick={() => handleTestScenario && handleTestScenario('grace_period')}
              disabled={isCheckingIn}
              className="w-full p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 transition-all text-start group flex items-center justify-between gap-2 shadow-2xs cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  09:10
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950">
                    2. فترة السماح الرسمية (09:00 - 09:15 ص)
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    حضور منضبط بالكامل بدون أي خصومات (+1 خضراء)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                تجربة ←
              </span>
            </button>

            {/* Scenario 3: Late Window (09:16 - 10:30 AM) */}
            <button
              type="button"
              onClick={() => handleTestScenario && handleTestScenario('late_window')}
              disabled={isCheckingIn}
              className="w-full p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 transition-all text-start group flex items-center justify-between gap-2 shadow-2xs cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  09:45
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-950">
                    3. فترة التأخير (09:16 - 10:30 ص)
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    يستهلك درع الحماية تلقائياً أو يحتسب نقطة حمراء (-250 ج.م)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-amber-800 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
                تجربة ←
              </span>
            </button>

            {/* Scenario 4: Out of Range (Geofence Block) */}
            <button
              type="button"
              onClick={() => handleTestScenario && handleTestScenario('out_of_range')}
              disabled={isCheckingIn}
              className="w-full p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all text-start group flex items-center justify-between gap-2 shadow-2xs cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  330م
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">
                    4. خارج نطاق المقر (330 متراً)
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    تجربة حظر الحضور الجغرافي (Geofence Block)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-zinc-700 border border-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all shrink-0">
                تجربة ←
              </span>
            </button>

            {/* Scenario 5: Absent Cutoff (12:00 PM) */}
            <button
              type="button"
              onClick={() => handleTestScenario && handleTestScenario('absence')}
              disabled={isCheckingIn}
              className="w-full p-2 rounded-xl bg-zinc-100/70 hover:bg-zinc-100 border border-zinc-200 transition-all text-start group flex items-center justify-between gap-2 shadow-2xs cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  12:05
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">
                    5. موعد الإغلاق وقيد الغياب (12:00 م Cutoff)
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    إغلاق البوابة: +1 سوداء وخصم 500 ج.م
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-zinc-800 border border-zinc-300 group-hover:bg-zinc-950 group-hover:text-white transition-all shrink-0">
                تجربة ←
              </span>
            </button>
          </div>

          {/* Reset Button */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleResetTodayCheckIn}
              className="w-full py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>إعادة تصفير اليوم للاختبار مجدداً</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
