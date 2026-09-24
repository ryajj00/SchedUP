# SchedUP

SchedUP is a mobile-first schedule planner for students. It supports manual course entry, local persistence, conflict detection, and AI-backed schedule image review.

## Structure

- `mobile/` — Expo React Native app
- `backend/` — Express API for secure image scanning and AI validation
- `BUILD_SPEC.md` — authoritative product specification

## Run locally

Mobile:

```bash
cd mobile
npm install
npm start
```

For a physical device, point the mobile app at the computer running the backend:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend defaults to the deterministic mock provider for local development. To use real image extraction, set `AI_PROVIDER=openai`, `AI_API_KEY`, and optionally `AI_MODEL`/`AI_BASE_URL` in `backend/.env`.
