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

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
