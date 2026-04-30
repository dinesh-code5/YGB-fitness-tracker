# Quick Start Commands - PostgreSQL Migration

## PREREQUISITES
- PostgreSQL installed and running
- Database `ygb` created
- PostgreSQL user `postgres` with password `postgres`

---

## QUICK START (Copy & Paste)

### Step 1: Create PostgreSQL Database
```bash
psql -U postgres -c "CREATE DATABASE ygb;"
```

### Step 2: Navigate to Backend
```bash
cd d:\projects\ygb-v3-patch\ygb\backend
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Sync Database
```bash
npm run db:sync
```

### Step 5: Start Server
```bash
npm run dev
```

### Step 6: Test API
```bash
curl http://localhost:5000/api/health
```

---

## IF USING POWERSHELL (Windows)

```powershell
# Step 1: Navigate to backend
cd "d:\projects\ygb-v3-patch\ygb\backend"

# Step 2: Install dependencies
npm install

# Step 3: Create database (if not exists)
psql -U postgres -c "CREATE DATABASE ygb;"

# Step 4: Sync database schema
npm run db:sync

# Step 5: Start development server
npm run dev

# In another terminal, test:
curl http://localhost:5000/api/health
```

---

## DATABASE SETUP OPTIONS

### Option A: PostgreSQL CLI
```bash
psql -U postgres
# Then run:
CREATE DATABASE ygb;
\q
```

### Option B: pgAdmin (GUI)
- Open pgAdmin 4
- Right-click on "Databases" → Create → Database
- Name: `ygb`
- Click "Save"

### Option C: Terminal with createdb
```bash
createdb -U postgres ygb
```

---

## VERIFICATION

### Check if server is running
```bash
curl http://localhost:5000/api/health
```

### Check database tables
```bash
psql -U postgres -d ygb -c "\dt"
```

### View table structure
```bash
psql -U postgres -d ygb -c "\d users"
```

---

## ENVIRONMENT SETUP

Your `.env` file already has correct PostgreSQL settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ygb
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret
API_NINJAS_KEY=your_api_ninjas_key_here
```

**If your PostgreSQL password is different, update `.env` accordingly.**
**Get your free API key at: https://api-ninjas.com/api/exercises**

---

## COMMON ISSUES & FIXES

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | PostgreSQL not running. Start it: `pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start` (Windows) |
| `database ygb does not exist` | Run: `createdb -U postgres ygb` |
| `role postgres does not exist` | Create user: `psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"` |
| `permission denied` | Check .env credentials match PostgreSQL setup |

---

## ALL-IN-ONE COMMAND (For PowerShell)

```powershell
# Complete setup in one go
cd "d:\projects\ygb-v3-patch\ygb\backend"; npm install; npm run db:sync; npm run dev
```

---

## NEXT: TEST THE API

Once server is running on `localhost:5000`:

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Get Health
```bash
curl http://localhost:5000/api/health
```

---

## NOTES

- Database sync is automatic on server start
- All tables created with relationships and constraints
- Password hashing is automatic on user creation
- JWT token valid for 7 days
- All errors are properly handled

**Migration Complete! ✅**
