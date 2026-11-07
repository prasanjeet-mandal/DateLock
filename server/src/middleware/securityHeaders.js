// Security Headers Middleware
// Enforces defense-in-depth HTTP headers for protection against Clickjacking,
// XSS, MIME-sniffing, and cross-origin leakage.

export function securityHeadersMiddleware(req, res, next) {
  // Prevent clickjacking by forbidding embedding in iframes
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Legacy XSS filter activation
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information sent in HTTP requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features and APIs (camera, microphone, payment, usb)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  // Cross-Origin Isolation & Resource Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

  // HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (CSP)
  // Accommodates React app, WebGL / Three.js 3D canvas, Socket.IO websockets, Google Fonts, and image CDN
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' ws: wss: http: https:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  next();
}
