export async function onRequest({ request, url }, next) {
  // Get the response
  const response = await next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  // Note: 'unsafe-inline' is required for GTM inline scripts and Astro's inline <script> tags.
  // 'unsafe-eval' has been removed to strengthen XSS protections. If GTM custom HTML tags break,
  // consider migrating to nonce-based CSP or re-adding 'unsafe-eval' with documentation.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://chat.tangleapps.vip https://app.cal.com https://googleads.g.doubleclick.net https://*.googleadservices.com https://*.googlesyndication.com https://www.redditstatic.com https://alb.reddit.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://calendly.com https://chat.tangleapps.vip https://app.cal.com https://www.googletagmanager.com https://*.reddit.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://*.reddit.com"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Cache control for static assets
  if (url.pathname.match(/\.(js|css|woff2?|ttf|otf|ico|png|jpg|jpeg|gif|svg|webp)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}