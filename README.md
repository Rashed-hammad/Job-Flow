# JobFlow — Smart Job Application Tracker

JobFlow helps job seekers track applications from Applied → Interview → Offer →
Rejected on a Kanban board, uses the Claude API to score how well a CV matches
a job description, surfaces pipeline stats on a dashboard, and emails a daily
digest reminder for applications that have gone stale.

## Features

- **Auth** — JWT-based register/login, per-user data scoping everywhere, and
  an email-based forgot-password/reset flow.
- **Kanban board** — drag-and-drop job applications across Applied / Interview
  / Offer / Rejected.
- **CV upload** — store PDF CVs per user (in MongoDB GridFS, so it survives
  redeploys on hosts with an ephemeral filesystem), download or delete them
  later.
- **AI match scoring** — score a stored CV against a job's description using
  the Claude API, returning a 0–100 score with strengths, gaps, and an
  explanation.
- **Dashboard** — total applications, interview/offer rate, a status
  breakdown chart, and a 6-month application trend.
- **Email reminders** — a daily digest email nudging you about applications
  still sitting in "Applied" status past a configurable follow-up window,
  with a per-account toggle to opt out.

## Project structure

```
job-tracker/
├── render.yaml                       # Render Blueprint for the API deploy
├── server/                          # Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB Atlas connection
│   │   │   ├── mailer.js            # Nodemailer transporter (no-ops if unconfigured)
│   │   │   ├── gridfs.js            # GridFS bucket helper (CV file storage)
│   │   │   └── upload.js            # Multer config (memory storage) for CV uploads
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── jobController.js
│   │   │   ├── cvController.js
│   │   │   └── matchController.js
│   │   ├── jobs/
│   │   │   ├── reminderJob.js       # Stale-application sweep + digest email
│   │   │   └── scheduler.js         # Daily node-cron wiring
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification (protect)
│   │   │   └── validateRequest.js   # express-validator error handling
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── JobApplication.js
│   │   │   └── Cv.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   └── cvRoutes.js
│   │   └── server.js                # App entry point
│   ├── scripts/
│   │   ├── run-reminder-sweep.js    # Manually trigger the reminder sweep
│   │   └── migrate-cvs-to-gridfs.js # One-time: migrate pre-GridFS CVs (disk -> GridFS)
│   ├── .env                         # Your local secrets (gitignored)
│   ├── .env.example                 # Template — copy to .env and fill in
│   └── package.json
└── client/                          # React frontend (Vite + Tailwind)
    ├── src/
    │   ├── api/                     # One module per resource (auth, jobs, cv, stats)
    │   ├── components/               # Navbar, Layout, KanbanBoard, modals, etc.
    │   ├── constants/                # Status labels/colors
    │   ├── pages/                    # Dashboard, CvManager
    │   └── App.jsx                   # Routes
    ├── .env.example
    └── package.json
```

## Setup

### Server

1. `cd server && npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string, e.g. `openssl rand -hex 32`
   - `ANTHROPIC_API_KEY` — required for match scoring
   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` —
     optional; email reminders simply stay disabled (with a log line) if
     these are left unset
   - `CLIENT_URL` — used to build the link inside reminder emails
   - `FOLLOW_UP_DAYS` — how many days an "Applied" job can sit before it's
     considered stale (default `7`)
3. `npm run dev` — starts the server with nodemon (auto-restart on changes)
   - or `npm start` for a plain `node` run

Server runs on `http://localhost:5001` by default (`PORT` in `.env`; changed
from 5000 because macOS AirPlay Receiver occupies port 5000).

### Client

1. `cd client && npm install`
2. Copy `.env.example` to `.env` — `VITE_API_URL` should point at the
   server's `/api` base (`http://localhost:5001/api` by default)
3. `npm run dev` — starts the Vite dev server

## Deployment

The API deploys to **Render**, the client to **Vercel**. MongoDB Atlas
(already in use for local dev) is the database for both.

### API → Render
1. `render.yaml` at the repo root is a Render **Blueprint** — on Render, go
   New → Blueprint → select this GitHub repo, and it picks up the service
   config (root dir `server`, build/start commands) automatically.
2. Fill in the prompted secrets in Render's dashboard (same values as your
   local `server/.env`) — `MONGO_URI`, `JWT_SECRET`, `ANTHROPIC_API_KEY`,
   `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`EMAIL_FROM`. Leave
   `CLIENT_URL` for last (see step 4) — it isn't known until the client is
   deployed.
3. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` — Render's outbound
   IPs aren't static, and DB auth (already in `MONGO_URI`) still protects
   the connection.
4. Once live, you'll have a URL like `https://jobflow-api.onrender.com`.

### Client → Vercel
1. Vercel → Add New Project → import the same repo → set **Root Directory**
   to `client` (Vercel auto-detects the Vite build).
2. Set env var `VITE_API_URL` = `<your Render URL>/api`.
3. Deploy — you'll get a URL like `https://job-flow.vercel.app`.
4. **Loop back to Render**: set `CLIENT_URL` to this Vercel URL and
   redeploy/restart the API service — both the reminder-email "View your
   board" link and the password-reset link are built from `CLIENT_URL`, and
   CORS (`server.js`) only accepts requests from that origin.

## API endpoints

All routes below except `/api/health`, `/api/auth/register`,
`/api/auth/login`, `/api/auth/forgot-password`, and
`/api/auth/reset-password/:token` require `Authorization: Bearer <token>` and
are scoped to the logged-in user.

