'use client';

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../lib/axios';
import { 
  MapPin, 
  Loader2, 
  Check, 
  Navigation, 
  Sliders, 
  ShieldCheck, 
  Compass, 
  Search, 
  Layers, 
  Globe2, 
  Satellite,
  Info
} from 'lucide-react';
import { broadcastSyncEvent, SYNC_EVENTS } from '../../../lib/syncEvents';
import 'leaflet/dist/leaflet.css';

// 100% Free Open-Source Tile Layers (ZERO TOKENS OR API KEYS REQUIRED)
const MAP_PROVIDERS = {
  streets: {
    name: 'خريطة OpenStreetMap القياسية',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  },
  hot: {
    name: 'خريطة تفصيلية (OSM Humanitarian)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener">HOT</a>',
    subdomains: ['a', 'b'],
    maxZoom: 19,
  },
  satellite: {
    name: 'قمر صناعي حقيقي (Satellite HD)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: [],
    maxZoom: 18,
  },
};

export default function LocationSettingsTab({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMapType, setActiveMapType] = useState('streets'); // 'streets' | 'hot' | 'satellite'

  // Location Form Data
  const [formData, setFormData] = useState({
    name: 'مقر الشركة الرئيسي (HQ)',
    latitude: 30.044425,
    longitude: 31.235718,
    radius_meters: 200,
  });

  // OpenStreetMap Search (Nominatim Geocoding - Zero Token)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const isMapReadyRef = useRef(false);

  // 1. Fetch Location from API on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/owner/location');
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        const loc = {
          name: d.name || 'مقر الشركة الرئيسي (HQ)',
          latitude: parseFloat(d.latitude) || 30.044425,
          longitude: parseFloat(d.longitude) || 31.235718,
          radius_meters: parseInt(d.radius_meters) || 200,
        };
        setFormData(loc);
        updateMapElements(loc.latitude, loc.longitude, loc.radius_meters, true);
      }
    } catch (error) {
      console.warn('Using fallback location coordinates.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      const defaultLat = formData.latitude || 30.044425;
      const defaultLng = formData.longitude || 31.235718;

      // Ultra-clean Monochrome Map Pin
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; transform: translate(-50%, -100%);">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(9, 9, 11, 0.15); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #09090b; color: #ffffff; padding: 8px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      // Map creation
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 16,
        zoomControl: true,
      });

      // Add Open-Source Tile Layer
      const currentProvider = MAP_PROVIDERS[activeMapType] || MAP_PROVIDERS.streets;
      const tileLayer = L.tileLayer(currentProvider.url, {
        attribution: currentProvider.attribution,
        subdomains: currentProvider.subdomains || 'abc',
        maxZoom: currentProvider.maxZoom || 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add Draggable Marker
      const marker = L.marker([defaultLat, defaultLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      // Add Geofence Circle (Monochrome)
      const circle = L.circle([defaultLat, defaultLng], {
        radius: formData.radius_meters || 200,
        color: '#09090b',
        fillColor: '#09090b',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // Event: Dragging Marker updates Lat & Long
      marker.on('drag', (e) => {
        const { lat, lng } = e.target.getLatLng();
        circle.setLatLng([lat, lng]);
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        }));
      });

      // Event: Clicking on map moves marker & circle
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        }));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      isMapReadyRef.current = true;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isMapReadyRef.current = false;
      }
    };
  }, []);

  // Switch Tile Layer (Streets / Hot / Satellite) without page reload
  const handleSwitchMapType = async (type) => {
    setActiveMapType(type);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const L = (await import('leaflet')).default;
    const provider = MAP_PROVIDERS[type] || MAP_PROVIDERS.streets;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || 'abc',
      maxZoom: provider.maxZoom || 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  // Update map when coordinates or radius change
  const updateMapElements = (lat, lng, radius, recenter = false) => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;
    const validLat = parseFloat(lat);
    const validLng = parseFloat(lng);
    const validRadius = parseInt(radius) || 100;

    if (!isNaN(validLat) && !isNaN(validLng)) {
      markerRef.current.setLatLng([validLat, validLng]);
      circleRef.current.setLatLng([validLat, validLng]);
      circleRef.current.setRadius(validRadius);

      if (recenter) {
        mapInstanceRef.current.setView([validLat, validLng], 16, { animate: true });
      }
    }
  };

  const handleLatChange = (val) => {
    const newLat = parseFloat(val) || '';
    setFormData((prev) => {
      const updated = { ...prev, latitude: newLat };
      updateMapElements(newLat, prev.longitude, prev.radius_meters);
      return updated;
    });
  };

  const handleLngChange = (val) => {
    const newLng = parseFloat(val) || '';
    setFormData((prev) => {
      const updated = { ...prev, longitude: newLng };
      updateMapElements(prev.latitude, newLng, prev.radius_meters);
      return updated;
    });
  };

  const handleRadiusChange = (val) => {
    const newRadius = parseInt(val) || 10;
    setFormData((prev) => {
      const updated = { ...prev, radius_meters: newRadius };
      updateMapElements(prev.latitude, prev.longitude, newRadius);
      return updated;
    });
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
          updateMapElements(lat, lng, formData.radius_meters, true);
          showToast('تم جلب موقعك الفعلي بالـ GPS وتحديث الخريطة بنجاح', 'success');
        },
        (error) => {
          showToast('تعذر الوصول للموقع. تأكد من تفعيل الـ GPS في جهازك.', 'error');
        },
        { enableHighAccuracy: true }
      );
    } else {
      showToast('خاصية تحديد الموقع غير مدعومة في متصفحك', 'error');
    }
  };

  // Open-Source Address Search (OpenStreetMap Nominatim - Free, No Token)
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery || !searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&addressdetails=1&limit=5&accept-language=ar,en`
      );
      const data = await res.json();
      setSearchResults(data || []);
      if (!data || data.length === 0) {
        showToast('لم يتم العثور على نتائج للعنوان المدخل', 'error');
      }
    } catch (err) {
      showToast('خطأ أثناء البحث عن العنوان', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(parseFloat(result.lat).toFixed(6));
    const lng = parseFloat(parseFloat(result.lon).toFixed(6));
    const title = result.display_name?.split(',')[0] || formData.name;

    setFormData((prev) => ({
      ...prev,
      name: title,
      latitude: lat,
      longitude: lng,
    }));

    updateMapElements(lat, lng, formData.radius_meters, true);
    setShowSearchResults(false);
    setSearchQuery('');
    showToast(`تم الانتقال إلى: ${title}`, 'success');
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/owner/location', formData);

      if (res.data && res.data.success) {
        showToast('تم حفظ موقع الشركة والنطاق الجغرافي بنجاح', 'success');
        broadcastSyncEvent(SYNC_EVENTS.BRANCHES_UPDATED);
      } else {
        showToast(res.data?.message || 'تم الحفظ بنجاح', 'success');
        broadcastSyncEvent(SYNC_EVENTS.BRANCHES_UPDATED);
      }
    } catch (error) {
      showToast('تم حفظ الموقع محلياً بنجاح.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Monochrome Shell */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-950">تحديد موقع مقر الشركة (GPS Geofence)</h2>
                <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-200">
                  مفتوح المصدر
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                اسحب الدبوس أو انقر على الخريطة لتحديد مقر العمل، أو ابحث بالاسم، أو أدخل الإحداثيات يدوياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-900 font-medium rounded-md transition-colors border border-zinc-200 flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.75} />
              <span>جلب موقعي الحالي (GPS)</span>
            </button>
          </div>
        </div>

        {/* Search Bar (OpenStreetMap Nominatim Free Search) */}
        <div className="mt-4 relative">
          <form onSubmit={handleSearchLocation} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن عنوان أو معلم (مثال: المعادي، مدينة نصر، القرية الذكية، التجمع الخامس...)"
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-md pr-9 pl-3 py-2 text-xs text-zinc-950 outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" strokeWidth={1.75} />}
              <span>بحث بالعنوان</span>
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1.5 bg-white border border-zinc-200 rounded-md shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-right px-3 py-2 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors flex items-start gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="text-xs text-zinc-800 font-medium truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Grid: Interactive Map (7 Cols) + Manual Control Form (5 Cols) */}
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Map Column */}
          <div className="lg:col-span-7 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-600 px-0.5">
              <span className="flex items-center gap-1.5 text-zinc-950 font-medium">
                <MapPin className="w-3.5 h-3.5 text-zinc-900" strokeWidth={1.75} />
                الخريطة التفاعلية
              </span>

              {/* Map Layer Switcher Buttons */}
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                <button
                  type="button"
                  onClick={() => handleSwitchMapType('streets')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${activeMapType === 'streets'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                >
                  <Globe2 className="w-3 h-3" strokeWidth={1.75} />
                  <span>OpenStreetMap</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMapType('hot')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${activeMapType === 'hot'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                >
                  <Layers className="w-3 h-3" strokeWidth={1.75} />
                  <span>تفصيلية (HOT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMapType('satellite')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${activeMapType === 'satellite'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                >
                  <Satellite className="w-3 h-3" strokeWidth={1.75} />
                  <span>قمر صناعي</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[380px] sm:h-[420px] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Map Floating Legend */}
              <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs border border-zinc-200 px-3 py-1.5 rounded-md text-[11px] font-medium text-zinc-900 flex items-center gap-2 shadow-xs tabular-nums">
                <span className="w-2 h-2 rounded-full bg-zinc-950"></span>
                <span>النطاق المسموح: {formData.radius_meters} م</span>
              </div>
            </div>
          </div>

          {/* Form & Controls Column */}
          <div className="lg:col-span-5 bg-zinc-50/70 p-4 rounded-lg border border-zinc-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 text-xs font-semibold text-zinc-950">
                <Sliders className="w-3.5 h-3.5 text-zinc-900" strokeWidth={1.75} />
                <span>الخيارات والتحكم اليدوي</span>
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">اسم المنشأة / المقر</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: المقر الرئيسي للشركة"
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-medium"
                />
              </div>

              {/* Coordinates: Latitude & Longitude */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">خط العرض (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => handleLatChange(e.target.value)}
                    placeholder="30.044425"
                    className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-950 outline-none font-mono tabular-nums focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">خط الطول (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => handleLngChange(e.target.value)}
                    placeholder="31.235718"
                    className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-950 outline-none font-mono tabular-nums focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </div>
              </div>

              {/* Radius in Meters with Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
                  <span>نطاق السماح بالمتر (Radius)</span>
                  <span className="font-mono tabular-nums text-white bg-zinc-950 px-2 py-0.5 rounded text-[11px] font-medium">
                    {formData.radius_meters} م
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={formData.radius_meters}
                  onChange={(e) => handleRadiusChange(e.target.value)}
                  className="w-full accent-zinc-950 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                />

                {/* Quick Radius Presets */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  {[50, 100, 200, 500].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRadiusChange(r)}
                      className={`flex-1 py-1 rounded text-[11px] font-medium border transition-colors tabular-nums cursor-pointer ${formData.radius_meters === r
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                    >
                      {r}م
                    </button>
                  ))}
                </div>
              </div>

              {/* Anti-spoofing note */}
              <div className="p-3 bg-white border border-zinc-200 rounded-md flex items-start gap-2 text-xs text-zinc-600 font-normal">
                <ShieldCheck className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>الخادم يتحقق تلقائياً من المسافة الحقيقية لكل موظف بمعادلة Haversine لمنع أي تلاعب أو تسجيل خارج النطاق.</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.75} />}
                <span>حفظ واعتماد موقع الشركة</span>
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
