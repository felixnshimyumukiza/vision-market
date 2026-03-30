# Vision Market

Vision Market is a full-stack ecommerce prototype with:
- `frontend`: Next.js buyer and seller UI
- `backend`: Express + PostgreSQL API

## Project Structure

```text
vision-market/
  backend/
  frontend/
```

## Environment Setup

Create these files before running the system:

1. `backend/.env`
   Start from [`backend/.env.example`](/abs/path/c:/Users/Felix/vision-market/backend/.env.example)

2. `frontend/.env.local`
   Start from [`frontend/.env.example`](/abs/path/c:/Users/Felix/vision-market/frontend/.env.example)

Required backend values:
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `JWT_SECRET`

Required frontend values:
- `NEXT_PUBLIC_API_BASE_URL`

## Development

Run backend:

```powershell
cd c:\Users\Felix\vision-market\backend
npm install
npm run dev
```

Run frontend:

```powershell
cd c:\Users\Felix\vision-market\frontend
npm install
npm run dev
```

Or use the root shortcuts:

```powershell
cd c:\Users\Felix\vision-market
npm run dev:backend
```

```powershell
cd c:\Users\Felix\vision-market
npm run dev:frontend
```

## Production Notes

Backend:
- requires a real `JWT_SECRET`
- restricts CORS to configured frontend origins
- exposes `GET /api/health`

Frontend:
- expects the backend API URL through `NEXT_PUBLIC_API_BASE_URL`
- should be built before production start

Production commands:

```powershell
cd c:\Users\Felix\vision-market\frontend
npm run build
npm run start
```

```powershell
cd c:\Users\Felix\vision-market\backend
npm run start
```

## Database Setup

The repo includes SQL setup files:
- [`backend/categories_seed.sql`](/abs/path/c:/Users/Felix/vision-market/backend/categories_seed.sql)
- [`backend/orders_address.sql`](/abs/path/c:/Users/Felix/vision-market/backend/orders_address.sql)
- [`backend/user_avatar.sql`](/abs/path/c:/Users/Felix/vision-market/backend/user_avatar.sql)
- [`backend/analytics.sql`](/abs/path/c:/Users/Felix/vision-market/backend/analytics.sql)

Apply them to the `VISION_MARKET` PostgreSQL database if the schema is not already present.

## Testing

Backend unit tests:

```powershell
cd c:\Users\Felix\vision-market\backend
npm test
```
