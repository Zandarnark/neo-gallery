# Auth/Supabase Production Debug Report

## Main symptoms

- Production site: `https://neo-gallery-eight.vercel.app`
- Failing endpoints:
  - `POST /api/auth/demo-login`
  - `POST /api/auth/login`
  - potentially `POST /api/auth/register`
- Typical user-facing result:
  - `500 Internal Server Error`
  - sometimes empty body
  - sometimes JSON body like `{ "error": "Не удалось выполнить демо-вход" }`

## What was already confirmed

- Supabase project is real and reachable:
  - `https://hnjvmazujuqboznojbux.supabase.co`
- Database is not empty.
- Table `users` exists and contains demo/admin rows.
- `NEXT_PUBLIC_SUPABASE_URL` was previously corrupted and was fixed.
- `JWT_SECRET` was previously empty and was fixed in Vercel UI.
- `SUPABASE_SERVICE_ROLE_KEY` was previously placeholder text and later also appeared empty in Vercel edit form.
- Current code now has a fallback in server DB client:
  - use `SUPABASE_SERVICE_ROLE_KEY`
  - otherwise use `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Most suspicious root cause

Vercel environment variables are inconsistent with what the UI shows.

## Additional confirmed code bug

All three auth route handlers originally called `initializeDatabase()` outside `try/catch`.

That means if env bootstrap throws, the route crashes before entering the handler's error response path, producing empty Vercel `500` responses.

Affected routes:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/demo-login/route.ts`

This has now been identified as a real structural bug and should be treated as one of the primary suspects.

Observed behavior:

1. Vercel UI listed `SUPABASE_SERVICE_ROLE_KEY`.
2. But production logs still showed:
   - `Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY`
3. When opening the variable for edit, its value was empty at least once.
4. Earlier, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` placeholders were not properly replaced and sometimes remained placeholder values.

That means the likely issue is one of these:

- Vercel env value not actually saved even though UI says it exists.
- Vercel redeploy not consuming the latest env value.
- Variable exists only for one environment path but not the runtime actually serving `neo-gallery-eight.vercel.app`.
- Vercel UI edit flow is unreliable and silently preserving empty/old value.

## Current code-level suspicion points

### 1. `initializeDatabase()`

File: `src/lib/db/init.ts`

Why suspicious:

- It fails hard before route handler logic continues.
- Earlier logs proved auth route crashed here with missing env errors.

### 2. `getSupabaseAdmin()`

File: `src/lib/db/client.ts`

Why suspicious:

- This is the single source of Supabase server client creation.
- Any missing/wrong env here breaks every auth repository call.
- Current code includes fallback to anon key because production env looked unreliable.

### 3. Auth route handlers

Files:

- `src/app/api/auth/demo-login/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`

Why suspicious:

- They all call `initializeDatabase()` before entering actual business logic.
- If env is wrong, they fail immediately.
- They collapse many internal failures into generic `500` responses.

### 4. Session creation

File: `src/lib/auth/session.ts`

Why suspicious:

- Depends on `JWT_SECRET`.
- Earlier this variable was definitely empty in Vercel.
- Any failure here breaks login even if database query succeeds.

### 5. Demo account bootstrap logic

Files:

- `src/lib/auth/ensure-users.ts`
- `src/lib/db/repositories/users.ts`

Why suspicious:

- `demo-login` depends on these functions.
- If insert/select policy or client auth is wrong, this path breaks.
- However, local checks showed the DB itself allows reads/inserts with anon key in current project state.

## Important production log evidence

### Earlier state

Logs showed malformed/placeholder Supabase config issues, including:

- corrupted Supabase URL in outgoing request
- missing `JWT_SECRET`
- placeholder `SUPABASE_SERVICE_ROLE_KEY`

### Latest important log

For current production deployment, Vercel logs showed:

`Error: Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY`

This happened even after the variable was visible in Vercel settings.

That is the strongest indicator that the real bug is around Vercel env persistence / rollout.

## Local checks that succeeded

Using local Node script against Supabase project:

- reading `users` with anon key succeeded
- inserting a temp user with anon key succeeded
- deleting that temp user with anon key succeeded

This suggests the database itself is not the primary blocker right now.

## Suggested investigation order for your friend

1. Verify current Vercel runtime env, not just UI values.
2. Check whether `SUPABASE_SERVICE_ROLE_KEY` is truly present in the deployed function environment.
3. Check whether `neo-gallery-eight.vercel.app` points to the newest deployment and correct environment scope.
4. Temporarily add explicit logging around:
   - `initializeDatabase()`
   - `getSupabaseAdmin()`
   - `setSessionCookie()`
5. If Vercel env remains unreliable, consider removing dependency on `SUPABASE_SERVICE_ROLE_KEY` for current auth flow and use anon key temporarily until env issue is fixed.

## Files included in this folder

- `src/app/api/auth/demo-login/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/auth/login/page.tsx`
- `src/lib/db/client.ts`
- `src/lib/db/init.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/ensure-users.ts`
- `src/lib/db/repositories/users.ts`
