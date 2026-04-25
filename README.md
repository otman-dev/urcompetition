# UR Competition

This project is a Next.js application using the App Router and Mongoose for MongoDB access. It currently supports team registration, team detail pages, and a scoreboard experience.

> Before deploying to Vercel and connecting MongoDB Atlas, the app needs a few important updates around authentication, user data, and data protection.

## Current Status

- Next.js 15 with React 19
- Team registration form and CRUD operations via `src/app/api/register/route.ts` and `src/app/api/team/[id]/*`
- MongoDB connection helpers in `src/lib/mongodb.ts` and an unused duplicate file `src/lib/db.ts`
- Team data is stored in a `Team` Mongoose model
- User login/authentication is not implemented yet

## Updates Needed Before Deployment

### 1. Add admin authentication only

- Create an `Admin` or `User` model with fields like:
  - `email`
  - `passwordHash`
  - `name`
  - `role` with a fixed value like `admin`
  - `competitionId` or `competitionName`
- Implement a login flow just for the admin user:
  - login page
  - logout button
  - protected admin dashboard
- No public user registration is required.
- Use secure password hashing (bcrypt or Argon2) and never store raw passwords.
- Add session handling using:
  - `next-auth`, or
  - custom cookie-based JWT/session logic.

### 2. Ensure only admin can manage their competition's teams

- Restrict team registration and management functionality to the authenticated admin.
- Add a competition scope so each admin only sees data for their own competition.
- Protect all admin pages and API routes:
  - `/api/register`
  - `/api/team/[id]/*`
  - the admin team management page(s)
- In the database, associate each team with the admin's competition:
  - `competitionId`
  - `registeredByAdminId`
- Server-side API checks must verify the authenticated admin's competition before returning or modifying teams.
- No team-level users are needed, because teams do not log in or interact with the site.

### 3. Clean up database helpers and models

- Consolidate MongoDB connection logic into a single file, ideally `src/lib/mongodb.ts`.
- Remove or merge the duplicate `src/lib/db.ts` file.
- Confirm the connection helper uses `process.env.MONGODB_URI` and throws a clear error if missing.

### 4. Update data model for production use

- Update the `Team` schema to include ownership fields such as:
  - `competitionId: string` or `mongoose.Schema.Types.ObjectId`
  - `registeredByAdminId: mongoose.Schema.Types.ObjectId`
  - optional `createdAt` / `updatedAt`
- Add a `User`/`Admin` schema and ensure API routes use the authenticated admin's competition scope.
- Consider adding a `TeamProfile` page for the admin dashboard and a separate competition details page.

### 5. MongoDB Atlas configuration

- Create a MongoDB Atlas cluster and database.
- Add the connection string to `.env.local` as:

```env
MONGODB_URI="your-atlas-connection-string"
```

- Keep `.env.local` out of git and confirm `.gitignore` contains `.env*`.
- Add the same `MONGODB_URI` value to Vercel project environment variables.

### 6. Secure app configuration and secrets

- Ensure `.gitignore` includes:
  - `.env*`
  - `.aidevops/`
- Do not commit credentials or Atlas URIs to the repository.
- Validate all incoming API input and sanitize strings.

### 7. Review frontend behavior and data flow

- Replace localStorage timer persistence with server-side persistence once auth is in place, or keep it as optional client state.
- Ensure users can only see/edit their own team information.
- Add error / access denied UI for unauthorized access.

### 8. Prepare for Vercel deployment

- Confirm `package.json` has:
  - `dev`, `build`, `start`, `lint`
- Confirm the app builds successfully with `npm run build`.
- Add any Vercel-specific config if needed (optional `vercel.json`).
- Set Vercel environment variables for production:
  - `MONGODB_URI`
  - any other secret keys if using custom auth or JWT

## Recommended Implementation Plan

1. Add an `Admin`/`User` Mongoose model with `competitionId`.
2. Add a login page and admin dashboard.
3. Implement secure sessions/auth middleware.
4. Associate teams with the admin's competition and confirm scope checks.
5. Protect API routes and pages so only the correct admin can access their competition data.
6. Configure MongoDB Atlas and `MONGODB_URI` locally.
7. Test locally and verify build.
8. Deploy to Vercel with the correct env vars.

## Next Steps After These Updates

- Deploy the GitHub repo to Vercel.
- Add `MONGODB_URI` to Vercel environment settings.
- Confirm the deployed app authenticates users and shows only their team details.
- Optionally add admin controls or a global scoreboard page.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

If you want, I can also create the next development plan for implementing the `User` model, auth pages, and protected API routes step by step.