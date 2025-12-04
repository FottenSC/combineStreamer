# Logging Configuration

This project includes a configurable logging system that can be controlled via
environment variables.

## Default Behavior

By default, logging is **DISABLED** in production builds (including GitHub Pages
deployment). This keeps the browser console clean for end users.

For local development, logs are **ENABLED** via the `.env.local` file.

## How to Enable Console Logs (Development)

Logs are already enabled for local development via `.env.local`:

```env
NEXT_PUBLIC_ENABLE_LOGS=true
```

If you want to disable logs during development, change it to:

```env
NEXT_PUBLIC_ENABLE_LOGS=false
```

Then restart the development server.

## Environment Variables

- `NEXT_PUBLIC_ENABLE_LOGS` - Controls whether console logs are shown
  - `true`: Logs are enabled (development default via `.env.local`)
  - `false` or unset: Logs are disabled (production default)

## Production Deployment

When you run `npm run deploy` to deploy to GitHub Pages:

- Logs are **automatically disabled** (no configuration needed)
- `.env.local` is not deployed (git-ignored)
- The production build has a clean console

## What Gets Logged

When enabled, you'll see logs for:

- Twitch GQL API calls and responses
- YouTube/Invidious API calls
- Stream search operations
- Platform-specific stream counts
- Total streams found
- API warnings

## Note

Error logs (`logger.error()`) are **always shown**, even when logging is
disabled, to ensure critical issues are visible.

## Example `.env.local`

```env
# Enable console logs during development (default)
NEXT_PUBLIC_ENABLE_LOGS=true

# Or disable them:
# NEXT_PUBLIC_ENABLE_LOGS=false
```

After creating or modifying `.env.local`, restart your development server:

```bash
npm run dev
```
