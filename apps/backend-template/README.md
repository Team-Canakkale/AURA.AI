# Backend Service Template

This is a template directory for creating new backend services.

## Quick Start

1. Copy this template:
```bash
cp -r apps/backend-template apps/backend-yourservice
```

2. Update `package.json` with your service name

3. Update `src/index.ts` with your service logic

4. Add script to root `package.json`:
```json
"dev:yourservice": "npm run dev -w apps/backend-yourservice"
```

5. Run your service:
```bash
npm run dev:yourservice
```

## Files Included

- `package.json` - Pre-configured with all necessary dependencies
- `tsconfig.json` - TypeScript configuration
- `src/index.ts` - Express server template with health endpoint
- `.env.example` - Environment variables example

## Next Steps

1. Add your API routes
2. Update vite.config.ts proxy
3. Update frontend to display your service
4. Test and deploy!
