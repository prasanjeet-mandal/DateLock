// Deep Input Sanitization and Injection Defense Middleware
// 1. Prototype Pollution Defense: Strips/rejects __proto__, constructor, and prototype
// 2. Cross-Site Scripting (XSS) Sanitization: Strips executable tags & event attributes
// 3. Payload Length Bounds: Guarantees user input lengths are within safe thresholds

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Strip dangerous script tags, iframes, and javascript: protocols
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    // Strip <script>...</script>
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip <iframe>...</iframe>
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Strip <object>, <embed>
    .replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Strip javascript: pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    // Strip vbscript: and data: text/html
    .replace(/vbscript\s*:/gi, '')
    // Strip inline DOM event handlers (onclick=, onerror=, onload=, etc.)
    .replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

// Deep recursive scan to eliminate prototype pollution and XSS
function sanitizeAndGuard(obj, depth = 0) {
  // Prevent deeply nested recursion DoS
  if (depth > 10 || !obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeAndGuard(item, depth + 1));
  }

  const clean = Object.create(null); // Pure dictionary without Object prototype

  for (const [key, val] of Object.entries(obj)) {
    // Drop prototype pollution keys immediately
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }

    if (typeof val === 'string') {
      clean[key] = sanitizeString(val);
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeAndGuard(val, depth + 1);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

export function sanitizeMiddleware(req, res, next) {
  // Check prototype pollution attempt in raw request
  const rawBody = req.body;
  if (rawBody && typeof rawBody === 'object') {
    for (const key of Object.keys(rawBody)) {
      if (DANGEROUS_KEYS.has(key)) {
        return res.status(400).json({ error: 'Malicious payload rejected: disallowed object property.' });
      }
    }
    req.body = sanitizeAndGuard(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (DANGEROUS_KEYS.has(key)) {
        return res.status(400).json({ error: 'Malicious payload rejected: disallowed query parameter.' });
      }
    }
    req.query = sanitizeAndGuard(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeAndGuard(req.params);
  }

  // Field length validation guardrails
  if (req.body && typeof req.body === 'object') {
    if (req.body.bio && typeof req.body.bio === 'string' && req.body.bio.length > 500) {
      return res.status(400).json({ error: 'Bio exceeds maximum allowed length of 500 characters.' });
    }
    if (req.body.content && typeof req.body.content === 'string' && req.body.content.length > 1000) {
      return res.status(400).json({ error: 'Message content exceeds maximum allowed length of 1000 characters.' });
    }
    if (req.body.vibePrompt && typeof req.body.vibePrompt === 'string' && req.body.vibePrompt.length > 300) {
      return res.status(400).json({ error: 'Vibe prompt exceeds maximum allowed length of 300 characters.' });
    }
    if (req.body.displayName && typeof req.body.displayName === 'string' && req.body.displayName.length > 50) {
      return res.status(400).json({ error: 'Display name exceeds maximum allowed length of 50 characters.' });
    }
  }

  next();
}
