# MongoDB to PostgreSQL Migration - Complete Setup Guide

## Overview
Your YGB backend has been fully migrated from MongoDB/Mongoose to PostgreSQL/Sequelize. All database operations now use SQL through Sequelize ORM.

---

## STEP-BY-STEP SETUP COMMANDS

### **STEP 1: Install PostgreSQL (If Not Already Done)**

#### On Windows:
```cmd
# Download and install from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Set up PostgreSQL service
# Default username: postgres
# Default password: postgres (you set during installation)
```

#### On macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### On Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

### **STEP 2: Create PostgreSQL Database**

```bash
# Open PostgreSQL command line
psql -U postgres

# Inside psql shell, run:
CREATE DATABASE ygb;
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO off;
ALTER ROLE postgres SET default_transaction_read_only TO off;
ALTER ROLE postgres SET timezone TO 'UTC';
ALTER USER postgres CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE ygb TO postgres;

# Exit psql
\q
```

Or simply use this one-liner:
```bash
createdb -U postgres ygb
```

---

### **STEP 3: Navigate to Backend Directory**

```bash
cd d:\projects\ygb-v3-patch\ygb\backend
# or your project path
```

---

### **STEP 4: Verify .env Configuration**

Check that `.env` file has correct PostgreSQL settings:

```env
PORT=5000
JWT_SECRET=ygb_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# PostgreSQL Local Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ygb
DB_USER=postgres
DB_PASSWORD=postgres
```

**If you haven't created `.env` file, the migration has created it automatically. Verify the values match your PostgreSQL setup.**

---

### **STEP 5: Install Dependencies**

```bash
npm install
```

This will install:
- `sequelize` - ORM for PostgreSQL
- `pg` & `pg-hstore` - PostgreSQL drivers
- `express` - API framework
- `jsonwebtoken` - Authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemon` - Auto-restart (dev)

---

### **STEP 6: Sync Database Schema**

Run the database sync script to create all tables:

```bash
npm run db:sync
```

You should see output like:
```
🔄 Starting database sync...
✅ PostgreSQL connection successful
✅ All models synchronized

📊 Tables created/updated:
  - users
  - workouts
  - diet_plans
  - workout_templates
```

**Important Notes:**
- This command creates/updates tables based on your Sequelize models
- If tables already exist, it uses `alter: true` for safe modifications
- All relationships (foreign keys, cascading deletes) are set up automatically

---

### **STEP 7: Start Backend Server**

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

You should see:
```
✅ PostgreSQL connected
✅ Database synced
🚀 Server running on port 5000
```

---

## TESTING THE MIGRATION

Once the server is running, test the API endpoints:

### **Test 1: Health Check**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "YGB API Running 💪",
  "timestamp": "2024-04-23T10:30:00.000Z"
}
```

### **Test 2: User Registration**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "weight": 70,
    "height": 180,
    "gender": "male"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

### **Test 3: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## VERIFY DATABASE TABLES

Connect to PostgreSQL and verify tables were created:

```bash
# Connect to database
psql -U postgres -d ygb

# Inside psql, list tables
\dt

# You should see:
#             List of relations
#  Schema |       Name       | Type  |  Owner
# --------+------------------+-------+----------
#  public | users            | table | postgres
#  public | workouts         | table | postgres
#  public | diet_plans       | table | postgres
#  public | workout_templates| table | postgres

# View table structure (example)
\d users

# Exit
\q
```

---

## KEY CHANGES FROM MONGOOSE TO SEQUELIZE

### **Database Queries**

| Operation | Mongoose | Sequelize |
|-----------|----------|-----------|
| Find by ID | `User.findById(id)` | `User.findByPk(id)` |
| Find one | `User.findOne({email})` | `User.findOne({where: {email}})` |
| Find all | `User.find({goal: 'bulk'})` | `User.findAll({where: {goal: 'bulk'}})` |
| Create | `User.create({...})` | `User.create({...})` |
| Update | `user.save()` | `user.save()` |
| Delete | `User.findByIdAndDelete(id)` | `User.destroy({where: {id}})` |
| Count | `User.countDocuments({})` | `User.count({where: {}})` |

### **Authentication**

| Item | Change |
|------|--------|
| User ID | `user._id` → `user.id` |
| Password Field | `.select('+password')` → `attributes: { include: ['password'] }` |
| Find with attributes | `.select('name email')` → `attributes: ['name', 'email']` |

