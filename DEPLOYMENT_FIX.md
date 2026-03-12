# Deployment Fix - Edge Function Environment Variables

## Issue

The deployment was failing during the Edge Functions bundling phase with the error:
```
Error: supabaseUrl is required.
```

This occurred because the edge function was trying to access environment variables at **build/bundle time** instead of at **runtime**.

## Root Cause

In the original code:
```typescript
const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')!;
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);
```

This code runs immediately when the module loads (during bundling), but environment variables are only available at runtime in Netlify Edge Functions.

## Solution

Changed to lazy initialization pattern:
```typescript
let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}
```

Now the Supabase client is only created when actually needed (on the first request), not during bundling.

## Files Changed

- `netlify/edge-functions/prerender.ts` - Fixed to use lazy initialization
- `prerender.js` - Added automatic copying of learn platform files

## Additional Improvements

- Added automatic copying of `/learn` platform files during build
- Learn files are now included in every deployment automatically

## Testing

Local build test passes:
```bash
npm run build
# ✓ Build completes successfully
# ✓ Sitemap generated with 27 routes
# ✓ Learn files copied to dist/
```

## Next Steps

The deployment should now succeed. The edge function will:
1. Bundle successfully (no environment variable access during bundling)
2. Initialize Supabase client on first request (when env vars are available)
3. Serve pre-rendered content to search engine crawlers
4. Serve normal SPA to regular users
