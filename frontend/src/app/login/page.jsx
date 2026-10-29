'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
  MapPin,
  Activity,
  AlertCircle,
  UserCheck,
  Briefcase,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  Crown
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  // If user is already logged in, redirect them based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        router.push('/dashboard/owner');
      } else {
        router.push('/dashboard/employee');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور للبدء.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        const targetRole = res.user?.role || 'employee';
        if (targetRole === 'owner') {
          router.push('/dashboard/owner');
        } else {
          router.push('/dashboard/employee');
        }
      } else {
        setErrorMsg(res.message || 'بيانات الاعتماد غير صحيحة. يرجى التحقق وإعادة المحاولة.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setIsSubmitting(false);
      setActiveDemo(null);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword, demoKey) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
    setIsSubmitting(true);
    setActiveDemo(demoKey);

    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        const targetRole = res.user?.role || 'employee';
        if (targetRole === 'owner') {
          router.push('/dashboard/owner');
        } else {
          router.push('/dashboard/employee');
        }
      } else {
        setErrorMsg(res.message || 'تعذر تسجيل الدخول بالحساب التجريبي.');
      }
    } catch (err) {
      setErrorMsg('خطأ أثناء إجراء الدخول السريع التجريبي.');
    } finally {
      setIsSubmitting(false);
      setActiveDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative font-sans dir-rtl overflow-hidden">
      
      {/* Ambient Minimal Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-auto w-full">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Branding & Value Prop */}
          <div className="space-y-6 hidden lg:block pe-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
              </span>
              <span>نظام الحضور والرواتب الذكي | الإصدار v2.5.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.25]">
                منظومة إثبات الحضور <br/> والتحفيز الذكية
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-md font-medium">
                بنية تحتية متطورة لإدارة الحضور جغرافياً، النقاط المرورية التلقائية، والتقارير المالية بضغطة زر واحدة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 shadow-xs hover:border-slate-300 transition-colors">
                <MapPin className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-sm text-slate-900">تحقق جغرافي دقيق</h3>
                <p className="text-xs text-slate-500 font-medium">Multi-Branch Geofencing</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 shadow-xs hover:border-slate-300 transition-colors">
                <Activity className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-sm text-slate-900">نقاط مرورية لحظية</h3>
                <p className="text-xs text-slate-500 font-medium">Automated Traffic Logic</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 shadow-xs hover:border-slate-300 transition-colors">
                <ShieldCheck className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-sm text-slate-900">حصانة إلكترونية</h3>
                <p className="text-xs text-slate-500 font-medium">Automated Leave Immunity</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 shadow-xs hover:border-slate-300 transition-colors">
                <Cpu className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-sm text-slate-900">تصدير InstaPay</h3>
                <p className="text-xs text-slate-500 font-medium">Excel & PDF Reports</p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Only Header */}
            <div className="lg:hidden text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-900" /> GPS Geofence
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                نظام الحضور الذكي
              </h1>
            </div>

            {/* Premium Clean Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
              <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">تسجيل الدخول</h2>
                  <p className="text-xs text-slate-500 mt-0.5">أدخل بيانات حسابك للمتابعة</p>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">
                    <p className="font-bold">تعذر تسجيل الدخول</p>
                    <p className="mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@pms.com"
                      disabled={isSubmitting}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl ps-10 pe-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl ps-10 pe-11 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl shadow-xs transition-all duration-200 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting && !activeDemo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحقق...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول للنظام</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Access Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500 flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                    دخول تجريبي سريع (Demo)
                  </span>
                </div>
              </div>

              {/* Demo Access Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Owner Demo Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('owner@company.com', '123456', 'owner')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-right flex flex-col justify-between disabled:opacity-60 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Crown className="w-3.5 h-3.5 text-slate-800" />
                      دخول كـ Owner
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    لوحة الإدارة الكاملة
                  </p>
                  {activeDemo === 'owner' && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-900 font-bold z-20">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </button>

                {/* Employee Demo Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('ahmed@company.com', '123456', 'emp1')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-right flex flex-col justify-between disabled:opacity-60 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <UserCheck className="w-3.5 h-3.5 text-slate-800" />
                      دخول كـ Employee
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    الحضور بالـ GPS والنقاط
                  </p>
                  {activeDemo === 'emp1' && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-900 font-bold z-20">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/80 backdrop-blur-xs relative z-10 font-medium">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - Smart Attendance Enterprise System
      </div>
    </div>
  );
}
