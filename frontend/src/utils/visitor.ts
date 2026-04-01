const VISITOR_ID_KEY = 'kihara_site_visitor_id';

function createVisitorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextId = createVisitorId();
  window.localStorage.setItem(VISITOR_ID_KEY, nextId);
  return nextId;
}
