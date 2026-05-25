# Lexie — Language Tutor Frontend

A minimal React + Vite + Tailwind frontend for the Lexie Language Tutor chatbot.

## Prerequisites

- Node.js 18+
- The [Lexie FastAPI backend](https://github.com/jayeshmotwani/lexie-backend) running locally on port 8000

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Default: VITE_API_BASE_URL=http://localhost:8000

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

Login with **admin / admin**.

## Deploying to EC2

See [`docs/ec2-deployment.md`](docs/ec2-deployment.md) for step-by-step instructions.
