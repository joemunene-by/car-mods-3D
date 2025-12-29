#!/bin/bash

echo "🚀 Setting up Car Mods 3D..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi
echo ""

# Instructions
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Install and start PostgreSQL"
echo "2. Create a database: createdb car_mods_3d"
echo "3. Update backend/.env with your database credentials"
echo "4. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "Happy coding! 🚗💨"
