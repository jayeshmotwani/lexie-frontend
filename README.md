# Lexie — Language Tutor Frontend

A minimal React + Vite + Tailwind frontend for the Lexie Language Tutor chatbot.

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx      # Auth state (user object, login, logout)
├── pages/
│   ├── LoginPage.jsx        # / — login form
│   ├── HomePage.jsx         # /home — welcome + language picker
│   └── ChatPage.jsx         # /chat — protected chat interface
├── components/
│   ├── ProtectedRoute.jsx   # Redirects unauthenticated users to /
│   ├── ChatBubble.jsx       # Single message bubble
│   └── LoadingDots.jsx      # Animated "..." while bot replies
├── services/
│   ├── api.js               # Shared Axios instance (reads VITE_API_BASE_URL)
│   ├── authService.js       # login() — swap hardcoded check for real API here
│   └── chatService.js       # startSession() and sendMessage() calls to FastAPI
├── App.jsx                  # Route definitions
├── main.jsx                 # Entry point
└── index.css                # Tailwind directives + scrollbar styles
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# .env already contains:  VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

Login with **admin / admin** (hardcoded — see `src/services/authService.js`).

### Swapping to a real auth API

Open `src/services/authService.js` and replace the `login()` stub with:

```js
import api from './api'

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password })
  return data.user   // must return a user object
}
```

No other file needs to change.

---

## Deployment on EC2 (Nginx + systemd)

These steps assume:
- You have an EC2 instance (Ubuntu 22.04) already running **FastAPI on port 80**.
- Your EC2 key pair and SSH access are working.
- You have `EC2_PUBLIC_DNS` — something like `ec2-1-2-3-4.compute-1.amazonaws.com`.

---

### Step 1 — Build the React app locally

Point the build at your EC2 backend **before** building:

```bash
# In your local lexie-frontend directory:
echo "VITE_API_BASE_URL=http://<EC2_PUBLIC_DNS>:8000" > .env
npm run build
# Produces the dist/ folder
```

> **Gotcha:** `VITE_API_BASE_URL` is baked into the JS bundle at build time.
> If you change the backend URL later you must rebuild and redeploy `dist/`.

---

### Step 2 — Push the dist folder to GitHub

Option A — commit dist/ directly (simplest for a static site):

```bash
# Allow dist/ in git for deployment purposes
# Remove "dist/" from .gitignore first, then:
git add dist/
git commit -m "chore: add production build for deployment"
git push origin main
```

Option B — create a separate gh-pages branch (cleaner):

```bash
git subtree push --prefix dist origin gh-pages
```

---

### Step 3 — SSH into your EC2 instance

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_PUBLIC_DNS>
```

---

### Step 4 — Install Nginx

```bash
sudo apt update && sudo apt install -y nginx
```

---

### Step 5 — Deploy the React dist to Nginx web root

```bash
# Clone your repo (or pull latest if already cloned)
cd ~
git clone https://github.com/<your-user>/lexie-frontend.git
# OR if already cloned:
cd ~/lexie-frontend && git pull

# Copy the built files to Nginx's default web root
sudo cp -r ~/lexie-frontend/dist/* /var/www/html/
```

---

### Step 6 — Configure Nginx to serve the React app on port 80

Nginx's default config already serves `/var/www/html` on port 80.
You only need to add `try_files` so React Router deep links work:

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace the `server` block with:

```nginx
server {
    listen 80;
    server_name _;          # catch-all; replace with your domain if you have one

    root /var/www/html;
    index index.html;

    # Send every unknown path to index.html (React Router handles routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Test and reload:

```bash
sudo nginx -t           # must say "syntax is ok"
sudo systemctl reload nginx
```

---

### Step 7 — Move FastAPI to port 8000

Find your FastAPI systemd service file (likely `/etc/systemd/system/lexie-api.service`):

```bash
sudo nano /etc/systemd/system/lexie-api.service
```

Change the `ExecStart` line to bind on port 8000:

```ini
[Unit]
Description=Lexie FastAPI backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/lexie-backend
ExecStart=/home/ubuntu/lexie-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart lexie-api
sudo systemctl enable lexie-api     # auto-start on reboot
```

> **CORS gotcha:** In your FastAPI app, make sure `allow_origins` includes the EC2
> frontend URL. The safest setting while testing:
>
> ```python
> from fastapi.middleware.cors import CORSMiddleware
>
> app.add_middleware(
>     CORSMiddleware,
>     allow_origins=["http://<EC2_PUBLIC_DNS>"],   # or ["*"] while testing
>     allow_credentials=True,
>     allow_methods=["*"],
>     allow_headers=["*"],
> )
> ```
> After adding/changing the middleware, restart the service again.

---

### Step 8 — Open port 8000 in the EC2 Security Group

1. AWS Console → EC2 → your instance → **Security** tab → click the Security Group link.
2. **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - Type: **Custom TCP**
   - Port range: **8000**
   - Source: **0.0.0.0/0** (or restrict to your IP for safety)
3. **Save rules**.

Port 80 should already be open (Nginx). Confirm it is listed too.

---

### Step 9 — Enable Nginx auto-start on reboot

```bash
sudo systemctl enable nginx
```

Both services are now set to auto-start:
- `nginx` → serves the React app on port 80
- `lexie-api` → runs FastAPI on port 8000

---

### Step 10 — Verify everything is working

```bash
# On EC2: check service statuses
sudo systemctl status nginx
sudo systemctl status lexie-api

# Check FastAPI is listening on 8000
curl http://localhost:8000/docs     # should return HTML

# Check Nginx is serving on port 80
curl http://localhost/              # should return the React index.html
```

From your **local machine**:

```
http://<EC2_PUBLIC_DNS>/            → React login page
http://<EC2_PUBLIC_DNS>:8000/docs   → FastAPI Swagger UI
```

Full flow test:
1. Open `http://<EC2_PUBLIC_DNS>/` in a browser.
2. Log in with `admin / admin`.
3. Pick a language on the Home page.
4. Click **Start Learning** — the Chat page loads and `POST /start-session` fires.
5. Send a message — `POST /chat` fires and the bot replies.

---

### Common Issues

| Symptom | Fix |
|---|---|
| Chat page shows "Could not connect to Lexie" | FastAPI not running, CORS not configured, or port 8000 not open in SG |
| React deep links (e.g. `/chat`) return 404 | Nginx missing `try_files` — re-check Step 6 |
| Login works but API calls blocked in browser | CORS `allow_origins` does not include the frontend origin |
| After reboot, services are down | Run `sudo systemctl enable nginx` and `sudo systemctl enable lexie-api` |
| `VITE_API_BASE_URL` still points to localhost | Rebuild with the correct `.env` and re-copy `dist/` |
