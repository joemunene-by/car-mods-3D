# Car Mods 3D 🚗✨

A full-stack car customization platform with stunning 3D visualization. Built with React, Three.js, Node.js, Express, TypeScript, and PostgreSQL.

## 🌟 Features

- **3D Car Visualization**: Interactive 3D car models powered by Three.js
- **Real-time Customization**: Customize colors, parts, and modifications in real-time
- **Modern Tech Stack**: Built with the latest technologies
- **Type-Safe**: Full TypeScript support across frontend and backend
- **RESTful API**: Clean and scalable backend architecture
- **Monorepo Structure**: Easy to manage and maintain

## 🛠️ Tech Stack

### Frontend
- **React 18+** - Modern UI library
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - ORM for database
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
car-mods-3d/
├── backend/                 # Backend API
│   ├── config/             # Database and config files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── src/                # Additional source files
│   ├── index.ts            # Entry point
│   ├── package.json        # Backend dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── nodemon.json        # Nodemon config
│   └── .env.example        # Environment variables template
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # State management
│   │   ├── styles/        # CSS files
│   │   ├── three-viewer/  # 3D visualization logic
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── tsconfig.json      # TypeScript config
│   ├── vite.config.ts     # Vite configuration
│   └── .env.example       # Environment variables template
│
├── scripts/               # Build and deployment scripts
├── package.json          # Root package.json for monorepo
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher) OR **Docker** (for easy database setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-mods-3d
   ```

2. **Install dependencies**
   
   Install root dependencies:
   ```bash
   npm install
   ```
   
   Install all dependencies (root + frontend + backend):
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

   Frontend:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env if needed (defaults should work)
   ```

4. **Set up the database**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```
   This will start a PostgreSQL container with the default settings from `.env.example`.
   
   **Option B: Using local PostgreSQL**
   ```bash
   createdb car_mods_3d
   ```
   Update the database credentials in `backend/.env`

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend** (http://localhost:5000):
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Frontend** (http://localhost:3000):
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

#### Production Build

Build both applications:
```bash
npm run build
```

Build individually:
```bash
npm run build:backend
npm run build:frontend
```

Start production servers:
```bash
npm run start:backend
npm run start:frontend
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check API status
- `GET /api` - Welcome message

More endpoints will be added as the project develops.

## 🎨 Customization

The 3D car viewer is located in `frontend/src/three-viewer/CarViewer.tsx`. You can:
- Load custom 3D models
- Add materials and textures
- Implement paint colors
- Add car parts and modifications

State management for customization is handled by Zustand in `frontend/src/store/carStore.ts`.

## 🧪 Testing

Testing frameworks will be added in future iterations.

## 📝 Development Scripts

### Root Level
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build both applications
- `npm run install-all` - Install all dependencies
- `npm run clean` - Remove all node_modules

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Features

- [ ] User authentication and profiles
- [ ] Save and share custom car designs
- [ ] Multiple car models
- [ ] Advanced 3D materials and lighting
- [ ] Real-time multiplayer customization
- [ ] Export custom designs
- [ ] Mobile responsive 3D viewer
- [ ] Admin dashboard

## 💡 Notes

- The backend uses TypeORM with `synchronize: true` in development mode, which automatically creates database tables from your models
- The frontend uses Vite for blazing-fast development experience
- Three.js models are currently placeholder boxes - replace with actual car models
- CORS is configured to allow requests from the frontend

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Happy Customizing! 🚗💨**
