import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * @param dirty - The dirty HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  });
};

/**
 * Sanitizes a URL to prevent XSS attacks.
 * @param url - The URL to sanitize.
 * @returns The sanitized URL.
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url, { ALLOWED_URI_REGEXP: /^https?%3A%2F%2F/i });
  if (sanitized === 'about:blank') {
    return '';
  }
  return sanitized;
};
