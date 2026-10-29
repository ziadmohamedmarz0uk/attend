'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../lib/axios';
import { broadcastSyncEvent, subscribeSyncEvents, SYNC_EVENTS } from '../../../lib/syncEvents';
import { calculateDistanceMeters } from '../../../utils/formatters';
import attendanceService from '../../../services/attendanceService';
import leaveService from '../../../services/leaveService';

// Extracted Feature Components
import GeofenceCheckInCard from '../../../components/employee/GeofenceCheckInCard';
import TrafficLightLedger from '../../../components/employee/TrafficLightLedger';
import MonthlyCalendarSection from '../../../components/employee/MonthlyCalendarSection';
import EmployeeDisputesTab from '../../../components/employee/EmployeeDisputesTab';
import EmployeeLeavesTab from '../../../components/employee/EmployeeLeavesTab';
import EmployeeWalletTab from '../../../components/employee/EmployeeWalletTab';
import SubmitDisputeModal from '../../../components/employee/SubmitDisputeModal';

// Icons
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  Check,
  User,
  Menu,
  LayoutDashboard,
  Wallet,
  CalendarDays,
  AlertTriangle,
  Calendar,
  AlertCircle,
  Crown,
  CheckCircle2,
  Activity,
  Sparkles,
  Banknote,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();

  // State Management
  const [profile, setProfile] = useState(user || null);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [counterReaction, setCounterReaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'calendar' | 'disputes' | 'leaves' | 'wallet'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Geolocation & Check-In State
  const [activeBranches, setActiveBranches] = useState([
    { id: 1, name: 'المقر الرئيسي - المعادي (HQ)', latitude: 30.044425, longitude: 31.235718, radius_meters: 200 }
  ]);
  const [selectedBranch, setSelectedBranch] = useState({
    id: 1,
    name: 'المقر الرئيسي - المعادي (HQ)',
    latitude: 30.044425,
    longitude: 31.235718,
    radius_meters: 200
  });

  const [currentCoords, setCurrentCoords] = useState(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [distanceToHQ, setDistanceToHQ] = useState(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false); // Default to Real Device GPS
  const [testSimulatedTime, setTestSimulatedTime] = useState(null); // '08:30' | '09:30' | '10:30' | '12:30'
  const [locationStatus, setLocationStatus] = useState('ready');
  const [locationError, setLocationError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Geofence Evaluation against selected branch radius
  const isInsideGeofence = distanceToHQ !== null && distanceToHQ <= (selectedBranch?.radius_meters || 50);

  // Live Attendance Gate Status & Working Hours Engine (07:00 AM - 12:00 PM)
  const getCurrentGateStatus = useCallback(() => {
    let hours, minutes;
    if (isSimulationMode && testSimulatedTime) {
      const parts = testSimulatedTime.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      hours = currentTime.getHours();
      minutes = currentTime.getMinutes();
    }
    const totalMinutes = hours * 60 + minutes;

    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const timeFormatted = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;

    // 1. Before 07:00 AM (< 420 mins)
    if (totalMinutes < 420) {
      return {
        isOpen: false,
        statusKey: 'before_hours',
        timeFormatted,
        badgeText: 'البوابة مغلقة (قبل مواعيد العمل)',
        badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        gateNote: 'مواعيد تسجيل الحضور تبدأ في تمام الساعة 07:00 صباحاً',
        buttonText: 'البوابة مغلقة (تفتح الساعة 07:00 ص)',
        tier: null,
      };
    }
    // 2. Early Window: 07:00 AM - 08:59 AM (420 to 539 mins) - specifically Early Window 08:30 - 09:00 AM
    if (totalMinutes < 540) {
      return {
        isOpen: true,
        statusKey: 'early',
        timeFormatted,
        badgeText: 'بوابة الحضور مفتوحة (حضور مبكر)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        gateNote: 'نافذة الحضور المبكر (08:30 - 09:00 ص) - تمنح +1 خضراء و +1 كريديت تعويضي لحماية الراتب',
        buttonText: 'تسجيل الحضور الآن (حضور مبكر + كريديت تعويضي)',
        tier: 'green',
      };
    }
    // 3. Grace Period: 09:00 AM - 09:15 AM (540 to 555 mins)
    if (totalMinutes <= 555) {
      return {
        isOpen: true,
        statusKey: 'on_time',
        timeFormatted,
        badgeText: 'بوابة الحضور مفتوحة (فترة السماح الرسمية)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        gateNote: 'فترة السماح الرسمية (09:00 - 09:15 ص) - حضور منضبط بالكامل بدون أي خصومات (+1 خضراء)',
        buttonText: 'تسجيل الحضور الآن (في الموعد الرسمي)',
        tier: 'green',
      };
    }
    // 4. Late Window: 09:16 AM - 11:59 AM (556 to 719 mins)
    if (totalMinutes < 720) {
      const isMorningLate = totalMinutes <= 630; // up to 10:30 AM
      return {
        isOpen: true,
        statusKey: 'late',
        timeFormatted,
        badgeText: 'بوابة الحضور مفتوحة (فترة تأخير)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        gateNote: isMorningLate
          ? 'فترة التأخير (09:16 - 10:30 ص) - تستهلك درع الحماية تلقائياً أو تحتسب نقطة حمراء'
          : 'تأخير متأخر قبل إغلاق البوابة (10:31 - 12:00 م) - تحتسب نقطة حمراء أو تستهلك درع الحماية',
        buttonText: 'تسجيل الحضور الآن (تأخير)',
        tier: 'red',
      };
    }
    // 5. After 12:00 PM (>= 720 mins) - Gate Closed Cutoff
    return {
      isOpen: false,
      statusKey: 'closed',
      timeFormatted,
      badgeText: 'البوابة مغلقة (انتهت مواعيد الحضور - Cutoff)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      gateNote: 'تم إغلاق البوابة في تمام الساعة 12:00 ظهراً (Black Cutoff) - تقيد نقطة سوداء وخصم يوم كامل',
      buttonText: 'البوابة مغلقة (انتهت فترة الحضور بعد 12:00 ظهراً)',
      tier: 'black',
    };
  }, [currentTime, isSimulationMode, testSimulatedTime]);

  // Single Execution & Double Click Guards
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Dynamic Monthly Bonus (Determined by Owner)
  const [monthlyBonusAmount, setMonthlyBonusAmount] = useState(2500);

  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [bonusClaimedThisMonth, setBonusClaimedThisMonth] = useState(false);

  const [isRedeemingRed, setIsRedeemingRed] = useState(false);

  // InstaPay Edit State
  const [editingInstaPay, setEditingInstaPay] = useState(false);
  const [instaPayHandle, setInstaPayHandle] = useState('ahmed.hassan@instapay');
  const [isSavingInstaPay, setIsSavingInstaPay] = useState(false);

  // Attendance History Calendar State
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [monthName, setMonthName] = useState('أكتوبر 2026');
  const [firstDayOffset, setFirstDayOffset] = useState(5); // Default 5 for Oct 1, 2026 (Thursday)
  const [calendarStats, setCalendarStats] = useState({ green_count: 24, red_count: 1, black_count: 0, leave_count: 6 });
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // InstaPay Payouts & Bonus History State
  const [payoutsList, setPayoutsList] = useState([]);
  const [payoutsSummary, setPayoutsSummary] = useState({ total_disbursed_egp: 7500, pending_payouts_count: 0 });
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  // Leave Form Submission State
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    isSubmitting: false,
  });

  // Dispute Ticket System State
  const [disputesList, setDisputesList] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    penaltyType: 'red_point',
    incidentDate: new Date().toISOString().split('T')[0],
    reason: '',
    isSubmitting: false,
  });

  // Toast Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Fetch Company HQ location and active branches dynamically from Backend API
  const fetchCompanyLocation = useCallback(async () => {
    try {
      let res;
      try {
        res = await apiClient.get('/branches/active');
      } catch (err) {
        try {
          res = await apiClient.get('/owner/branches');
        } catch {
          res = await apiClient.get('/owner/location');
        }
      }
      if (res.data && res.data.success && res.data.data) {
        const rawBranches = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        if (rawBranches.length > 0) {
          const formatted = rawBranches.map(d => ({
            id: d.id,
            name: d.name || 'مقر الفرع المعتمد',
            latitude: parseFloat(d.latitude),
            longitude: parseFloat(d.longitude),
            radius_meters: parseInt(d.radius_meters) || 100,
          }));
          setActiveBranches(prev => {
            if (prev && prev.length === formatted.length && prev.every((p, idx) => p.id === formatted[idx].id && p.latitude === formatted[idx].latitude && p.longitude === formatted[idx].longitude && p.radius_meters === formatted[idx].radius_meters && p.name === formatted[idx].name)) {
              return prev;
            }
            return formatted;
          });
          setSelectedBranch(prev => {
            if (prev && formatted.some(b => b.id === prev.id)) {
              const match = formatted.find(b => b.id === prev.id);
              if (prev.id === match.id && prev.latitude === match.latitude && prev.longitude === match.longitude && prev.radius_meters === match.radius_meters && prev.name === match.name) {
                return prev;
              }
              return match;
            }
            return formatted[0];
          });
        }
      }
    } catch (e) {
      console.warn('Unable to load company branches from API, using default locations.');
    }
  }, []);

  // Update distance when coordinates or selectedBranch update
  useEffect(() => {
    if (currentCoords && selectedBranch && !isSimulationMode) {
      const bDist = calculateDistanceMeters(
        currentCoords.latitude,
        currentCoords.longitude,
        selectedBranch.latitude,
        selectedBranch.longitude
      );
      setDistanceToHQ(bDist);
    }
  }, [currentCoords, selectedBranch, isSimulationMode]);

  // Guard to prevent concurrent locating loops
  const isLocatingRef = useRef(false);

  // Switch to Real Device GPS (Default Production Behavior with Anti-Spoofing Defense)
  const useRealGpsLocation = useCallback((targetBranch = selectedBranch, showToastFeedback = true) => {
    if (isLocatingRef.current) return;
    isLocatingRef.current = true;
    setIsSimulationMode(false);
    setTestSimulatedTime(null);
    setLocationStatus('locating');
    setLocationError('');
    if (typeof window === 'undefined' || !navigator.geolocation) {
      isLocatingRef.current = false;
      setLocationStatus('error');
      setLocationError('خاصية تحديد الموقع (Geolocation) غير مدعومة في متصفحك.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        isLocatingRef.current = false;
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const acc = position.coords.accuracy ? parseFloat(position.coords.accuracy.toFixed(1)) : null;

        setCurrentCoords({ latitude: lat, longitude: lng });
        setCurrentAccuracy(acc);

        const bBranch = targetBranch || selectedBranch;
        const bDist = calculateDistanceMeters(lat, lng, bBranch.latitude, bBranch.longitude);

        setDistanceToHQ(bDist);
        setLocationStatus('ready');
        if (showToastFeedback) {
          if (acc && acc > 50) {
            showToast(`تنبيه: دقة إشارة الـ GPS ضعيفة (${acc}م). يرجى التواجد في مكان مفتوح لضمان دقة الموقع.`, 'error');
          } else if (bDist <= (bBranch.radius_meters || 50)) {
            showToast(`تم تحديد موقعك الحقيقي بنجاح (${bDist}م من ${bBranch.name}) - داخل النطاق`, 'success');
          } else {
            showToast(`أنت خارج نطاق الفرع (${bDist >= 1000 ? (bDist / 1000).toFixed(1) + ' كم' : bDist + 'م'} من ${bBranch.name}) - يلزم التواجد ضمن ${bBranch.radius_meters || 50}م`, 'error');
          }
        }
      },
      (err) => {
        isLocatingRef.current = false;
        console.warn('Geolocation warning:', err);
        let errorMsg = 'تعذر جلب موقع الجهاز الحقيقي. تأكد من تفعيل إذن الـ GPS في جهازك.';
        if (err.code === 1) {
          errorMsg = 'تم رفض إذن الموقع من المتصفح. يرجى تفعيل إذن الموقع (Location) من إعدادات المتصفح.';
        } else if (err.code === 2) {
          errorMsg = 'إشارة الـ GPS غير متوفرة على جهازك حالياً. يرجى تشغيل خدمات الموقع.';
        } else if (err.code === 3) {
          errorMsg = 'انتهت مهلة البحث عن إشارة الـ GPS. يرجى التأكد من اتصال الإنترنت والخروج لمكان مكشوف.';
        }
        setLocationStatus('ready');
        setLocationError(errorMsg);
        if (showToastFeedback) {
          showToast(errorMsg, 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, [selectedBranch]);

  // Switch to Test Simulated Location (Inside 5m or Outside 165m)
  const setSimulatedLocation = (isInside = true, targetBranch = selectedBranch) => {
    setIsSimulationMode(true);
    const branch = targetBranch || selectedBranch;
    const simLat = branch?.latitude || 29.988846;
    const simLng = branch?.longitude || 31.256626;

    if (isInside) {
      setCurrentCoords({ latitude: simLat, longitude: simLng });
      setDistanceToHQ(5);
      setLocationStatus('ready');
      setLocationError('');
      showToast(`وضع الاختبار: تم ضبط الموقع داخل نطاق ${branch?.name || 'المقر'} (5 أمتار)`, 'success');
    } else {
      setCurrentCoords({ latitude: simLat + 0.0015, longitude: simLng + 0.0015 });
      setDistanceToHQ(165);
      setLocationStatus('ready');
      setLocationError('');
      showToast(`وضع الاختبار: تم ضبط الموقع خارج نطاق ${branch?.name || 'المقر'} (165 متراً)`, 'error');
    }
  };

  // Obtain Geolocation on mount
  const getMyLocation = useCallback(() => {
    if (isSimulationMode) {
      setSimulatedLocation(true);
    } else {
      useRealGpsLocation(selectedBranch, false);
    }
  }, [isSimulationMode, selectedBranch, useRealGpsLocation]);

  // Fetch Attendance History Calendar Data
  const fetchMonthlyHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setCalendarLoading(true);
    try {
      const res = await apiClient.get('/attendance/monthly-history');

      if (res.data && res.data.success) {
        const data = res.data.data;
        const days = data.days || [];
        setMonthlyHistory(prev => {
          if (JSON.stringify(prev) === JSON.stringify(days)) return prev;
          return days;
        });
        setMonthName(data.month_name || 'أكتوبر 2026');
        setFirstDayOffset(data.first_day_offset ?? 5);
        if (data.stats_summary) {
          setCalendarStats(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data.stats_summary)) return prev;
            return data.stats_summary;
          });
        }

        if (days.length > 0) {
          const todayNum = new Date().getDate();
          const foundToday = days.find((d) => d.day === todayNum) || days[0];
          setSelectedDay(prev => prev ? prev : foundToday);
        }
      }
    } catch (err) {
      console.warn('Backend server offline during fetchMonthlyHistory, generating client fallback calendar...');
    } finally {
      if (!isSilent) setCalendarLoading(false);
    }
  }, []);

  // Fetch InstaPay Payouts & Bonus History Data
  const fetchPayoutsHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setPayoutsLoading(true);
    try {
      const res = await apiClient.get('/payouts/history');

      if (res.data && res.data.success) {
        const data = res.data.data;
        const newPayouts = data.payouts || [];
        setPayoutsList(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newPayouts)) return prev;
          return newPayouts;
        });
        setPayoutsSummary(prev => {
          const newSummary = {
            total_disbursed_egp: data.total_disbursed_egp || 7500,
            pending_payouts_count: data.pending_payouts_count || 0,
          };
          if (JSON.stringify(prev) === JSON.stringify(newSummary)) return prev;
          return newSummary;
        });
      }
    } catch (err) {
      console.warn('Backend server offline during fetchPayoutsHistory, using fallback payouts history...');
    } finally {
      if (!isSilent) setPayoutsLoading(false);
    }
  }, []);

  // Fetch Dispute Tickets
  const fetchDisputes = useCallback(async (isSilent = false) => {
    if (!isSilent) setDisputesLoading(true);
    try {
      const res = await apiClient.get('/disputes');
      if (res.data && res.data.success) {
        const newDisputes = res.data.data || [];
        setDisputesList(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newDisputes)) return prev;
          return newDisputes;
        });
      }
    } catch (err) {
      console.warn('Backend server offline during fetchDisputes...');
    } finally {
      if (!isSilent) setDisputesLoading(false);
    }
  }, []);

  // Submit New Dispute Ticket
  const handleSubmitDispute = async (e) => {
    if (e) e.preventDefault();
    if (!disputeForm.reason || !disputeForm.reason.trim()) {
      showToast('يرجى تفنيط وتوضيح سبب التظلم والاعتراض بوضوح', 'error');
      return;
    }

    setDisputeForm((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await attendanceService.submitDispute({
        penalty_type: disputeForm.penaltyType,
        incident_date: disputeForm.incidentDate,
        reason: disputeForm.reason.trim(),
      });

      if (res && res.success) {
        showToast(res.message || 'تم تقديم طلب التظلم والاعتراض بنجاح!', 'success');
        broadcastSyncEvent(SYNC_EVENTS.DISPUTE_SUBMITTED);
        setIsDisputeModalOpen(false);
        setDisputeForm({
          penaltyType: 'red_point',
          incidentDate: new Date().toISOString().split('T')[0],
          reason: '',
          isSubmitting: false,
        });
        fetchDisputes();
        return;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ أثناء إرسال التظلم، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setDisputeForm((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const hasMountedRef = useRef(false);

  // Fetch Employee Profile & Data from MySQL Database
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent && !hasMountedRef.current) setLoading(true);
    if (!isSilent) setRefreshing(true);

    try {
      const resLedger = await attendanceService.getLedgerSummary();

      if (resLedger && resLedger.success) {
        const data = resLedger.data;
        setLedgerSummary(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
          return data;
        });
        if (data.monthly_bonus_amount) {
          setMonthlyBonusAmount(parseFloat(data.monthly_bonus_amount));
        }
        if (data.user) {
          setProfile(prev => {
            if (prev && JSON.stringify(prev) === JSON.stringify(data.user)) return prev;
            return data.user;
          });
          if (setUser) {
            setUser(prev => {
              if (prev && JSON.stringify(prev) === JSON.stringify(data.user)) return prev;
              return data.user;
            });
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(data.user));
          }
          if (data.user.insta_pay_number) {
            setInstaPayHandle(data.user.insta_pay_number);
          }
        }
        if (data.ledger_history) {
          setLedgerHistory(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data.ledger_history)) return prev;
            return data.ledger_history;
          });
        }
        if (typeof data.has_checked_in_today === 'boolean') {
          setHasCheckedInToday(data.has_checked_in_today);
        }
      }

      const resLeaves = await leaveService.getLeavesList();

      if (resLeaves && resLeaves.success) {
        const newLeaves = resLeaves.data?.leaves || [];
        setLeavesList(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newLeaves)) return prev;
          return newLeaves;
        });
      }

      await fetchCompanyLocation();
      await fetchMonthlyHistory(isSilent);
      await fetchPayoutsHistory(isSilent);
      await fetchDisputes(isSilent);
    } catch (err) {
      console.warn('Backend server offline during fetchData, loading cached profile');
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('user_data');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setProfile(parsed);
          } catch (e) { }
        }
      }
    } finally {
      hasMountedRef.current = true;
      if (!isSilent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchMonthlyHistory, fetchPayoutsHistory, fetchDisputes, fetchCompanyLocation, setUser]);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
      getMyLocation();
    }
  }, []);

  // Dedicated Real-Time Cross-Tab Event Subscription & Silent Heartbeat
  useEffect(() => {
    const unsubscribe = subscribeSyncEvents((evt) => {
      if ([
        SYNC_EVENTS.DISPUTE_UPDATED,
        SYNC_EVENTS.LEAVE_UPDATED,
        SYNC_EVENTS.MANUAL_OVERRIDE,
        SYNC_EVENTS.BONUS_GRANTED,
        SYNC_EVENTS.BONUS_SETTING_UPDATED
      ].includes(evt.type)) {
        fetchData(true);

        if (evt.type === SYNC_EVENTS.DISPUTE_UPDATED) {
          showToast('تحديث لحظي: تم مراجعة التظلم الخاص بك من الإدارة', 'success');
        } else if (evt.type === SYNC_EVENTS.LEAVE_UPDATED) {
          showToast('تحديث لحظي: تم تحديث حالة طلب الإجازة', 'success');
        } else if (evt.type === SYNC_EVENTS.MANUAL_OVERRIDE || evt.type === SYNC_EVENTS.BONUS_GRANTED) {
          showToast('تحديث لحظي: تم تحديث رصيدك المالي / النقاط المرورية', 'success');
        } else if (evt.type === SYNC_EVENTS.BONUS_SETTING_UPDATED) {
          showToast('تحديث لحظي: تم تعديل قيمة بونص الالتزام الشهري', 'success');
        }
      } else if (evt.type === SYNC_EVENTS.BRANCHES_UPDATED) {
        fetchCompanyLocation();
        showToast('تحديث لحظي: تم تحديث الفروع والنطاق الجغرافي', 'success');
      }
    });

    // Active Enterprise Heartbeat (Silent background polling every 15 seconds)
    const heartbeatTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchData(true);
    }, 15000);

    // Instant Refetch on Window Focus / Tab Visibility
    const handleFocus = () => {
      fetchData(true);
    };
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchData(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      clearInterval(heartbeatTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchCompanyLocation, fetchData]);

  // Handle GPS Check-In Action with 07:00 to 12:00 Time Tiers & Strict Geofencing
  const handleCheckIn = async (targetSimulatedTime = null, forceRecheckin = false, forceRed = false, customCoords = null) => {
    if (hasCheckedInToday && !forceRecheckin) {
      showToast('لقد قمت بتسجيل الحضور لهذا اليوم بالفعل! (يمكنك الضغط على زر إعادة الضبط لتجربة سيناريو آخر)', 'error');
      return;
    }
    if (isCheckingIn) return; // Anti-double click lock

    const effectiveCoords = customCoords || currentCoords;
    const targetBranch = selectedBranch || activeBranches[0] || { latitude: 30.044425, longitude: 31.235718, radius_meters: 100 };
    const effectiveDistance = customCoords
      ? calculateDistanceMeters(customCoords.latitude, customCoords.longitude, targetBranch?.latitude, targetBranch?.longitude)
      : distanceToHQ;
    const allowedRadius = targetBranch?.radius_meters || 50;
    const effectiveIsInside = effectiveDistance !== null && effectiveDistance <= allowedRadius;

    // 1. Strict Geofencing Check
    if (!effectiveIsInside) {
      showToast(`عذراً! لا يمكن تسجيل الحضور وأنت خارج مقر العمل المعتمد (${targetBranch?.name || 'الفرع'}). مسافتك الحالية هي ${effectiveDistance !== null ? effectiveDistance + 'م' : 'غير محددة'} بينما الحد الأقصى المسموح به هو ${allowedRadius}م.`, 'error');
      return;
    }

    // 2. Strict Attendance Hours Check
    const currentGate = getCurrentGateStatus();
    const effectiveSimTime = targetSimulatedTime || (isSimulationMode ? testSimulatedTime : null);
    if (!currentGate.isOpen && !effectiveSimTime) {
      if (currentGate.statusKey === 'before_hours') {
        showToast('بوابة الحضور مغلقة حالياً. تبدأ مواعيد تسجيل الحضور في تمام الساعة 07:00 صباحاً.', 'error');
      } else {
        showToast('عذراً! تم إغلاق بوابة الحضور اليومية في تمام الساعة 12:00 ظهراً (Black Cutoff). انتهت فترة الحضور ولا يمكن التسجيل الآن.', 'error');
      }
      return;
    }

    if (!effectiveCoords) {
      getMyLocation();
      showToast('جاري تحديد موضعك الجغرافي بالـ GPS أولاً...', 'error');
      return;
    }

    // 3. Anti-Spoofing & Fake GPS check
    if (!isSimulationMode && currentAccuracy && currentAccuracy > 50) {
      showToast(`عذراً! دقة إشارة الـ GPS ضعيفة (${currentAccuracy}م). يشترط دقة أعلى (أقل من 50 متراً) لضمان مصداقية البصمة ومنع التلاعب (Anti-Spoofing).`, 'error');
      return;
    }

    setIsCheckingIn(true);
    try {
      const payload = {
        latitude: effectiveCoords.latitude,
        longitude: effectiveCoords.longitude,
        accuracy: !isSimulationMode ? currentAccuracy : undefined,
        branch_id: targetBranch?.id,
        simulated_time: effectiveSimTime || undefined,
        allow_recheckin: forceRecheckin,
        force_red: forceRed
      };

      const res = await attendanceService.checkIn(payload);

      if (res && res.success) {
        const msg = res.message || 'تم تسجيل الحضور بنجاح!';
        showToast(msg, 'success');
        setHasCheckedInToday(true);
        if (res.data?.user) {
          setProfile(res.data.user);
          if (setUser) setUser(res.data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
          }
        }

        // Trigger Dynamic Visual Counter Interaction
        const attLog = res.data?.attendance_log;
        if (msg.includes('درع الحماية')) {
          setCounterReaction({
            type: 'shield',
            title: 'تأخير محمي بدرع الحماية',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' },
              { label: '-1 درع حماية مستهلك', className: 'bg-amber-600 text-white' }
            ],
            text: 'تفاعل العداد: تم استهلاك 1 كريديت تعويضي لحماية راتبك وإلغاء النقطة الحمراء بالكامل!'
          });
        } else if (attLog?.point_type === 'red' || msg.includes('نقطة حمراء') || msg.includes('خصم 250')) {
          setCounterReaction({
            type: 'red',
            title: 'تسجيل حضور متأخر',
            badges: [
              { label: '+1 نقطة حمراء', className: 'bg-rose-600 text-white' },
              { label: 'خصم 250 ج.م', className: 'bg-rose-700 text-white' }
            ],
            text: 'تفاعل العداد: زادت النقاط الحمراء (+1) وخُصم 250 ج.م من الرصيد المالي.'
          });
        } else if (msg.includes('كريديت') || msg.includes('مبكر')) {
          setCounterReaction({
            type: 'early_green',
            title: 'حضور مبكر سوبر',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' },
              { label: '+1 كريديت تعويضي', className: 'bg-cyan-600 text-white' }
            ],
            text: 'تفاعل العداد: تم منح +1 نقطة خضراء وإضافة +1 إلى رصيد الكريديت التعويضي المكتسب!'
          });
        } else {
          setCounterReaction({
            type: 'green',
            title: 'حضور في الموعد المعتمد',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' }
            ],
            text: 'تفاعل العداد: تم إضافة +1 إلى النقاط الخضراء (التزام كامل بدون خصم).'
          });
        }

        broadcastSyncEvent(SYNC_EVENTS.CHECKIN_RECORDED, { pointType: attLog?.point_type || 'green' });
        fetchData(true);
        setIsCheckingIn(false);
        return;
      } else if (res && res.data?.already_checked_in) {
        setHasCheckedInToday(true);
        showToast(res.message || 'تم تسجيل الحضور سابقاً اليوم.', 'error');
        setIsCheckingIn(false);
        return;
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.message) {
        if (errData.data?.already_checked_in) {
          setHasCheckedInToday(true);
        }
        showToast(errData.message, errData.success ? 'success' : 'error');
        setIsCheckingIn(false);
        return;
      }
      console.warn('Backend check-in API offline, applying client-side demo check-in...', err.message);
    }

    // Client fallback if offline - STRICTLY respects Geofencing & Time Rules
    if (!isInsideGeofence) {
      showToast(`عذراً! لا يمكن تسجيل الحضور خارج نطاق العمل المعتمد (${distanceToHQ}م من أصل ${selectedBranch?.radius_meters || 50}م).`, 'error');
      setIsCheckingIn(false);
      return;
    }

    const fallbackGate = getCurrentGateStatus();
    if (!fallbackGate.isOpen && !effectiveSimTime) {
      showToast(fallbackGate.gateNote, 'error');
      setIsCheckingIn(false);
      return;
    }

    // Offline Points Calculation based on Tier
    let reactionObj = null;
    setProfile((prev) => {
      if (!prev) return prev;
      let updated = { ...prev };
      if (fallbackGate.tier === 'green') {
        const isSuper = (effectiveSimTime && parseInt(effectiveSimTime.split(':')[0]) < 9);
        updated.green_points = (prev.green_points || 0) + 1;
        if (isSuper) {
          updated.early_green_credits = (prev.early_green_credits || 0) + 1;
          reactionObj = {
            type: 'early_green',
            title: 'حضور مبكر سوبر',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' },
              { label: '+1 كريديت تعويضي', className: 'bg-cyan-600 text-white' }
            ],
            text: 'تفاعل العداد: تم منح +1 نقطة خضراء وإضافة +1 إلى رصيد الكريديت التعويضي المكتسب!'
          };
        } else {
          reactionObj = {
            type: 'green',
            title: 'حضور في الموعد المعتمد',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' }
            ],
            text: 'تفاعل العداد: تم إضافة +1 إلى النقاط الخضراء (التزام كامل بدون خصم).'
          };
        }
      } else if (fallbackGate.tier === 'red') {
        if ((prev.early_green_credits || 0) > 0 && !forceRed) {
          updated.early_green_credits = prev.early_green_credits - 1;
          updated.green_points = (prev.green_points || 0) + 1;
          reactionObj = {
            type: 'shield',
            title: 'تأخير محمي بدرع الحماية',
            badges: [
              { label: '+1 نقطة خضراء', className: 'bg-emerald-600 text-white' },
              { label: '-1 درع حماية مستهلك', className: 'bg-amber-600 text-white' }
            ],
            text: 'تفاعل العداد: تم استهلاك 1 كريديت تعويضي لحماية راتبك وإلغاء النقطة الحمراء بالكامل!'
          };
        } else {
          updated.red_points = (prev.red_points || 0) + 1;
          updated.financial_balance = Math.max(0, (prev.financial_balance || 0) - 250);
          reactionObj = {
            type: 'red',
            title: 'تسجيل حضور متأخر',
            badges: [
              { label: '+1 نقطة حمراء', className: 'bg-rose-600 text-white' },
              { label: 'خصم 250 ج.م', className: 'bg-rose-700 text-white' }
            ],
            text: 'تفاعل العداد: زادت النقاط الحمراء (+1) وخُصم 250 ج.م من الرصيد المالي.'
          };
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updated));
      }
      return updated;
    });

    if (reactionObj) {
      setCounterReaction(reactionObj);
    }

    setHasCheckedInToday(true);
    broadcastSyncEvent(SYNC_EVENTS.CHECKIN_RECORDED, { pointType: fallbackGate.tier });
    if (fallbackGate.tier === 'green') {
      showToast('تم تسجيل الحضور بنجاح! احتساب نقطة خضراء (حضور في الموعد)', 'success');
    } else {
      showToast('تم تسجيل الحضور مع تأخير! احتساب نقطة حمراء أو تفعيل درع الحماية', 'error');
    }
    setIsCheckingIn(false);
  };

  // Handle Mark Absence / Gate Cutoff ("مجيتش خالص")
  const handleMarkAbsence = async (force = false) => {
    if (hasCheckedInToday && !force) {
      showToast('تم تسجيل حالة اليوم بالفعل. يمكنك إعادة الضبط لتجربة سيناريو آخر.', 'error');
      return;
    }
    if (isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      const res = await attendanceService.markAbsence({ reason: 'غياب كامل' });

      if (res && res.success) {
        showToast(res.message || 'تم تسجيل غياب اليوم واحتساب نقطة سوداء وخصم 500 ج.م', 'error');
        setHasCheckedInToday(true);
        if (res.data?.user) {
          setProfile(res.data.user);
          if (setUser) setUser(res.data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
          }
        }
        setCounterReaction({
          type: 'black',
          title: 'تسجيل غياب اليوم (إغلاق البوابة بعد 12:00 م)',
          badges: [
            { label: '+1 نقطة سوداء', className: 'bg-zinc-900 text-amber-400 border border-amber-500/50' },
            { label: 'خصم 500 ج.م', className: 'bg-rose-700 text-white' }
          ],
          text: 'تفاعل العداد: تم تسجيل غياب اليوم واحتساب +1 نقطة سوداء وخصم 500 ج.م من الرصيد المالي!'
        });
        broadcastSyncEvent(SYNC_EVENTS.CHECKIN_RECORDED, { pointType: 'black' });
        fetchData(true);
        setIsCheckingIn(false);
        return;
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.message) {
        showToast(errData.message, 'error');
        setIsCheckingIn(false);
        return;
      }
      console.warn('Backend mark-absence offline, applying client-side demo...', err.message);
    }

    // Client fallback
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        black_points: (prev.black_points || 0) + 1,
        financial_balance: Math.max(0, (prev.financial_balance || 0) - 500),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updated));
      }
      return updated;
    });
    setHasCheckedInToday(true);
    setCounterReaction({
      type: 'black',
      title: 'تسجيل غياب اليوم (إغلاق البوابة بعد 12:00 م)',
      badges: [
        { label: '+1 نقطة سوداء', className: 'bg-zinc-900 text-amber-400 border border-amber-500/50' },
        { label: 'خصم 500 ج.م', className: 'bg-rose-700 text-white' }
      ],
      text: 'تفاعل العداد: تم تسجيل غياب اليوم واحتساب +1 نقطة سوداء وخصم 500 ج.م من الرصيد المالي!'
    });
    showToast('تم تسجيل غياب اليوم واحتساب نقطة سوداء وخصم 500 ج.م', 'error');
    setIsCheckingIn(false);
  };

  // Reset Today's Check-In & Absence for Live Testing
  const handleResetTodayCheckIn = async () => {
    try {
      const res = await attendanceService.resetToday();
      if (res && res.success) {
        setHasCheckedInToday(false);
        setCounterReaction(null);
        broadcastSyncEvent(SYNC_EVENTS.CHECKIN_RECORDED);
        showToast('تمت إعادة ضبط حضور وغياب اليوم بنجاح! يمكنك الآن تجربة أي سيناريو آخر', 'success');
        fetchData(true);
        return;
      }
    } catch (err) {
      console.warn('Reset error fallback');
    }
    setHasCheckedInToday(false);
    setCounterReaction(null);
    showToast('تمت إعادة ضبط حضور وغياب اليوم بنجاح للاختبار', 'success');
  };

  // 1-Click Interactive Scenario Runner for Testing
  const handleTestScenario = async (scenario) => {
    if (scenario === 'absence') {
      await handleMarkAbsence(true);
      return;
    }

    const targetBranch = selectedBranch || activeBranches[0] || { latitude: 29.988846, longitude: 31.256626, radius_meters: 50 };

    if (scenario === 'out_of_range') {
      setIsSimulationMode(true);
      const outsideCoords = {
        latitude: targetBranch.latitude + 0.003,
        longitude: targetBranch.longitude + 0.003,
        accuracy: 10
      };
      setCurrentCoords(outsideCoords);
      setCurrentAccuracy(10);
      setDistanceToHQ(330);
      showToast(`وضع الاختبار: تم ضبط الموقع خارج نطاق ${targetBranch?.name || 'المقر'} (330 متراً) - تجربة حظر الـ Geofence`, 'error');
      return;
    }

    if (scenario === 'accuracy_error') {
      setIsSimulationMode(false);
      const currentLoc = currentCoords || { latitude: targetBranch.latitude, longitude: targetBranch.longitude };
      setCurrentCoords(currentLoc);
      setCurrentAccuracy(85);
      setDistanceToHQ(5);
      showToast('وضع الاختبار: دقة إشارة الـ GPS ضعيفة (±85م) - تنبيه نظام Anti-Spoofing', 'error');
      return;
    }

    // Force location inside branch (3m)
    setIsSimulationMode(true);
    const insideCoords = {
      latitude: targetBranch.latitude + 0.00002,
      longitude: targetBranch.longitude + 0.00002,
      accuracy: 5
    };

    setCurrentCoords(insideCoords);
    setCurrentAccuracy(5);
    setDistanceToHQ(3);

    if (scenario === 'early_credit') {
      setTestSimulatedTime('08:45');
      showToast('جاري اختبار سيناريو: نافذة الحضور المبكر (08:45 ص - كريديت تعويضي)...', 'success');
      await handleCheckIn('08:45', true, false, insideCoords);
    } else if (scenario === 'grace_period' || scenario === 'on_time') {
      setTestSimulatedTime('09:10');
      showToast('جاري اختبار سيناريو: فترة السماح الرسمية (09:10 ص - حضور منضبط)...', 'success');
      await handleCheckIn('09:10', true, false, insideCoords);
    } else if (scenario === 'late_window' || scenario === 'late_shield') {
      setTestSimulatedTime('09:45');
      showToast('جاري اختبار سيناريو: فترة التأخير الصباحي (09:45 ص - درع الحماية)...', 'error');
      await handleCheckIn('09:45', true, false, insideCoords);
    } else if (scenario === 'late_penalty') {
      setTestSimulatedTime('09:45');
      showToast('جاري اختبار سيناريو: فترة التأخير بدون رصيد (09:45 ص - خصم 250 ج.م)...', 'error');
      await handleCheckIn('09:45', true, true, insideCoords);
    }
  };

  // Redeem Red Point (Use 5 green points to cancel 1 red point)
  const handleRedeemRedPoint = async () => {
    if (isRedeemingRed) return; // Anti-double click lock
    if (!profile || profile.green_points < 5 || profile.red_points <= 0) {
      showToast('تتطلب هذه العملية 5 نقاط خضراء ونقطة حمراء واحدة مسجلة على الأقل.', 'error');
      return;
    }

    setIsRedeemingRed(true);
    try {
      const res = await attendanceService.redeemRedPoints();

      if (res && res.success) {
        showToast('تم إلغاء النقطة الحمراء واستبدال 5 نقاط خضراء بنجاح!', 'success');
        broadcastSyncEvent(SYNC_EVENTS.POINTS_CHANGED);
        fetchData(true);
        setIsRedeemingRed(false);
        return;
      }
    } catch (err) {
      console.warn('Backend redeem API offline, applying client-side fallback...', err.message);
    }

    setProfile((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        green_points: Math.max(0, (prev.green_points || 0) - 5),
        red_points: Math.max(0, (prev.red_points || 0) - 1),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updated));
      }
      if (setUser) setUser(updated);
      return updated;
    });

    showToast('تم إلغاء النقطة الحمراء واستبدال 5 نقاط خضراء بنجاح!', 'success');
    setIsRedeemingRed(false);
  };

  // Claim Monthly Commitment Bonus (Dynamic Amount Determined by Owner)
  const handleClaimBonus = async () => {
    if (isClaimingBonus || bonusClaimedThisMonth) return; // Anti-double click lock

    if ((profile?.red_points || 0) > 0 || (profile?.black_points || 0) > 0) {
      showToast('يشترط لصرف بونص الالتزام عدم وجود أي نقاط حمراء أو سوداء مسجلة.', 'error');
      return;
    }

    setIsClaimingBonus(true);
    try {
      const res = await attendanceService.claimBonus();

      if (res && res.success) {
        const amt = res.data?.bonus_amount || monthlyBonusAmount;
        showToast(res.message || `تم إيداع بونص الالتزام الشهري (${amt.toLocaleString()} ج.م) لحسابك بنجاح!`, 'success');
        broadcastSyncEvent(SYNC_EVENTS.POINTS_CHANGED);
        setBonusClaimedThisMonth(true);
        fetchData(true);
        setIsClaimingBonus(false);
        return;
      }
    } catch (err) {
      console.warn('Backend bonus API offline, applying client-side fallback...', err.message);
    }

    setProfile((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        financial_balance: (prev.financial_balance || 0) + monthlyBonusAmount,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updated));
      }
      if (setUser) setUser(updated);
      return updated;
    });

    setBonusClaimedThisMonth(true);
    showToast(`تم إيداع بونص الالتزام الشهري (${monthlyBonusAmount.toLocaleString()} ج.م) لحسابك بنجاح!`, 'success');
    setIsClaimingBonus(false);
  };

  // Submit New Leave Request
  const handleSubmitLeave = async (e) => {
    if (e) e.preventDefault();
    if (leaveForm.isSubmitting) return; // Anti-double click lock

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      showToast('يرجى ملء جميع الحقول المطلوبة لطلب الإجازة.', 'error');
      return;
    }

    setLeaveForm((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const payload = {
        start_date: leaveForm.startDate,
        end_date: leaveForm.endDate,
        reason: leaveForm.reason.trim(),
      };

      const res = await leaveService.submitLeave(payload);

      if (res && res.success) {
        showToast('تم تقديم طلب الإجازة وتوجيهه مباشرة للوحة التحكم للاعتماد!', 'success');
        broadcastSyncEvent(SYNC_EVENTS.LEAVE_SUBMITTED);
        setLeaveForm({ startDate: '', endDate: '', reason: '', isSubmitting: false });
        fetchData(true);
        return;
      }
    } catch (err) {
      console.warn('Backend leave API offline, applying client-side leave fallback...', err.message);
    }

    const newLeave = {
      id: Date.now(),
      start_date: leaveForm.startDate,
      end_date: leaveForm.endDate,
      reason: leaveForm.reason.trim(),
      status: 'pending',
    };

    setLeavesList((prev) => [newLeave, ...prev]);
    showToast('تم تقديم طلب الإجازة وتوجيهه مباشرة للوحة التحكم للاعتماد!', 'success');
    setLeaveForm({ startDate: '', endDate: '', reason: '', isSubmitting: false });
  };

  // Save InstaPay Handle Directly to MySQL Database
  const handleSaveInstaPay = async (newHandle) => {
    const handleToSave = (newHandle !== undefined ? newHandle : instaPayHandle)?.trim();
    if (!handleToSave) {
      showToast('يرجى إدخال عنوان أو رقم حساب InstaPay صالح', 'error');
      return;
    }

    setIsSavingInstaPay(true);
    try {
      const res = await attendanceService.updateInstaPay(handleToSave);
      if (res && res.success) {
        showToast(res.message || 'تم حفظ وتحديث حساب InstaPay في قاعدة البيانات بنجاح!', 'success');
        setInstaPayHandle(handleToSave);
        setEditingInstaPay(false);
        if (res.data?.user) {
          setProfile(res.data.user);
          if (setUser) setUser(res.data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
          }
        }
        return;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ أثناء حفظ عنوان InstaPay', 'error');
    } finally {
      setIsSavingInstaPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-950 flex font-sans dir-rtl relative">
      {/* Toast Notification Alert */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2.5 rounded-md border border-zinc-900 shadow-xl flex items-center gap-2.5 text-xs font-medium bg-zinc-950 text-white">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            {toast.type === 'success' ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-zinc-300" strokeWidth={2} />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-zinc-300" strokeWidth={2} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR (Right Navigation Bar for Employee Dashboard Light Theme RTL) */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-64 bg-white border-e border-zinc-200/80 z-40 flex flex-col justify-between p-4 transition-transform duration-200 shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Brand & Logo Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs border border-zinc-800 ring-1 ring-white/10 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-zinc-950 tracking-tight leading-none">حضور برو</h1>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    V2.4
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">بوابة الموظف الذكية</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>متصل</span>
            </div>
          </div>

          {/* User Profile Badge (Fintech ID Pass) */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-zinc-50/80 to-zinc-100/50 border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-2xs group">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs border border-zinc-800">
                  {profile?.name ? profile.name[0] : 'م'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-zinc-950 truncate">{profile?.name || 'أحمد حسن'}</p>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.2} />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                  {profile?.department || 'المقر الرئيسي'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-mono text-zinc-400">ID: EMP-{profile?.id || '2026'}</span>
              <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                حساب نشط
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>القائمة الرئيسية</span>
              <span className="font-mono text-[9px] text-zinc-400">5 أقسام</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs ${
                activeTab === 'overview'
                  ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 ${activeTab === 'overview' ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-950'}`}
                  strokeWidth={1.75}
                />
                <span>لوحة الحضور والـ GPS</span>
              </div>
              {activeTab === 'overview' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('calendar');
                setMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs ${
                activeTab === 'calendar'
                  ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays
                  className={`w-4 h-4 shrink-0 ${activeTab === 'calendar' ? 'text-emerald-400' : 'text-zinc-400'}`}
                  strokeWidth={1.75}
                />
                <span>تقويم السجل الشهري</span>
              </div>
              {activeTab === 'calendar' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('disputes');
                setMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs ${
                activeTab === 'disputes'
                  ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${activeTab === 'disputes' ? 'text-amber-400' : 'text-zinc-400'}`}
                  strokeWidth={1.75}
                />
                <span>التظلمات والاعتراضات</span>
              </div>
              {disputesList.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                    activeTab === 'disputes'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {disputesList.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('leaves');
                setMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs ${
                activeTab === 'leaves'
                  ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar
                  className={`w-4 h-4 shrink-0 ${activeTab === 'leaves' ? 'text-emerald-400' : 'text-zinc-400'}`}
                  strokeWidth={1.75}
                />
                <span>تقديم ومتابعة الإجازات</span>
              </div>
              {leavesList.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                    activeTab === 'leaves'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {leavesList.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('wallet');
                setMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs ${
                activeTab === 'wallet'
                  ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet
                  className={`w-4 h-4 shrink-0 ${activeTab === 'wallet' ? 'text-emerald-400' : 'text-zinc-400'}`}
                  strokeWidth={1.75}
                />
                <span>محفظة InstaPay والمستحقات</span>
              </div>
              {activeTab === 'wallet' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          {/* Live Geofence Telemetry Mini Card */}
          <div className="p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/70 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-zinc-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>حالة الـ Geofence</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {isInsideGeofence ? 'داخل المقر' : 'خارج النطاق'}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center justify-between font-mono">
              <span>{selectedBranch?.name || 'المقر الرئيسي'}</span>
              <span>نطاق {selectedBranch?.radius_meters || 50}م</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchData()}
            disabled={refreshing}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 hover:text-zinc-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-200 shadow-2xs active:scale-98 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} strokeWidth={1.75} />
            <span>تحديث البيانات الحية</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl text-zinc-500 hover:text-rose-700 hover:bg-rose-50/80 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:mr-64 min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="تبديل القائمة الجانبية"
              className="md:hidden p-2 rounded-lg bg-white text-zinc-700 hover:text-zinc-950 border border-zinc-200 cursor-pointer shadow-xs active:scale-95"
            >
              <Menu className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-950 tracking-tight">
                  بوابة الموظف والانضباط الذكي
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  تزامن لحظي نشط
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-normal mt-0.5">
                متابعة الحضور الميداني بالـ GPS • استحقاقات راتب InstaPay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={refreshing}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} strokeWidth={1.75} />
              <span>تحديث حي</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-950 text-white px-3 py-1.5 rounded-lg shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
              <span className="hidden md:inline">حساب موظف معتمد</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto relative z-10">
          {/* TAB 1: OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* EMPLOYEE KPI STAT CARDS WITH BESPOKE SPARKLINE CHARTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Green Points (Commitment) */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        النقاط الخضراء (الالتزام)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          +1 نقطة يومياً
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="my-3 flex items-baseline justify-between">
                    <div className="text-3xl font-black text-zinc-950 tabular-nums tracking-tight font-mono">
                      +{profile?.green_points || 0}{' '}
                      <span className="text-xs font-medium text-zinc-500 font-sans">نقطة</span>
                    </div>

                    {/* Mini Sparkline Green */}
                    <div className="w-20 h-8">
                      <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="grad-emp-green" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 2 24 C 18 20, 32 26, 48 12 C 60 4, 70 8, 78 2"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 2 24 C 18 20, 32 26, 48 12 C 60 4, 70 8, 78 2 L 78 32 L 2 32 Z"
                          fill="url(#grad-emp-green)"
                        />
                        <circle cx="78" cy="2" r="3" fill="#10b981" />
                      </svg>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>هدف البونص الشهري</span>
                    <span className="font-semibold text-emerald-700">20 نقطة مؤهلة</span>
                  </div>
                </div>

                {/* Card 2: Early Green Credits (Defense Shield) */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        درع الحماية التعويضي
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                          حماية تلقائية
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-50/80 border border-cyan-100 flex items-center justify-center text-cyan-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="my-3 flex items-baseline justify-between">
                    <div className="text-3xl font-black text-zinc-950 tabular-nums tracking-tight font-mono">
                      {profile?.early_green_credits || 0}{' '}
                      <span className="text-xs font-medium text-zinc-500 font-sans">كريديت</span>
                    </div>

                    {/* Mini Sparkline Cyan */}
                    <div className="w-20 h-8">
                      <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="grad-emp-cyan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 2 20 C 16 16, 30 22, 46 14 C 58 8, 68 12, 78 4"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 2 20 C 16 16, 30 22, 46 14 C 58 8, 68 12, 78 4 L 78 32 L 2 32 Z"
                          fill="url(#grad-emp-cyan)"
                        />
                        <circle cx="78" cy="4" r="3" fill="#06b6d4" />
                      </svg>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>يمتص خصم التأخير</span>
                    <span className="font-semibold text-cyan-700">درع نشط</span>
                  </div>
                </div>

                {/* Card 3: Penalties (Red & Black Points) */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        مخالفات التأخير والغياب
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            (profile?.red_points || 0) === 0 && (profile?.black_points || 0) === 0
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          {(profile?.red_points || 0) === 0 && (profile?.black_points || 0) === 0
                            ? 'سجل نظيف بالكامل'
                            : 'يوجد جزاءات مسجلة'}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="my-2 space-y-2">
                    <div className="flex items-center gap-2 tabular-nums font-mono">
                      <div className="flex-1 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 text-xs font-bold text-center">
                        {profile?.red_points || 0} أحمر
                      </div>
                      <div className="flex-1 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-900 text-white text-xs font-bold text-center">
                        {profile?.black_points || 0} أسود
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{
                          width: `${
                            (profile?.red_points || 0) === 0 && (profile?.black_points || 0) === 0 ? 100 : 20
                          }%`
                        }}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all"
                        style={{ width: `${Math.min(80, (profile?.red_points || 0) * 20)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>أحمر (-250 ج.م) • أسود (-500)</span>
                    <span className="font-semibold text-zinc-900">
                      {(profile?.red_points || 0) > 0 ? 'قابل للاستبدال' : 'راتب محمي'}
                    </span>
                  </div>
                </div>

                {/* Card 4: InstaPay Financial Balance */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_18px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        محفظة InstaPay والمستحقات
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          جاهز للصرف
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Banknote className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="my-3 flex items-baseline justify-between">
                    <div className="text-3xl font-black text-zinc-950 tabular-nums tracking-tight font-mono">
                      {Number(profile?.financial_balance ?? 0).toLocaleString()}{' '}
                      <span className="text-xs font-medium text-zinc-500 font-sans">ج.م</span>
                    </div>

                    {/* Mini Sparkline Finance */}
                    <div className="w-20 h-8">
                      <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="grad-emp-finance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 2 26 C 20 22, 34 24, 48 10 C 60 2, 70 8, 78 4"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 2 26 C 20 22, 34 24, 48 10 C 60 2, 70 8, 78 4 L 78 32 L 2 32 Z"
                          fill="url(#grad-emp-finance)"
                        />
                        <circle cx="78" cy="4" r="3" fill="#059669" />
                      </svg>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>كود InstaPay المعتمد</span>
                    <span className="font-semibold text-emerald-700">تحويل مباشر</span>
                  </div>
                </div>
              </div>

              {/* TOP SECTION: GPS Geofence & Traffic Light Counter Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1st Column: Modern GPS Geofence & Simulation Hub */}
                <div className="lg:col-span-1">
                  <GeofenceCheckInCard
                    activeBranches={activeBranches}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={setSelectedBranch}
                    currentCoords={currentCoords}
                    currentAccuracy={currentAccuracy}
                    distanceToHQ={distanceToHQ}
                    setDistanceToHQ={setDistanceToHQ}
                    isInsideGeofence={isInsideGeofence}
                    isSimulationMode={isSimulationMode}
                    setIsSimulationMode={setIsSimulationMode}
                    locationStatus={locationStatus}
                    hasCheckedInToday={hasCheckedInToday}
                    isCheckingIn={isCheckingIn}
                    getCurrentGateStatus={getCurrentGateStatus}
                    useRealGpsLocation={useRealGpsLocation}
                    handleCheckIn={handleCheckIn}
                    handleResetTodayCheckIn={handleResetTodayCheckIn}
                    handleMarkAbsence={handleMarkAbsence}
                    handleTestScenario={handleTestScenario}
                    isProduction={process.env.NODE_ENV === 'production'}
                  />
                </div>

                {/* 2nd & 3rd Column: Traffic Light Ledger Cards */}
                <div className="lg:col-span-2">
                  <TrafficLightLedger
                    profile={profile}
                    counterReaction={counterReaction}
                    handleRedeemRedPoint={handleRedeemRedPoint}
                    isRedeemingRed={isRedeemingRed}
                  />
                </div>
              </div>

              {/* Monthly Attendance Calendar Section */}
              <MonthlyCalendarSection
                monthName={monthName}
                calendarStats={calendarStats}
                calendarLoading={calendarLoading}
                fetchMonthlyHistory={fetchMonthlyHistory}
                firstDayOffset={firstDayOffset}
                monthlyHistory={monthlyHistory}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />

              {/* Disputes Section in Overview */}
              <EmployeeDisputesTab
                disputesList={disputesList}
                disputesLoading={disputesLoading}
                setIsDisputeModalOpen={setIsDisputeModalOpen}
              />
            </div>
          )}

          {/* TAB 2: STANDALONE CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <MonthlyCalendarSection
              monthName={monthName}
              calendarStats={calendarStats}
              calendarLoading={calendarLoading}
              fetchMonthlyHistory={fetchMonthlyHistory}
              firstDayOffset={firstDayOffset}
              monthlyHistory={monthlyHistory}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          )}

          {/* TAB 3: DISPUTES TAB */}
          {activeTab === 'disputes' && (
            <EmployeeDisputesTab
              disputesList={disputesList}
              disputesLoading={disputesLoading}
              setIsDisputeModalOpen={setIsDisputeModalOpen}
            />
          )}

          {/* TAB 4: LEAVES TAB */}
          {activeTab === 'leaves' && (
            <EmployeeLeavesTab
              leaveForm={leaveForm}
              setLeaveForm={setLeaveForm}
              handleSubmitLeave={handleSubmitLeave}
              leavesList={leavesList}
            />
          )}

          {/* TAB 5: WALLET TAB */}
          {activeTab === 'wallet' && (
            <EmployeeWalletTab
              profile={profile}
              monthlyBonusAmount={monthlyBonusAmount}
              handleClaimBonus={handleClaimBonus}
              isClaimingBonus={isClaimingBonus}
              bonusClaimedThisMonth={bonusClaimedThisMonth}
              editingInstaPay={editingInstaPay}
              setEditingInstaPay={setEditingInstaPay}
              instaPayHandle={instaPayHandle}
              setInstaPayHandle={setInstaPayHandle}
              handleSaveInstaPay={handleSaveInstaPay}
              isSavingInstaPay={isSavingInstaPay}
              payoutsSummary={payoutsSummary}
              fetchPayoutsHistory={fetchPayoutsHistory}
              payoutsLoading={payoutsLoading}
              payoutsList={payoutsList}
              ledgerHistory={ledgerHistory}
            />
          )}

          {/* DISPUTE SUBMISSION MODAL */}
          <SubmitDisputeModal
            isOpen={isDisputeModalOpen}
            onClose={() => setIsDisputeModalOpen(false)}
            disputeForm={disputeForm}
            setDisputeForm={setDisputeForm}
            handleSubmitDispute={handleSubmitDispute}
          />
        </main>
      </div>
    </div>
  );
}
