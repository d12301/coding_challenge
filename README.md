# Coding Challenge

This repository contains both the frontend and backend code for the health insurance buy application.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## How to Start

### 1. Backend Server

To start the backend server, navigate to the `backend` directory, install the dependencies (if not already done), start the required database via Docker, and then run the development server.

```bash
cd backend
npm install
docker compose up -d
npm run start:dev
```

### 2. Frontend Server

To start the frontend application, open a new terminal, navigate to the `health-insurance-buy` directory, install the dependencies (if not already done), and run the development server.

```bash
cd health-insurance-buy
npm install
npm run dev
```

Once both servers are running, you can access the frontend application in your browser (typically at `http://localhost:3000`).