import apiClient from '../lib/axios';

export const ownerService = {
  // Fetch executive dashboard metrics, employees list, recent logs, pending leaves & stats
  getDashboardStats: async () => {
    const res = await apiClient.get('/owner/dashboard-stats');
    return res.data;
  },

  // Fetch financial policies: monthly bonus, late deduction, and absence deduction
  getBonusSettings: async () => {
    const res = await apiClient.get('/owner/bonus-settings');
    return res.data;
  },

  // Update financial policies: monthly bonus, late deduction, and absence deduction amounts
  updateBonusSettings: async (settings) => {
    const payload = typeof settings === 'object' && settings !== null
      ? settings
      : { monthly_bonus_amount: settings };
    const res = await apiClient.post('/owner/bonus-settings', payload);
    return res.data;
  },

  // Grant an executive one-time discretionary financial bonus
  grantBonus: async ({ user_id, amount, reason }) => {
    const res = await apiClient.post('/owner/grant-bonus', {
      user_id,
      amount,
      reason
    });
    return res.data;
  },

  // Apply an executive manual financial deduction / penalty
  applyDeduction: async ({ user_id, amount, reason }) => {
    const res = await apiClient.post('/owner/apply-deduction', {
      user_id,
      amount,
      reason
    });
    return res.data;
  },

  // Perform manual points / financial adjustment override
  manualOverride: async (data) => {
    const res = await apiClient.post('/owner/manual-override', data);
    return res.data;
  },

  // Review employee dispute ticket (Approve / Reject)
  reviewDispute: async ({ ticket_id, dispute_id, action, status, admin_response }) => {
    const id = dispute_id || ticket_id;
    const st = status || action;
    const res = await apiClient.post('/disputes/review', {
      dispute_id: id,
      ticket_id: id,
      status: st,
      action: st,
      admin_response
    });
    return res.data;
  },

  // Update primary HQ location & geofence radius
  updateLocation: async ({ latitude, longitude, radius_meters }) => {
    const res = await apiClient.post('/owner/location', {
      latitude,
      longitude,
      radius_meters
    });
    return res.data;
  },

  // Create a new branch location
  createBranch: async ({ name, latitude, longitude, radius_meters }) => {
    const res = await apiClient.post('/owner/branches', {
      name,
      latitude,
      longitude,
      radius_meters
    });
    return res.data;
  },

  // Delete a branch location
  deleteBranch: async (id) => {
    const res = await apiClient.delete(`/owner/branches/${id}`);
    return res.data;
  },

  // Fetch executive audit logs
  getAuditLogs: async () => {
    const res = await apiClient.get('/owner/audit-logs');
    return res.data;
  },

  // Export Excel audit report
  exportExcel: async (period = 'current_month', department = 'all') => {
    const res = await apiClient.get(`/reports/export-excel?period=${period}&department=${department}`);
    return res.data;
  },

  // Export PDF executive statement
  exportPdf: async (period = 'current_month', department = 'all') => {
    const res = await apiClient.get(`/reports/export-pdf?period=${period}&department=${department}`);
    return res.data;
  }
};

export default ownerService;