### **Operators**

| MongoDB | Sequelize |
|---------|-----------|
| `{$regex: 'q'}` | `{[Op.iLike]: `%q%`}` |
| `{$ne: value}` | `{[Op.ne]: value}` |
| `{$gte: value}` | `{[Op.gte]: value}` |
| `{$or: [...]}` | `{[Op.or]: [...]}` |

---

## TROUBLESHOOTING

### **Error: "ECONNREFUSED: Connection refused"**
- PostgreSQL server is not running
- **Solution**: Start PostgreSQL:
  ```bash
  # Windows
  net start postgresql-x64-15
  
  # macOS
  brew services start postgresql
  
  # Linux
  sudo systemctl start postgresql
  ```

### **Error: "database ygb does not exist"**
- Database wasn't created
- **Solution**: Run the CREATE DATABASE command from Step 2

### **Error: "role postgres does not exist"**
- PostgreSQL user wasn't created properly
- **Solution**: Recreate the user:
  ```bash
  psql -U postgres -d postgres -c "ALTER USER postgres PASSWORD 'postgres';"
  ```

### **Error: "Unexpected token in JSON"**
- Sequelize is trying to use old field names
- **Solution**: Ensure you updated the .env with correct DB credentials

### **Error: "Column does not exist"**
- Models haven't been synced to database
- **Solution**: Run `npm run db:sync`

---

## NEXT STEPS: FRONTEND MIGRATION (Optional)

If your frontend uses API calls, no changes needed as the API endpoints remain the same. The migration is fully transparent to the frontend.

---

## ENVIRONMENT VARIABLES REFERENCE

```env
# Server
PORT=5000                           # API port
NODE_ENV=development                # development|production
CLIENT_URL=http://localhost:3000    # CORS origin

# JWT Authentication
JWT_SECRET=your_secret_key          # Change in production!
JWT_EXPIRE=7d                       # Token expiration

# PostgreSQL Database
DB_HOST=localhost                   # Database host
DB_PORT=5432                        # PostgreSQL default port
DB_NAME=ygb                         # Database name
DB_USER=postgres                    # Database user
DB_PASSWORD=postgres                # Database password

# Alternative: Full DATABASE_URL (for cloud deployments)
# DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

## PRODUCTION DEPLOYMENT

For production (Heroku, Render, Railway, AWS):

1. Create PostgreSQL database on your hosting provider
2. Set `DATABASE_URL` environment variable
3. Update `NODE_ENV=production`
4. SSL is automatically enabled in production
5. Run migrations if needed:
   ```bash
   npm run db:sync
   ```

Example production .env:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@hostname:5432/ygb
JWT_SECRET=your_production_secret_key
PORT=5000
```

---

## USEFUL COMMANDS

```bash
# Development with auto-reload
npm run dev

# Start production server
npm start

# Sync database schema
npm run db:sync

# View logs
npm run dev 2>&1 | tee server.log

# Kill server on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill server on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9
```

---

## ROLLBACK TO MONGODB (If Needed)

To revert to MongoDB, you would need:
1. Restore old Mongoose models
2. Update server.js to use mongoose.connect()
3. Reinstall mongoose: `npm install mongoose`
4. Update all controllers back to Mongoose syntax

**However, with Sequelize, your data remains in PostgreSQL, which is more scalable and reliable.**

---

## SUPPORT & DEBUGGING

All files have been updated:
- ✅ `server.js` - Uses Sequelize
- ✅ `config/database.js` - PostgreSQL connection
- ✅ `models/User.js` - Sequelize model
- ✅ `models/Workout.js` - Sequelize model
- ✅ `models/DietPlan.js` - Sequelize model
- ✅ `controllers/authController.js` - Sequelize queries
- ✅ `controllers/userController.js` - Sequelize queries
- ✅ `controllers/workoutController.js` - Sequelize queries
- ✅ `controllers/dietController.js` - Sequelize queries
- ✅ `middleware/auth.js` - Sequelize queries
- ✅ `scripts/syncDb.js` - Database sync script
- ✅ `.env` - PostgreSQL configuration

All errors related to MongoDB/Mongoose have been fixed and replaced with Sequelize equivalents.
