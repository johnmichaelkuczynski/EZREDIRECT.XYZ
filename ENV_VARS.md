# Environment variables

## Required to start the Coolify web container

None. The Google OAuth URL Generator is a browser-only tool and does not call
Google APIs, require sign-in, or persist user data.

## Optional runtime variables

| Variable | Required to start | Expected value | Used by |
| --- | --- | --- | --- |
| `PORT` | No | TCP port number; defaults to `5000` | Production web server and API server |
| `STATIC_DIR` | No | Directory containing the built web files; defaults to the app's `dist/public` directory | Production web server; Docker sets `/app/public` |
| `NODE_ENV` | No | Usually `production` in Coolify | Server logging and Node.js conventions |
| `LOG_LEVEL` | No | Pino log level; defaults to `info` | API server |
| `BASE_PATH` | No | Frontend base path; defaults to `/` | Vite build and preview configuration |

## Database connection

The current OAuth URL Generator and its API health route do not query a
database. The shared Drizzle library accepts either connection variable for
database-backed features:

| Variable | Required to start | Expected value |
| --- | --- | --- |
| `DATABASE_URL` | No for the current app; required before using Drizzle | Neon PostgreSQL connection URI |
| `NEON_DATABASE_URL` | No for the current app; optional override for Drizzle | Neon PostgreSQL connection URI |

Keep these values in Coolify's secret environment settings, not in this file or
the repository. Replit secrets do not automatically transfer to Coolify.

## Not currently used

The app has no login, sessions, OAuth callback handler, Stripe integration, or
other third-party API calls. `PUBLIC_BASE_URL` and `SESSION_SECRET` are therefore
not required or read by the current application.
