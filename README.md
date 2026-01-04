## Full-stack Web Application (React + Express + MongoDB)

Includes **authentication** (register/login/logout via **httpOnly cookie JWT**) plus an **admin panel** (list users + change roles).

Now elevated into an **Event / Appointment Booking System**:

- Users can **browse upcoming events** and **book** a spot.
- Bookings are stored in MongoDB with statuses: **pending**, **approved**, **cancelled**.
- Events can be set to **instant approval** or **require admin approval**.
- Admins can **create/update events** and **approve/cancel bookings**.

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
- Admins can also manage **events** and **bookings** in `/admin`.

### API endpoints

- **Events (public)**
  - `GET /api/events` (upcoming active events)
  - `GET /api/events/:id`
- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **Bookings (authenticated)**
  - `GET /api/bookings/me`
  - `POST /api/bookings` (book an event)
  - `POST /api/bookings/:id/cancel`
- **Admin (admin-only)**
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:id/role`
  - `GET /api/admin/events`
  - `POST /api/admin/events`
  - `GET /api/admin/events/:id`
  - `PATCH /api/admin/events/:id`
  - `GET /api/admin/bookings`
  - `PATCH /api/admin/bookings/:id/status`
