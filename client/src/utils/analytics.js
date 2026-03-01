// Fire-and-forget analytics — never blocks the UI
// Session UUID is stored in sessionStorage (no PII)

const getSessionId = () => {
  let id = localStorage.getItem('beisser_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('beisser_session', id);
  }
  return id;
};

const getDeviceType = () => {
  const w = window.innerWidth;
  if (w < 768)  return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

export const fireEvent = (eventType, extra = {}) => {
  const payload = {
    event_type:  eventType,
    session_id:  getSessionId(),
    device_type: getDeviceType(),
    ...extra,
  };

  fetch('/api/analytics/event', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(() => {}); // intentional swallow — fire-and-forget
};
