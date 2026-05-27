# Lexie Frontend

React + Vite + Tailwind frontend for the Lexie Language Tutor chatbot.

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router v6](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

## Prerequisites

- Node.js 18+
- npm 9+
- [Lexie backend](https://github.com/jayeshmotwani/lexie-backend) running locally on port 8000

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/jayeshmotwani/lexie-frontend.git
cd lexie-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set the API base URL to point at your local backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

Log in with **admin / admin**.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Serve the production build locally |

## Project Structure

```
src/
├── components/   # Reusable UI components
├── context/      # React context providers
├── pages/        # Page-level components
├── services/     # Axios API service modules
├── App.jsx       # Root component and routing
└── main.jsx      # Application entry point
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the Lexie FastAPI backend |

> Variables must be prefixed with `VITE_` to be exposed to the browser bundle.
