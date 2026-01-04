## Full-stack Web Application (React + Express + MongoDB)

Includes **authentication** (register/login/logout via **httpOnly cookie JWT**) plus an **admin panel** (list users + change roles).

### Tech stack

- **Client**: React (Vite) + React Router + Axios
- **Server**: Express + Mongoose + JWT + bcrypt
- **DB**: MongoDB (local `mongod`)

### Project structure

- `client/`: React app
- `server/`: Express API

### Prerequisites

- Node.js 18+ (or newer)
- MongoDB running locally (`mongod`)

### Setup

1) Start MongoDB locally:

```bash
# If you installed MongoDB as a service, it may already be running.
# Otherwise start it (command varies by OS/package).
mongod
```

2) Configure env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3) Install dependencies:

```bash
npm install
```

4) Seed an admin user (optional but recommended):

```bash
npm run seed:admin --workspace server
```

### Run (dev)

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

### Admin panel

- Create an account or seed an admin via the script above.
- Admins can access the UI at `/admin` to manage user roles.

### API endpoints

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **Admin (admin-only)**
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:id/role`
