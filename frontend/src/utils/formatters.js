// Format Currency in Egyptian Pounds (EGP)
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

// Format date and time
export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format time only (12-hour with Arabic AM/PM)
export function formatTime(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate Haversine distance in meters between two GPS coordinates
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371000; // Earth's radius in meters
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180)) *
    Math.cos(Number(lat2) * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Point type display metadata
export function getPointMeta(type) {
  switch (type?.toLowerCase()) {
    case 'green':
      return { label: 'نقطة خضراء (التزام)', variant: 'success', color: 'emerald' };
    case 'yellow':
      return { label: 'نقطة صفراء (تأخير خفيف)', variant: 'warning', color: 'amber' };
    case 'red':
      return { label: 'نقطة حمراء (تأخير حرج)', variant: 'danger', color: 'rose' };
    case 'black':
      return { label: 'نقطة سوداء (غياب غير مبرر)', variant: 'black', color: 'slate' };
    default:
      return { label: type || 'نقطة', variant: 'neutral', color: 'slate' };
  }
}
