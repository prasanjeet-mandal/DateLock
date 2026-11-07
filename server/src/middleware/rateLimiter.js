// In-memory sliding window rate limiter suite
// Prevents brute-force credential attacks, bot swiping, and message flooding

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later.',
  keyGenerator = (req) => req.ip || req.connection?.remoteAddress || '127.0.0.1',
  skip = () => false
}) {
  const requests = new Map(); // key -> array of timestamps

  return (req, res, next) => {
    // Custom skip callback
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = requests.get(key) || [];
    // Filter timestamps within current sliding window
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= max) {
      const retryAfterSeconds = Math.ceil((timestamps[0] + windowMs - now) / 1000) || Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds
      });
    }

    timestamps.push(now);
    requests.set(key, timestamps);

    // Periodic memory cleanup when map grows
    if (requests.size > 2000) {
      for (const [k, tList] of requests.entries()) {
        const valid = tList.filter(t => t > windowStart);
        if (valid.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, valid);
        }
      }
    }

    next();
  };
}

// 1. General API Limiter (200 req / minute per IP)
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message: 'Too many API requests from this client. Please slow down.',
  skip: (req) => req.path.startsWith('/api/auth/switch-demo') || req.path === '/api/health'
});

// 2. Strict Authentication Limiter (15 login/register attempts per 15 minutes per IP)
// Stops credential stuffing and automated password guessing
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  skip: (req) => req.path.includes('/switch-demo') || req.path.includes('/me')
});

// 3. Swipe / Like Limiter (60 swipes per minute per user/IP)
// Prevents bot automation, scraping, and like flood spam
export const swipeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'You are swiping too fast. Take a breath and review profiles mindfully!',
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous_swiper'
});

// 4. Message Rate Limiter (60 messages per minute per user)
// Stops automated chat spam
export const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Message limit reached. Please wait a moment before sending more messages.',
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous_messenger'
});
