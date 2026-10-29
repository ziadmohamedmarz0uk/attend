/**
 * File: frontend/src/lib/syncEvents.js
 * High-Performance Enterprise Real-Time Synchronization Hub
 * Enables instant, zero-delay communication between Owner Dashboard and Employee Portal
 * across browser tabs, windows, and devices.
 */

export const SYNC_EVENTS = {
  // Admin -> Employee Events
  DISPUTE_UPDATED: 'DISPUTE_UPDATED',
  LEAVE_UPDATED: 'LEAVE_UPDATED',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE',
  BONUS_GRANTED: 'BONUS_GRANTED',
  DEDUCTION_APPLIED: 'DEDUCTION_APPLIED',
  BONUS_SETTING_UPDATED: 'BONUS_SETTING_UPDATED',
  FINANCIAL_POLICIES_UPDATED: 'FINANCIAL_POLICIES_UPDATED',
  BRANCHES_UPDATED: 'BRANCHES_UPDATED',

  // Employee -> Admin Events
  CHECKIN_RECORDED: 'CHECKIN_RECORDED',
  DISPUTE_SUBMITTED: 'DISPUTE_SUBMITTED',
  LEAVE_SUBMITTED: 'LEAVE_SUBMITTED',
  POINTS_CHANGED: 'POINTS_CHANGED',
};

const CHANNEL_NAME = 'attend_enterprise_sync';

let channelInstance = null;

function getChannel() {
  if (typeof window === 'undefined') return null;
  if (!channelInstance && typeof window.BroadcastChannel !== 'undefined') {
    try {
      channelInstance = new window.BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported or restricted, falling back to storage events');
    }
  }
  return channelInstance;
}

/**
 * Broadcast an event across all tabs/windows in real-time
 * @param {string} type - Event type from SYNC_EVENTS
 * @param {object} payload - Optional event metadata
 */
export function broadcastSyncEvent(type, payload = {}) {
  if (typeof window === 'undefined') return;

  const eventData = {
    type,
    payload,
    timestamp: Date.now(),
    senderId: Math.random().toString(36).substring(7),
  };

  // 1. Native BroadcastChannel (Zero-delay cross-tab)
  const channel = getChannel();
  if (channel) {
    try {
      channel.postMessage(eventData);
    } catch (e) {
      console.warn('Failed to post message to BroadcastChannel', e);
    }
  }

  // 2. LocalStorage event fallback (fires 'storage' event across other tabs)
  try {
    localStorage.setItem('attend_last_sync_event', JSON.stringify(eventData));
  } catch (e) {
    // Ignore storage quota or disabled storage
  }

  // 3. Same-tab CustomEvent trigger
  try {
    window.dispatchEvent(new CustomEvent('attend_local_sync', { detail: eventData }));
  } catch (e) { }
}

/**
 * Subscribe to real-time sync events from any dashboard or tab
 * @param {Function} callback - Function receiving (eventData)
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeSyncEvents(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  const channel = getChannel();

  // Channel handler
  const handleChannelMessage = (event) => {
    if (event && event.data && event.data.type) {
      callback(event.data);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  // Storage fallback handler
  const handleStorage = (e) => {
    if (e.key === 'attend_last_sync_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.type) {
          callback(parsed);
        }
      } catch (err) { }
    }
  };
  window.addEventListener('storage', handleStorage);

  // Local window event handler
  const handleLocal = (e) => {
    if (e && e.detail && e.detail.type) {
      callback(e.detail);
    }
  };
  window.addEventListener('attend_local_sync', handleLocal);

  // Return unsubscribe
  return () => {
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('attend_local_sync', handleLocal);
  };
}
