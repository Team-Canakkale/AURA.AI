# 🌟 Aura AI Platform

Multi-service AI platform with microservices architecture built with Node.js, React, and TypeScript.

## 📁 Project Structure

```
aura-ai/
├── apps/
│   ├── frontend/           # React + Vite frontend (Port 3000)
│   ├── backend-finance/    # Finance service API (Port 4001)
│   ├── backend-habit/      # Habit tracking API (Port 4002)
│   └── backend-health/     # Health metrics API (Port 4003)
└── package.json           # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ (Currently using v24.11.1)
- npm v8+ (Currently using v11.8.0)

### Installation

Install all dependencies for all workspaces:

```bash
npm install
```

### Development

Run all services in development mode:

```bash
npm run dev
```

Or run individual services:

```bash
# Frontend only
npm run dev:frontend

# Finance service
npm run dev:finance

# Habit service
npm run dev:habit

# Health service
npm run dev:health
```

### Build

Build all projects:

```bash
npm run build
```

## 🌐 Services

### Frontend (Port 3000)
- React 18 with TypeScript
- Vite for fast development
- Modern glassmorphism UI design
- Real-time service status monitoring

### Backend Services

**Finance Service (Port 4001)**
- Transaction management
- Budget tracking
- Financial analytics

**Habit Service (Port 4002)**
- Habit tracking
- Streak monitoring
- Progress analytics

**Health Service (Port 4003)**
- Health metrics
- Wellness data
- Activity tracking

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Axios
- **Backend**: Node.js, Express, TypeScript
- **Dev Tools**: tsx (TypeScript execution), rimraf (cleaning)

## 📝 Scripts

- `npm run dev` - Run all services in development
- `npm run build` - Build all projects
- `npm run clean` - Clean all build artifacts
- `npm run install:all` - Install all dependencies

## 🎨 Features

- ✅ Monorepo architecture with npm workspaces
- ✅ TypeScript throughout
- ✅ Hot reload for all services
- ✅ Modern UI with glassmorphism design
- ✅ CORS-enabled APIs
- ✅ Health check endpoints
- ✅ API proxy configuration

## 📦 Package Management

This project uses npm workspaces for efficient monorepo management. Dependencies are hoisted to the root when possible.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test all services
4. Submit a pull request

## 👨‍💻 Backend Developer Guide

### Cloning and Setup

```bash
# Clone the repository
git clone <repository-url>
cd aura-ai

# Install all dependencies
npm install

# Start all services
npm run dev
```

### Creating a New Backend Service

To add a new microservice, follow these steps:

#### 1. Create Service Directory

```bash
cd apps
mkdir backend-yourservice
cd backend-yourservice
```

#### 2. Initialize Package

Create `package.json`:

```json
{
    "name": "@aura-ai/backend-yourservice",
    "version": "1.0.0",
    "private": true,
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "clean": "rimraf dist node_modules"
    },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
        "@types/node": "^20.10.5",
        "typescript": "^5.3.3",
        "tsx": "^4.7.0",
        "rimraf": "^5.0.5"
    }
}
```

#### 3. Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

#### 4. Create Service Code

Create `src/index.ts`:

```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004; // Choose next available port

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Required!)
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'yourservice',
        timestamp: new Date().toISOString()
    });
});

// Your API endpoints here
app.get('/api/yourservice/data', (req: Request, res: Response) => {
    res.json({
        message: 'Your service is working!'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Your service running on http://localhost:${PORT}`);
});
```

#### 5. Add to Root Package Scripts

Add your service to `package.json` in the root directory:

```json
"scripts": {
    ...
    "dev:yourservice": "npm run dev -w apps/backend-yourservice"
}
```

#### 6. Update Vite Proxy Configuration

Add proxy to `apps/frontend/vite.config.ts`:

```typescript
proxy: {
    ...
    '/api/yourservice': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yourservice/, '')
    }
}
```

#### 7. Update Frontend to Display Service

Add to `apps/frontend/src/App.tsx`:

```typescript
// Add to state
const [services, setServices] = useState({
    ...
    yourservice: null
});

// Add to endpoints
{ name: 'yourservice', url: '/api/yourservice/health' }

// Add ServiceCard component
<ServiceCard
    title="🎯 Your Service"
    status={services.yourservice}
    description="Your service description"
/>
```

#### 8. Run Your Service

```bash
# From root directory
npm run dev:yourservice

# Or run all services
npm run dev
```

### Best Practices

- ✅ Always include a `/health` endpoint
- ✅ Use TypeScript for type safety
- ✅ Enable CORS for frontend communication
- ✅ Use environment variables for configuration
- ✅ Follow the existing port numbering (4001, 4002, 4003, 4004...)
- ✅ Add proper error handling
- ✅ Use meaningful HTTP status codes
- ✅ Document your API endpoints
- ✅ Test your service before committing

### Port Allocation

- **3000**: Frontend
- **4001**: Finance Service
- **4002**: Habit Service
- **4003**: Health Service
- **4004+**: Your new services

### Environment Variables

Create `.env` file in your service directory:

```env
PORT=4004
NODE_ENV=development
```

## 📄 License

ISC
