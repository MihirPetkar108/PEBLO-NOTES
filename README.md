# Peblo Notes — AI-Powered Collaborative Notes Workspace

A full-stack, production-ready notes application built with **MERN + TypeScript**. Features AI-powered summaries via OpenAI, real-time auto-save, public note sharing, tag-based organization, and rich productivity insights.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, TailwindCSS |
| State | Zustand (auth/theme), TanStack Query (server state) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (RS256), bcrypt password hashing |
| AI | OpenAI GPT-3.5-Turbo |
| Charts | Recharts |
| Routing | React Router v6 |

---

## Features

- **Authentication** — Signup/Login with JWT sessions, protected routes, auto-token refresh
- **Notes Workspace** — Create, edit, delete, archive notes with auto-save (1s debounce)
- **AI Integration** — Generate summaries, action items, and suggested titles via OpenAI
- **Tags & Categories** — Organize notes with color-coded tags and custom categories
- **Search & Filtering** — Full-text search, tag filters, category filters
- **Public Sharing** — Generate shareable public links for any note
- **Productivity Dashboard** — Total notes, weekly activity chart, top tags, AI usage stats
- **Dark Mode** — Full dark/light mode with system preference detection
- **Responsive** — Works on mobile and desktop

---

## Project Structure

```
peblo-notes/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Auth & Notes business logic
│   │   ├── middleware/       # Auth guard, error handler
│   │   ├── models/          # User & Note Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # AI service (OpenAI)
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # JWT helpers
│   │   └── index.ts         # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/        # Login/Signup form
    │   │   ├── layout/      # Sidebar layout
    │   │   ├── notes/       # NoteCard, NoteEditor
    │   │   └── shared/      # ProtectedRoute
    │   ├── hooks/           # useNotes (React Query hooks)
    │   ├── lib/             # axios instance, utils
    │   ├── pages/           # NotesPage, DashboardPage, SearchPage, SharedNotePage
    │   ├── store/           # Zustand stores (auth, theme)
    │   ├── types/           # TypeScript types
    │   └── App.tsx          # Router setup
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd peblo-notes
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/peblo-notes
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-key-here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Vite proxies `/api` to `localhost:5000` automatically — no `.env` needed for development.

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Notes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List notes (with search/filter query params) |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update note (auto-save) |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/generate-summary` | AI summary generation |
| POST | `/api/notes/:id/toggle-share` | Toggle public sharing |
| GET | `/api/notes/meta/insights` | Dashboard insights |
| GET | `/api/notes/shared/:shareId` | Public note (no auth) |

### Query Parameters for GET /api/notes
- `search` — keyword search in title & content
- `tags` — comma-separated tag filter
- `category` — category filter
- `archived` — `true` for archived notes
- `sort` — e.g. `-updatedAt` (default), `-createdAt`
- `page`, `limit` — pagination

---

## Example API Responses

### POST /api/auth/login
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "USR_001",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### POST /api/notes/:id/generate-summary
```json
{
  "success": true,
  "data": {
    "summary": "Weekly project planning discussion covering sprint goals and blockers.",
    "actionItems": ["Prepare UI mockups", "Review API structure", "Schedule standup"],
    "suggestedTitle": "Sprint Planning Notes — Week 20"
  }
}
```

### GET /api/notes/meta/insights
```json
{
  "success": true,
  "data": {
    "totalNotes": 24,
    "archivedNotes": 3,
    "weeklyActivity": 7,
    "aiUsageTotal": 12,
    "topTags": [
      { "tag": "work", "count": 8 },
      { "tag": "ideas", "count": 5 }
    ],
    "dailyActivity": [
      { "date": "2026-05-09", "count": 2 },
      { "date": "2026-05-10", "count": 0 }
    ],
    "recentNotes": [...]
  }
}
```

---

## Database Schema

### User
```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (bcrypt, select: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Note
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  content: String,
  tags: [String],
  category: String,
  isArchived: Boolean,
  isPublic: Boolean,
  shareId: String (unique, sparse),
  aiSummary: String,
  aiActionItems: [String],
  aiSuggestedTitle: String,
  aiUsageCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT with configurable expiry
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- CORS restricted to client URL
- No secrets committed — use `.env`

---

## Build for Production

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
# Serve dist/ with nginx or any static host
```

---

## Optional Enhancements (implemented)

- ✅ Dark mode with system preference detection
- ✅ Auto-save with debounce
- ✅ Responsive mobile layout
- ✅ Tag color system
- ✅ Pagination support
- ✅ Rate limiting