### Auth

| Method | Route              | Description                              |
|--------|--------------------|-------------------------------------------|
| GET    | `/api/health`       | Health check                              |
| POST   | `/api/auth/register` | Create a new user                        |
| POST   | `/api/auth/login`    | Log in, receive a JWT                     |
| GET    | `/api/auth/me`       | Return the logged-in user                 |
| PATCH  | `/api/auth/me`       | Update preferences (currently `remindersEnabled`) |
| POST   | `/api/auth/forgot-password` | Request a password reset email      |
| POST   | `/api/auth/reset-password/:token` | Set a new password using the emailed token |

### Job applications

| Method | Route              | Description                              |
|--------|--------------------|--------------------------------------------|
| POST   | `/api/jobs`          | Create a job application                  |
| GET    | `/api/jobs`          | List all of your job applications         |
| GET    | `/api/jobs/stats`     | Pipeline stats for the dashboard          |
| GET    | `/api/jobs/:id`       | Get one job application by id             |
| PUT    | `/api/jobs/:id`       | Update a job application (partial)        |
| DELETE | `/api/jobs/:id`       | Delete a job application                  |
| POST   | `/api/jobs/:id/score` | Score a stored CV against this job's description |

`status` must be one of: `Applied`, `Interview`, `Offer`, `Rejected`
(defaults to `Applied` if omitted).

`GET /api/jobs/stats` returns:
```json
{
  "total": 24,
  "byStatus": { "Applied": 10, "Interview": 8, "Offer": 3, "Rejected": 3 },
  "monthlyTrend": [{ "month": "2026-02", "count": 2 }, "... 6 months total"],
  "interviewRate": 46,
  "offerRate": 13
}
```
`interviewRate` = (Interview + Offer) / total, `offerRate` = Offer / total.

### CVs

| Method | Route                    | Description                    |
|--------|--------------------------|----------------------------------|
| POST   | `/api/cv`                 | Upload a PDF CV                 |
| GET    | `/api/cv`                 | List your uploaded CVs          |
| GET    | `/api/cv/:id/download`     | Download a CV                   |
| DELETE | `/api/cv/:id`              | Delete a CV                     |

### Example requests

```
POST /api/auth/register
Content-Type: application/json

{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

```
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Acme Corp",
  "role": "Backend Engineer",
  "jobDescription": "Node.js, Express, MongoDB...",
  "appliedDate": "2026-07-01",
  "status": "Applied",
  "notes": "Referred by a friend"
}
```

```
POST /api/jobs/:id/score
Authorization: Bearer <token>
Content-Type: application/json

{ "cvId": "<cv id from POST /api/cv>" }
```
Returns `{ score, strengths, gaps, explanation }`.

## Notes on design choices

- Passwords are hashed with bcrypt in a Mongoose `pre('save')` hook on the
  `User` model, and the schema field uses `select: false` so password hashes
  are never returned by default queries.
- Validation (`express-validator`) runs before controllers, so controllers
  can assume `req.body` is already well-formed.
- `protect` middleware in `middleware/authMiddleware.js` verifies the JWT
  and attaches the user to `req.user` — reused across `/api/jobs`, `/api/cv`,
  and the reminder job.
- Job/CV routes look up documents with `{ _id: req.params.id, user: req.user._id }`
  rather than just `_id`, so one user can never read/edit/delete another
  user's data — a mismatched id returns `404`, not `403`, to avoid revealing
  whether the id exists at all.
- The reminder mailer (`config/mailer.js`) never throws on missing SMTP
  config — it logs once and returns `null`, so the cron sweep (and the
  manual `scripts/run-reminder-sweep.js`) are safe to run in any environment,
  configured or not.
- The reminder sweep de-dupes by reusing `FOLLOW_UP_DAYS` as both the
  staleness threshold and the re-notify cadence (`lastReminderSentAt` on
  `JobApplication`) — no separate config needed.
- Password reset tokens are generated with `crypto.randomBytes`, then only
  the **SHA-256 hash** is stored on the user (`resetPasswordToken`,
  `select: false` like `password`) — the raw token only ever exists in the
  emailed link, so a database leak alone can't be used to reset accounts.
  Tokens expire after 1 hour and are single-use (cleared on success).
  `POST /api/auth/forgot-password` always returns the same generic message
  whether or not the email is registered, to avoid leaking which emails have
  accounts.
- CV files are stored in **MongoDB GridFS** (`config/gridfs.js`), not local
  disk — `multer.memoryStorage()` buffers the upload, then it's streamed
  into GridFS. This is what makes CVs survive redeploys on a host like
  Render, where the filesystem is ephemeral. `server/scripts/migrate-cvs-to-gridfs.js`
  is a one-time script that moved any CVs from the old disk-based scheme.
- CORS (`server.js`) is locked to `CLIENT_URL` rather than left wide open —
  cheap to do since `CLIENT_URL` already exists for the reminder/reset email
  links, and it means only the deployed frontend (or your local dev client)
  can call the API from a browser.

## Possible next steps

- Automated test coverage (currently none, on either client or server).
- Interview-date-specific reminders (would need a dedicated date field —
  today's reminders only cover "still Applied after N days").
- Rate limiting / `helmet` on the API (no protection yet against brute-force
  login or reset-request spam).
