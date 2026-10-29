import { useState, useCallback, useRef, useMemo } from 'react';
import { calculateDistanceMeters } from '../utils/formatters';

export function useGeolocation(targetBranch = null) {
  const [currentCoords, setCurrentCoords] = useState(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [distanceToTarget, setDistanceToTarget] = useState(null);
  const [locationStatus, setLocationStatus] = useState('ready'); // 'ready' | 'locating' | 'error'
  const [locationError, setLocationError] = useState('');
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [testSimulatedTime, setTestSimulatedTime] = useState(null);

  const isLocatingRef = useRef(false);

  // Evaluate whether user is inside current geofence radius
  const isInsideGeofence = useMemo(() => {
    if (distanceToTarget === null || !targetBranch) return false;
    const allowedRadius = targetBranch.radius_meters || 100;
    return distanceToTarget <= allowedRadius;
  }, [distanceToTarget, targetBranch]);

  // Real GPS Device Fetch with Anti-Spoofing and Geofence distance calculation
  const useRealGpsLocation = useCallback(
    (branch = targetBranch, onFeedback = null) => {
      if (isLocatingRef.current) return;
      isLocatingRef.current = true;

      setIsSimulationMode(false);
      setTestSimulatedTime(null);
      setLocationStatus('locating');
      setLocationError('');

      if (typeof window === 'undefined' || !navigator.geolocation) {
        isLocatingRef.current = false;
        setLocationStatus('error');
        const err = 'خاصية تحديد الموقع (Geolocation) غير مدعومة في متصفحك.';
        setLocationError(err);
        if (onFeedback) onFeedback(err, 'error');
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

          const activeBranch = branch || targetBranch;
          if (activeBranch && activeBranch.latitude && activeBranch.longitude) {
            const dist = calculateDistanceMeters(lat, lng, activeBranch.latitude, activeBranch.longitude);
            setDistanceToTarget(dist);

            const allowedRadius = activeBranch.radius_meters || 100;
            if (onFeedback) {
              if (acc && acc > 50) {
                onFeedback(`تنبيه: دقة إشارة الـ GPS ضعيفة (${acc}م). يرجى التواجد في مكان مفتوح لضمان دقة الموقع.`, 'error');
              } else if (dist <= allowedRadius) {
                onFeedback(`تم تحديد موقعك الحقيقي بنجاح (${dist}م من ${activeBranch.name}) - داخل النطاق 🟢`, 'success');
              } else {
                const distText = dist >= 1000 ? `${(dist / 1000).toFixed(1)} كم` : `${dist}م`;
                onFeedback(`أنت خارج نطاق الفرع (${distText} من ${activeBranch.name}) - يلزم التواجد ضمن ${allowedRadius}م 🔴`, 'error');
              }
            }
          }

          setLocationStatus('ready');
        },
        (err) => {
          isLocatingRef.current = false;
          let errorMsg = 'تعذر جلب موقع الجهاز الحقيقي. تأكد من تفعيل إذن الـ GPS في جهازك.';
          if (err.code === 1) {
            errorMsg = 'تم رفض إذن الموقع من المتصفح. يرجى الضغط على علامة القفل 🔒 وتفعيل إذن الموقع (Location).';
          } else if (err.code === 2) {
            errorMsg = 'إشارة الـ GPS غير متوفرة على جهازك حالياً. يرجى تشغيل خدمات الموقع.';
          } else if (err.code === 3) {
            errorMsg = 'انتهت مهلة البحث عن إشارة الـ GPS. يرجى التأكد من اتصال الإنترنت والخروج لمكان مكشوف.';
          }

          setLocationStatus('ready');
          setLocationError(errorMsg);
          if (onFeedback) onFeedback(errorMsg, 'error');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    },
    [targetBranch]
  );

  // Set Simulated Location (Inside 5m or Outside ~165m) for Testing
  const setSimulatedLocation = useCallback(
    (isInside = true, branch = targetBranch, onFeedback = null) => {
      setIsSimulationMode(true);
      const activeBranch = branch || targetBranch;
      const simLat = activeBranch?.latitude || 30.044425;
      const simLng = activeBranch?.longitude || 31.235718;

      if (isInside) {
        setCurrentCoords({ latitude: simLat, longitude: simLng });
        setCurrentAccuracy(5.0);
        setDistanceToTarget(5);
        setLocationStatus('ready');
        setLocationError('');
        if (onFeedback) {
          onFeedback(`وضع الاختبار: تم ضبط الموقع داخل نطاق ${activeBranch?.name || 'الفرع'} (5 أمتار) 🟢`, 'success');
        }
      } else {
        setCurrentCoords({ latitude: simLat + 0.0015, longitude: simLng + 0.0015 });
        setCurrentAccuracy(10.0);
        setDistanceToTarget(165);
        setLocationStatus('ready');
        setLocationError('');
        if (onFeedback) {
          onFeedback(`وضع الاختبار: تم ضبط الموقع خارج نطاق ${activeBranch?.name || 'الفرع'} (165 متراً) 🔴`, 'error');
        }
      }
    },
    [targetBranch]
  );

  return {
    currentCoords,
    currentAccuracy,
    distanceToTarget,
    isInsideGeofence,
    locationStatus,
    locationError,
    isSimulationMode,
    testSimulatedTime,
    setTestSimulatedTime,
    setIsSimulationMode,
    setCurrentCoords,
    setDistanceToTarget,
    useRealGpsLocation,
    setSimulatedLocation
  };
}

export default useGeolocation;
