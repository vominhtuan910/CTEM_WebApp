# CTEM WebApp - Backend

This is the backend service for the CTEM WebApp, which provides APIs for asset management, vulnerability scanning, and integration with DefectDojo.

## Prerequisites

- Node.js (v14+)
- Docker
- Docker Compose
- npm (v6+)

## Database Setup

The application is configured to automatically manage the PostgreSQL database using Docker Compose:

1. **Automatic Database Management**:

   - When you start the server with `npm start` or `npm run dev`, the PostgreSQL database container will automatically start
   - When you stop the server (Ctrl+C), the database container will automatically stop
   - No manual setup required!

2. **Manual Database Control**:

   ```bash
   # Start PostgreSQL container manually
   npm run db:start

   # Stop PostgreSQL container manually
   npm run db:stop

   # Direct Docker Compose commands
   npm run docker:up       # Start containers
   npm run docker:down     # Stop and remove containers
   npm run docker:build    # Rebuild containers
   npm run docker:logs     # View PostgreSQL logs
   npm run docker:restart  # Restart PostgreSQL
   ```

3. **Custom Database Configuration**:
   - Default configuration is specified in `docker-compose.yml` and `docker/postgres/Dockerfile`
   - PostgreSQL config can be customized in `docker/postgres/postgresql.conf`
   - Database initialization scripts are in `docker/postgres/init-scripts/`

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the Docker containers:

   ```bash
   npm run docker:build
   ```

3. Initialize database (first time setup):

   ```bash
   npm run docker:up
   npm run db:reset
   npm run db:seed
   ```

4. Start the server (will also start the database):
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server (and database)
- `npm run dev` - Start the development server with hot reloading (and database)
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Reset the database (drop and recreate all tables)
- `npm run db:migrate` - Run any pending migrations
- `npm run db:start` - Start the database container manually
- `npm run db:stop` - Stop the database container manually
- `npm run docker:build` - Build Docker containers
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop and remove Docker containers
- `npm run docker:logs` - View PostgreSQL logs
- `npm run docker:restart` - Restart PostgreSQL container

## Database Management

The application uses Sequelize as an ORM and manages database schema through model definitions. When you start the server in development mode, it will automatically sync the schema with your database.

### Creating Migrations

```bash
npx sequelize-cli migration:generate --name migration-name
```

### Running Migrations

```bash
npm run db:migrate
```

## DefectDojo Integration

The application supports integration with DefectDojo for vulnerability management. To configure:

1. Configure DefectDojo settings via the API or directly in the database
2. Map vulnerabilities between the CTEM WebApp and DefectDojo using the defined models

## API Documentation

API endpoints are available at:

- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get specific asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/scan/start` - Start a new scan
- `GET /api/scan/latest` - Get latest scan results

## Docker Architecture

The Docker setup includes:

- **PostgreSQL** - Database for storing assets, vulnerabilities, and other data
- **Custom Configuration** - PostgreSQL configuration optimized for the application
- **Volume Persistence** - Data is stored in Docker volumes for persistence
- **Health Checks** - Container health monitoring to ensure database availability
