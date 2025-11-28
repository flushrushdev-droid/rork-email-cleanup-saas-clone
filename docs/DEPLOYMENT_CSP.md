# Content Security Policy (CSP) Deployment Guide

This guide explains how to configure Content Security Policy (CSP) headers, including the `frame-ancestors` directive, for different hosting providers.

## Overview

The CSP is configured in two ways:
1. **Meta tag** (client-side) - Applied via `app/_layout.tsx` for basic CSP directives
2. **HTTP headers** (server-side) - Applied via hosting provider configuration for full CSP including `frame-ancestors`

The `frame-ancestors` directive can only be set via HTTP headers, not meta tags. This is why we need provider-specific configuration files.

## Hosting Provider Configurations

### Vercel

**File:** `vercel.json` (already configured)

The `vercel.json` file includes CSP headers that will be applied to all routes. The configuration includes:
- Full CSP with `frame-ancestors 'none'`
- Additional security headers (X-Content-Type-Options, X-Frame-Options, etc.)

**Customization:**
If you need to customize the CSP for your production domain, edit the `connect-src` directive in `vercel.json`:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; ... connect-src 'self' https://your-api-domain.com https://*.googleapis.com ..."
}
```

**Deployment:**
Vercel automatically reads `vercel.json` on deployment. No additional steps needed.

---

### Netlify

**File:** `netlify.toml` (already configured)

The `netlify.toml` file includes CSP headers in the `[[headers]]` section.

**Customization:**
Edit the `Content-Security-Policy` value in `netlify.toml` to add your production domains:

```toml
Content-Security-Policy = "default-src 'self'; ... connect-src 'self' https://your-api-domain.com https://*.googleapis.com ..."
```

**Deployment:**
Netlify automatically reads `netlify.toml` on deployment. No additional steps needed.

---

### Render

**File:** `public/_headers` (already configured)

Render supports static header files. The `_headers` file should be in your build output directory.

**Setup:**
1. Ensure `public/_headers` is copied to your build output during the build process
2. If using Expo, you may need to configure the build to copy this file to `.expo/web/_headers`

**Alternative (Render Dashboard):**
You can also configure headers in the Render dashboard:
1. Go to your service settings
2. Navigate to "Headers" section
3. Add the CSP header manually

---

### Cloudflare Pages

**File:** `public/_headers` (already configured)

Cloudflare Pages automatically reads `_headers` files from your build output.

**Setup:**
1. Ensure `public/_headers` is in your build output directory
2. Cloudflare will automatically apply these headers

---

### Other Static Hosting Providers

For other providers (GitHub Pages, AWS S3 + CloudFront, etc.):

1. **Check if they support `_headers` files** - Many static hosts support this
2. **Use provider-specific configuration** - Check your provider's documentation for header configuration
3. **Use a middleware/serverless function** - If your provider supports serverless functions, you can set headers programmatically

---

## Customizing CSP for Your Environment

### Adding Production Domains

When deploying to production, you'll need to update the `connect-src` directive to include your production API domain.

**Example for Vercel:**
```json
"connect-src 'self' https://your-app.vercel.app https://*.googleapis.com https://*.google.com"
```

**Example for Netlify:**
```toml
Content-Security-Policy = "... connect-src 'self' https://your-app.netlify.app https://*.googleapis.com ..."
```

### Development vs Production

The CSP utility (`utils/csp.ts`) automatically adjusts based on `AppConfig.env`:
- **Development**: Allows localhost, 127.0.0.1, and Rork domains
- **Production**: Only allows configured production domains

However, the static header files (`vercel.json`, `netlify.toml`, `_headers`) use fixed values. You may want to:

1. **Use environment variables** (if your provider supports it)
2. **Generate these files during build** using a build script
3. **Manually update** for each deployment environment

---

## Testing CSP Headers

### Verify Headers Are Applied

1. **Browser DevTools:**
   - Open Network tab
   - Reload the page
   - Click on the main document request
   - Check "Response Headers" for `Content-Security-Policy`

2. **Command Line:**
   ```bash
   curl -I https://your-domain.com
   ```

3. **Online Tools:**
   - [SecurityHeaders.com](https://securityheaders.com/)
   - [Mozilla Observatory](https://observatory.mozilla.org/)

### Test frame-ancestors

The `frame-ancestors 'none'` directive prevents your site from being embedded in iframes. Test by trying to embed your site:

```html
<!-- This should be blocked -->
<iframe src="https://your-domain.com"></iframe>
```

---

## Security Headers Included

In addition to CSP, the configuration files include:

- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking (redundant with frame-ancestors, but good for older browsers)
- **X-XSS-Protection: 1; mode=block** - Enables XSS filtering in older browsers
- **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information

---

## Troubleshooting

### CSP Violations in Console

If you see CSP violations in the browser console:

1. **Check which directive is blocking** - The console will show the violated directive
2. **Add necessary domains** - Update the appropriate directive in your config file
3. **Test in development first** - Use browser DevTools to test before deploying

### frame-ancestors Not Working

1. **Verify header is set** - Check that the HTTP header is actually being sent
2. **Check for typos** - Ensure `frame-ancestors` is spelled correctly
3. **Clear browser cache** - Old cached responses might not have the header

### Headers Not Applied

1. **Check file location** - Ensure config files are in the correct location
2. **Verify provider support** - Check your provider's documentation
3. **Check build output** - Ensure headers file is included in the build

---

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Vercel: Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)
- [Netlify: Headers Documentation](https://docs.netlify.com/routing/headers/)

