# CTEM WebApp

Cyber Threat and Exposure Management Web Application

## Project Structure

This project is organized as a monorepo containing both frontend and backend code:

```
CTEM_WebApp/
├── frontend/       # React frontend application
├── backend/        # Express.js backend server
└── package.json    # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

### Development

Start both frontend and backend development servers:

```bash
npm start
```

Or run them separately:

```bash
# Frontend only
npm run start:frontend

# Backend only
npm run start:backend
```

### Building for Production

Build the frontend application:

```bash
npm run build
```

## Backend Services

The backend provides the following services:

- Network scanning (Nmap integration)
- Port scanning
- Vulnerability detection
- Asset management API

## Frontend Features

- Asset management dashboard
- Vulnerability reporting
- Security metrics and visualization
- Responsive Material UI interface
