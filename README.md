# JobFlow — Smart Job Application Tracker

JobFlow helps job seekers track applications from Applied → Interview → Offer →
Rejected, and uses the Claude API to score how well a user's CV matches a job
description.

This repo is being built in levels.
- **Level 1: backend foundation** — JWT authentication (done)
- **Level 2 (current): CRUD for job applications** — done

No frontend, CV upload, Claude integration, or reminders yet.

## Project structure

```
job-tracker/
├── server/                    # Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── jobController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification (protect)
│   │   │   └── validateRequest.js   # express-validator error handling
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── JobApplication.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   └── jobRoutes.js
│   │   └── server.js          # App entry point
│   ├── .env                   # Your local secrets (gitignored)
│   ├── .env.example           # Template — copy to .env and fill in
│   └── package.json
└── client/                    # React frontend (not started yet)
```

## Setup

1. `cd server && npm install`
2. Copy `.env.example` to `.env` (already done for you) and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string, e.g. generate one with
     `openssl rand -hex 32`
3. `npm run dev` — starts the server with nodemon (auto-restart on changes)
   - or `npm start` for a plain `node` run

Server runs on `http://localhost:5001` by default (`PORT` in `.env`; changed
from 5000 because macOS AirPlay Receiver occupies port 5000).

## API endpoints

### Auth (Level 1)

| Method | Route              | Auth required | Description                     |
|--------|--------------------|----------------|----------------------------------|
| GET    | `/api/health`       | No             | Health check                     |
| POST   | `/api/auth/register` | No           | Create a new user                |
| POST   | `/api/auth/login`    | No           | Log in, receive a JWT            |
| GET    | `/api/auth/me`       | Yes (Bearer)  | Return the logged-in user        |

### Job applications (Level 2)

All routes below require `Authorization: Bearer <token>` and are scoped to
the logged-in user — you can only see/edit/delete your own applications.

| Method | Route            | Description                          |
|--------|-------------------|---------------------------------------|
| POST   | `/api/jobs`        | Create a job application              |
| GET    | `/api/jobs`        | List all of your job applications     |
| GET    | `/api/jobs/:id`     | Get one job application by id         |
| PUT    | `/api/jobs/:id`     | Update a job application (partial)    |
| DELETE | `/api/jobs/:id`     | Delete a job application              |

`status` must be one of: `Applied`, `Interview`, `Offer`, `Rejected`
(defaults to `Applied` if omitted).

#### Create

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

Returns `201` with the created job document (only `company` and `role` are
required).

#### List / Get / Update / Delete

- `GET /api/jobs` → `200` with an array of your job applications.
- `GET /api/jobs/:id` → `200` with one job, or `404` if it doesn't exist or
  belongs to someone else.
- `PUT /api/jobs/:id` → send only the fields you want to change; `200` with
  the updated job.
- `DELETE /api/jobs/:id` → `200` `{ message: "Job application deleted" }`.

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Returns `201` with `{ token, user }`.

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Returns `200` with `{ token, user }`.

### Protected route example

```
GET /api/auth/me
Authorization: Bearer <token from register/login>
```

Returns `200` with `{ user }`, or `401` if the token is missing/invalid.

## Notes on design choices

- Passwords are hashed with bcrypt in a Mongoose `pre('save')` hook on the
  `User` model, and the schema field uses `select: false` so password hashes
  are never returned by default queries.
- Validation (`express-validator`) runs before controllers, so controllers
  can assume `req.body` is already well-formed.
- `protect` middleware in `middleware/authMiddleware.js` verifies the JWT
  and attaches the user to `req.user` — reused on all `/api/jobs` routes.
- Job routes look up documents with `{ _id: req.params.id, user: req.user._id }`
  rather than just `_id`, so one user can never read/edit/delete another
  user's applications — a mismatched id returns `404`, not `403`, to avoid
  revealing whether the id exists at all.

## What's next (later levels)

- Kanban board (drag-and-drop)
- CV upload (Multer)
- Claude API match scoring
- Reminders (node-cron + Nodemailer)
- Dashboard stats + charts
- React frontend
