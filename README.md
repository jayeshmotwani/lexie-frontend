# Lexie Frontend

React + Vite + Tailwind frontend for **Lexie**, an AI-powered language tutor chatbot. Users pick a target language, then have a guided conversation with an LLM tutor via a persistent, session-based chat interface.

## Tech Stack

- [React 18](https://react.dev/) (18.3.1)
- [Vite](https://vitejs.dev/) (5.3.1)
- [Tailwind CSS](https://tailwindcss.com/) (3.4.4)
- [React Router v6](https://reactrouter.com/) (6.23.1)
- [Axios](https://axios-http.com/) (1.6.8)

## Prerequisites

- Node.js 18+ (Node 20 used in production)
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

Register a new account at `/register`, then log in to start a session.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the Lexie FastAPI backend |

> Variables must be prefixed with `VITE_` to be exposed to the browser bundle.

In production, `VITE_API_BASE_URL` is set to `/api` (relative path) so requests are proxied through Nginx to the backend. See `.env.production`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Serve the production build locally |

## App Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Login page |
| `/register` | Public | User registration |
| `/home` | Protected | Language selection — pick a target language to start a new session. Includes a sidebar for accessing past sessions. |
| `/chat` | Protected | Chat interface with session sidebar |

Unauthenticated users hitting a protected route are redirected to `/`.

## Project Structure

```
src/
├── components/
│   ├── ChatBubble.jsx      # Individual message bubble
│   ├── LoadingDots.jsx     # Typing indicator
│   ├── ProtectedRoute.jsx  # Auth guard — redirects to / if not logged in
│   └── Sidebar.jsx         # Session list (ChatGPT-style) with relative timestamps
├── context/
│   └── AuthContext.jsx     # User state, login/logout/register, localStorage token storage
├── pages/
│   ├── ChatPage.jsx        # Main chat UI; manages sessions, messages, language
│   ├── HomePage.jsx        # Language picker (Spanish, French, German, and more)
│   ├── LoginPage.jsx       # Email + password login form
│   └── RegisterPage.jsx    # New user registration form
├── services/
│   ├── api.js              # Axios instance — Bearer token interceptor, silent 401 refresh, 30s timeout
│   ├── authService.js      # login / register / logout API calls
│   └── chatService.js      # Session CRUD and message API calls
├── App.jsx                 # Root component and route definitions
└── main.jsx                # Entry point — BrowserRouter + AuthProvider
```

## Authentication

The app uses JWT-based authentication. Tokens are stored in `localStorage`. The Axios instance in `services/api.js` automatically attaches the `access_token` to every request as a Bearer header. On a 401 response, it attempts a silent token refresh; if the refresh fails, it clears storage and redirects to the login page.

## Deployment

Pushes to `main` trigger the **Deploy to EC2** GitHub Actions workflow (`.github/workflows/deploy.yml`), which SSHs into the server and runs `deploy.sh`. That script pulls the latest code, runs `npm ci && npm run build`, copies `dist/` to `/var/www/html`, and reloads Nginx.

To deploy manually on the EC2 instance:

```bash
bash ~/lexie-frontend/deploy.sh
```

Required GitHub Actions secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.
