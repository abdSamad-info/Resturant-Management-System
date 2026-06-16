# Environment & System Set Up

Follow these rules to run the system in standard server configurations.

## ⚙️ Prerequisites
- **Node.js**: `v18+` or higher.
- **PNPM**: Installed globally (`npm install -g pnpm`).
- **Local MongoDB**: Standard MongoDB daemon running locally on port `27017` (not required in the workspace as we utilize an automatic, memory-backed robust JSON persistence layer).

## 🚀 Workspace Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment fields**:
   Copy `.env.example` into a local `.env` and assign secrets:
   ```env
   PORT=3000
   NODE_ENV=development
   CACHE_TTL=360
   ```

3. **Boot dev servers with hot middleware reloading**:
   ```bash
   pnpm run dev
   ```

## 🐳 Container Docker Deployments
To package and deploy this system to container fleets such as Cloud Run, use the bundled multi-stage script:
```bash
docker build -t bistro-console .
docker run -p 3000:3000 bistro-console
```
The Express instance automatically proxies traffic to Vite elements in development and serves statically compiled assets from `/dist` in production, eliminating multi-origin CORS routing issues.
