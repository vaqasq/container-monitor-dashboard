# Container Monitor Dashboard

A React and TypeScript client for [Container Health Monitor](https://github.com/vaqasq/monitor.vaqas.dev). Live at [dashboard.vaqas.dev](https://dashboard.vaqas.dev).

The Go daemon already serves a server-rendered dashboard at [monitor.vaqas.dev](https://monitor.vaqas.dev). This is a second, separate client for the same backend, built to learn TypeScript and React against an API I already understood well.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

## What it does

- Polls `/api/containers` and `/api/history` on the existing Go daemon every 30 seconds
- Shows live container cards with threshold based coloring for CPU and memory usage
- Groups historical metrics by container and renders them as line charts with Recharts
- Handles loading and error states separately for the current state and history fetches

## Why a new client instead of rebuilding the existing dashboard

The original dashboard is server-rendered HTML, refreshed with a meta tag. Rebuilding that same table in React would just be a direct translation with no real reason behind it. Instead, the Go daemon got two new JSON endpoints, `/api/containers` and `/api/history`, and this app is a separate frontend that uses them. Same backend, two different clients, each suited to how it works.

## Technical decisions

**Flat history response, grouped on the client.** The `/api/history` endpoint returns one flat, time ordered array across both containers instead of grouping them on the server. Grouping by container name happens in React. This keeps the API simple and gives the frontend real data shaping work to do.

**TypeScript instead of plain JavaScript.** The contract with the Go backend is defined once as a TypeScript interface, matching the JSON tags on the Go structs exactly. Mismatches between what the API returns and what the frontend expects get caught at compile time.

**Polling instead of WebSockets.** The underlying data only changes every 30 seconds, since that is the daemon's own polling interval. A WebSocket connection would add complexity without a real benefit at that update rate.

## What I learned

- The mechanics of fetch and promise chains, and why checking response.ok before parsing JSON matters
- useState and useEffect for managing async data and side effects, including interval cleanup to avoid stacking polls
- useMemo for avoiding unnecessary recomputation on every render
- Why TypeScript types are a contract with a backend, not a runtime guarantee

## Stack

- React and TypeScript
- Vite
- Recharts

## Running locally

Requires the [Go backend](https://github.com/vaqasq/monitor.vaqas.dev) running and reachable. Update the API URL in App.tsx if it should not point at production.

```bash
git clone https://github.com/vaqasq/dashboard.vaqas.dev
cd dashboard.vaqas.dev
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`.