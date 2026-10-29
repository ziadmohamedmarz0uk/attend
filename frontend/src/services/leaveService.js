import apiClient from '../lib/axios';

export const leaveService = {
  // Submit a new leave request (Sick, Casual, Annual)
  submitLeave: async ({ leave_type, start_date, end_date, reason }) => {
    const res = await apiClient.post('/leaves/submit', {
      leave_type,
      start_date,
      end_date,
      reason
    });
    return res.data;
  },

  // Fetch list of leave requests (for employee or owner)
  getLeavesList: async (status = null) => {
    const params = {};
    if (status) params.status = status;
    const res = await apiClient.get('/leaves/list', { params });
    return res.data;
  },

  // Owner action: Approve or Reject leave request
  reviewLeave: async ({ leave_id, action, status, review_notes }) => {
    const st = status || action || 'approved';
    const res = await apiClient.post('/leaves/review', {
      leave_id,
      action: st,
      status: st,
      review_notes
    });
    return res.data;
  }
};

export default leaveService;
