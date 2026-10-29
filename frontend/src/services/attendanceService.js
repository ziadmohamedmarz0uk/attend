import apiClient from '../lib/axios';

export const attendanceService = {
  // Fetch live points ledger summary, user balances & today's status
  getLedgerSummary: async () => {
    const res = await apiClient.get('/points/ledger-summary');
    return res.data;
  },

  // Perform GPS Check-In with anti-spoofing coordinates
  checkIn: async ({
    latitude,
    longitude,
    branch_id,
    accuracy,
    simulated_time,
    allow_recheckin,
    force_red
  }) => {
    const payload = {
      latitude,
      longitude,
      branch_id,
      accuracy
    };
    if (simulated_time) payload.simulated_time = simulated_time;
    if (allow_recheckin) payload.allow_recheckin = true;
    if (force_red) payload.force_red = true;

    const res = await apiClient.post('/attendance/check-in', payload);
    return res.data;
  },

  // Mark absence manually (Unexcused or Excused)
  markAbsence: async ({ reason, notes } = {}) => {
    const res = await apiClient.post('/attendance/mark-absence', { reason, notes });
    return res.data;
  },

  // Reset today's attendance log (Testing / Simulation)
  resetToday: async () => {
    const res = await apiClient.post('/attendance/reset-today');
    return res.data;
  },

  // Redeem red points with early green credits
  redeemRedPoints: async () => {
    const res = await apiClient.post('/points/redeem-red');
    return res.data;
  },

  // Claim earned monthly commitment bonus (Instant InstaPay Transfer)
  claimBonus: async () => {
    const res = await apiClient.post('/points/claim-bonus');
    return res.data;
  },

  // Fetch monthly attendance breakdown calendar
  getMonthlyHistory: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const res = await apiClient.get('/attendance/monthly-history', { params });
    return res.data;
  },

  // Fetch InstaPay payout transfers history
  getPayoutsHistory: async () => {
    const res = await apiClient.get('/payouts/history');
    return res.data;
  },

  // Fetch employee dispute tickets
  getDisputes: async () => {
    const res = await apiClient.get('/disputes');
    return res.data;
  },

  // Submit a new dispute grievance ticket
  submitDispute: async ({ penalty_type, incident_date, reason }) => {
    const res = await apiClient.post('/disputes', {
      penalty_type,
      incident_date,
      reason
    });
    return res.data;
  },

  // Fetch active company geofencing branches
  getActiveBranches: async () => {
    const res = await apiClient.get('/branches/active');
    return res.data;
  },

  // Fetch primary company HQ location
  getCompanyLocation: async () => {
    const res = await apiClient.get('/owner/location');
    return res.data;
  },

  // Update employee InstaPay handle
  updateInstaPay: async (insta_pay_number) => {
    const res = await apiClient.post('/user/instapay', {
      insta_pay_number
    });
    return res.data;
  }
};

export default attendanceService;
