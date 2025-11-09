const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100;

const requestCounts = new Map<string, { count: number; windowStart: number }>();

export const getClientIdentifier = (req: Request): string => {
  return req.headers.get('x-forwarded-for') || '';
};

export const checkRateLimit = (clientIdentifier: string): boolean => {
  const now = Date.now();
  const clientData = requestCounts.get(clientIdentifier);

  if (!clientData || now - clientData.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(clientIdentifier, { count: 1, windowStart: now });
    return false;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientData.count++;
  return false;
};