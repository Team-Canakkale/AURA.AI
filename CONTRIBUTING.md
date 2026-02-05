# Contributing to Aura AI Platform

Thank you for considering contributing to Aura AI! This document provides guidelines for backend developers who want to add new services.

## 🚀 Quick Start for Backend Developers

### 1. Clone and Setup

```bash
git clone <repository-url>
cd aura-ai
npm install
```

### 2. Test Existing Services

```bash
npm run dev
```

Visit `http://localhost:3000` to see all services running.

## 📝 Adding a New Backend Service

### Method 1: Using Template (Recommended)

The fastest way to create a new service:

```bash
# Copy the template
cp -r apps/backend-template apps/backend-yourservice

# Update service name in package.json
# Change "@aura-ai/backend-template" to "@aura-ai/backend-yourservice"

# Update service info in src/index.ts
# Change PORT, service name, and add your endpoints

# Add script to root package.json
# "dev:yourservice": "npm run dev -w apps/backend-yourservice"

# Run your service
npm run dev:yourservice
```

### Method 2: Manual Setup

See the detailed guide in [README.md](README.md#backend-developer-guide)

## 🎯 Service Requirements

Every backend service MUST include:

1. **Health Endpoint** (`/health`)
   ```typescript
   app.get('/health', (req, res) => {
       res.json({
           status: 'ok',
           service: 'yourservice',
           timestamp: new Date().toISOString()
       });
   });
   ```

2. **TypeScript Support**
   - All code should be written in TypeScript
   - Use proper type definitions

3. **CORS Configuration**
   ```typescript
   app.use(cors());
   ```

4. **Port Management**
   - Use environment variables: `process.env.PORT || 40XX`
   - Follow port allocation: 4001, 4002, 4003, 4004...

## 🔗 Integration Steps

### 1. Add Proxy to Frontend

Edit `apps/frontend/vite.config.ts`:

```typescript
proxy: {
    '/api/yourservice': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yourservice/, '')
    }
}
```

### 2. Update Frontend Dashboard

Edit `apps/frontend/src/App.tsx`:

```typescript
// Add to services state
const [services, setServices] = useState({
    finance: null,
    habit: null,
    health: null,
    yourservice: null  // Add this
});

// Add to endpoints array
{ name: 'yourservice', url: '/api/yourservice/health' }

// Add ServiceCard
<ServiceCard
    title="🎯 Your Service Name"
    status={services.yourservice}
    description="Brief description of your service"
/>
```

### 3. Add Run Script

Edit root `package.json`:

```json
"scripts": {
    "dev:yourservice": "npm run dev -w apps/backend-yourservice"
}
```

## 📋 Code Style

- Use TypeScript for all code
- Follow existing formatting conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Use async/await for asynchronous operations

## ✅ Testing Checklist

Before submitting your service:

- [ ] Service starts without errors
- [ ] Health endpoint returns proper JSON
- [ ] All endpoints are accessible
- [ ] CORS is properly configured
- [ ] Frontend dashboard shows service status
- [ ] TypeScript compiles without errors
- [ ] Environment variables are documented
- [ ] README/documentation is updated

## 🔄 Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/yourservice
   ```

2. **Develop Your Service**
   - Use the template or create from scratch
   - Test locally

3. **Test Integration**
   ```bash
   npm run dev  # Run all services
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add yourservice backend"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/yourservice
   ```

## 📦 Dependencies

You can add additional dependencies to your service:

```bash
cd apps/backend-yourservice
npm install <package-name>
```

Common useful packages:
- `mongoose` - MongoDB ODM
- `prisma` - Modern database toolkit
- `axios` - HTTP client
- `joi` - Data validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication

## 🐛 Debugging

### Check Service Status

```bash
# Check if service is running
curl http://localhost:40XX/health

# Check logs in terminal
npm run dev:yourservice
```

### Common Issues

**Port already in use:**
```bash
# Change PORT in .env or code
PORT=4005
```

**Module not found:**
```bash
# Reinstall dependencies
npm install
```

**TypeScript errors:**
```bash
# Check tsconfig.json
# Make sure all types are installed
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 💬 Questions?

If you have questions or need help:
1. Check existing services for examples
2. Review the README.md
3. Create an issue in the repository

## 🎉 Thank You!

Your contributions help make Aura AI better!
