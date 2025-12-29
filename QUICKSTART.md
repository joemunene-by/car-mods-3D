# Quick Start Guide 🚀

Get Car Mods 3D up and running in minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if Docker is installed (optional, for database)
docker --version
```

## Installation (5 minutes)

### 1. Install Dependencies

```bash
# Install all dependencies for root, frontend, and backend
npm run install-all
```

### 2. Set Up Database

**Quick & Easy - Using Docker:**
```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Check if it's running
docker ps
```

**Alternative - Local PostgreSQL:**
```bash
# Create database
createdb car_mods_3d

# Copy and edit environment file
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
cd ..
```

### 3. Set Up Environment Files

```bash
# Backend
cd backend
cp .env.example .env
cd ..

# Frontend
cd frontend
cp .env.example .env
cd ..
```

If using Docker, the default `.env` values will work!

## Running the Application

### Start Everything

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:3000

### Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Testing the Setup

1. Open http://localhost:3000 in your browser
2. You should see the "Car Mods 3D" homepage
3. Click "Start Customizing" to see the 3D viewer
4. Check http://localhost:5000/api/health for backend status

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps  # If using Docker

# Restart Docker containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Dependencies Not Installing

```bash
# Clear caches and reinstall
npm run clean
npm run install-all
```

## Next Steps

1. ✅ Explore the 3D car viewer at `/customizer`
2. ✅ Check the API endpoints at http://localhost:5000/api
3. ✅ Read the full [README.md](README.md) for more details
4. ✅ Check [CONTRIBUTING.md](CONTRIBUTING.md) to start developing

## Development Tips

### Run Frontend Only
```bash
npm run dev:frontend
```

### Run Backend Only
```bash
npm run dev:backend
```

### Build for Production
```bash
npm run build
```

### Stop Database
```bash
docker-compose down
```

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub

---

**You're all set! Happy customizing! 🚗💨**
