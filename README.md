# Brainwave GK — Python + React + Tailwind + Supabase Leaderboard

A general-knowledge quiz app. Flask backend serves questions from a curated bank;
React + Tailwind frontend shows the gamified quiz UI. Scores sync to a shared
**Supabase leaderboard** so every player worldwide competes on the same board.

## 1. Backend (Python / Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                 # http://localhost:5000
```

## 2. Frontend (React + Vite + Tailwind)
```bash
cd frontend
cp .env.example .env          # then fill VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev                   # http://localhost:5173
```

## 3. Supabase database (leaderboard / history)

Create a free project at https://supabase.com, then run this SQL in
**SQL Editor → New query**:

```sql
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  score integer not null default 0,
  total integer not null default 0,
  streak integer not null default 0,
  best_streak integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

grant select, insert, update on public.scores to anon, authenticated;
grant all on public.scores to service_role;

alter table public.scores enable row level security;

create policy "Public can view scores"   on public.scores for select using (true);
create policy "Anyone can insert scores" on public.scores for insert with check (true);
create policy "Anyone can update scores" on public.scores for update using (true) with check (true);

-- Per-answer history / analytics
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  category text not null,
  difficulty text not null,
  question text not null,
  is_correct boolean not null,
  streak_after integer not null default 0,
  score_after integer not null default 0,
  total_after integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists attempts_username_created_idx on public.attempts (username, created_at desc);
create index if not exists attempts_created_idx on public.attempts (created_at desc);

grant select, insert on public.attempts to anon, authenticated;
grant all on public.attempts to service_role;

alter table public.attempts enable row level security;
create policy "Public can view attempts"   on public.attempts for select using (true);
create policy "Anyone can insert attempts" on public.attempts for insert with check (true);
```

Then in **Project Settings → API**, copy:
- Project URL → `VITE_SUPABASE_URL`
- `anon` / publishable key → `VITE_SUPABASE_PUBLISHABLE_KEY`

Paste both into `frontend/.env` (local) and into your Vercel/Netlify project's
Environment Variables (production).

The leaderboard page lives at **`/leaderboard`** and is ranked by
`best_streak` DESC, then `score` DESC.

## Deployment

- **Frontend** → Vercel / Netlify / Cloudflare Pages
  - Root: `frontend/`, build: `npm run build`, output: `dist`
  - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars
  - (Optional) `VITE_API_BASE` if hosting the Flask API separately
- **Backend** → Render / Railway / Fly.io
  - Root: `backend/`, start: `gunicorn app:app` or `python app.py`

## Structure
```
brainwave-gk/
├── backend/
│   ├── app.py            # Flask API — question bank
│   ├── questions.py
│   └── requirements.txt
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── Landing.jsx
        ├── Quiz.jsx           # syncs scores to Supabase
        ├── Leaderboard.jsx    # /leaderboard page
        ├── supabase.js        # Supabase client + helpers
        └── index.css
```
