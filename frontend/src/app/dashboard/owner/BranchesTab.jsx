'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../../../lib/axios';
import { MapPin, Loader2, Check, Navigation, Trash2 } from 'lucide-react';
import { broadcastSyncEvent, SYNC_EVENTS } from '../../../lib/syncEvents';

export default function BranchesTab({ showToast }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', latitude: '', longitude: '', radius_meters: 100 });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/owner/branches');
      if (res.data && res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error) {
      showToast('تعذر جلب الفروع. تأكد من اتصال الخادم وصلاحيات الدخول.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          showToast('تم جلب الموقع الحالي بنجاح', 'success');
        },
        (error) => {
          showToast('تعذر الحصول على الموقع. يرجى تفعيل الـ GPS', 'error');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/owner/branches', formData);
      if (res.data && res.data.success) {
        showToast('تم حفظ النطاق الجغرافي بنجاح!', 'success');
        broadcastSyncEvent(SYNC_EVENTS.BRANCHES_UPDATED);
        setFormData({ name: '', latitude: '', longitude: '', radius_meters: 100 });
        fetchBranches();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;
    try {
      const res = await apiClient.delete(`/owner/branches/${id}`);
      if (res.data && res.data.success) {
        showToast(res.data.message || 'تم الحذف بنجاح', 'success');
        broadcastSyncEvent(SYNC_EVENTS.BRANCHES_UPDATED);
        fetchBranches();
      } else {
        showToast(res.data?.message || 'تعذر الحذف', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر الحذف', 'error');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-zinc-100">
          <div className="p-1.5 bg-zinc-100 rounded-md border border-zinc-200 text-zinc-700">
            <MapPin className="w-4 h-4 text-zinc-600" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">إضافة نطاق جغرافي (Geofence Zone)</h3>
            <p className="text-xs text-zinc-500 font-normal">حدد إحداثيات المكان للسماح للموظفين بتسجيل الحضور ضمنه</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 bg-zinc-50/70 p-4 rounded-md border border-zinc-200/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-medium text-zinc-700">اسم المكان / الفرع</label>
              <input
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: المقر الرئيسي - الدقي"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">خط العرض (Latitude)</label>
              <input
                type="number" step="any" required
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                placeholder="مثال: 30.044420"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 outline-none font-mono tabular-nums focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">خط الطول (Longitude)</label>
              <input
                type="number" step="any" required
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                placeholder="مثال: 31.235712"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 outline-none font-mono tabular-nums focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">النطاق الجغرافي بالأمتار (Radius)</label>
              <div className="relative">
                <input
                  type="number" min="10" required
                  value={formData.radius_meters}
                  onChange={(e) => setFormData({...formData, radius_meters: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 pl-10 shadow-2xs tabular-nums"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-normal text-zinc-400">متر</span>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                type="button" 
                onClick={handleGetCurrentLocation} 
                className="w-full h-[34px] bg-white hover:bg-zinc-50 text-zinc-800 font-medium rounded-md transition-colors border border-zinc-200 flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.75} />
                <span>جلب موقعي بالـ GPS</span>
              </button>
            </div>
          </div>

          <div className="pt-2.5 border-t border-zinc-200/80">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-2 rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Check className="w-3.5 h-3.5" strokeWidth={2} />}
              <span>حفظ واعتماد النطاق الجغرافي</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Branches List */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-500" strokeWidth={1.75} /> 
          <span>الفروع والنطاقات المسجلة حالياً</span>
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-950" strokeWidth={2} />
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-normal bg-zinc-50/50 rounded-md border border-zinc-200 border-dashed">
            لا توجد فروع مسجلة. أضف نطاقاً من الأعلى للبدء.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {branches.map(branch => (
              <div key={branch.id} className="bg-zinc-50/70 border border-zinc-200/80 rounded-md p-3.5 flex justify-between items-center group hover:border-zinc-300 hover:bg-white transition-colors">
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-zinc-950 truncate">{branch.name}</h4>
                  <div className="text-[11px] text-zinc-500 font-mono mt-1 flex gap-3 tabular-nums">
                    <span>Lat: {branch.latitude}</span>
                    <span>Lng: {branch.longitude}</span>
                  </div>
                  <span className="inline-block mt-1.5 bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded text-[10px] font-medium tabular-nums">
                    نطاق مسموح: {branch.radius_meters} م
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(branch.id)} 
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-md transition-colors border border-zinc-200 cursor-pointer shadow-2xs"
                  title="حذف الفرع"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
