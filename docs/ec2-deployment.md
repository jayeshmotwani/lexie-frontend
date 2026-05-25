# Deploying Lexie on EC2 (Nginx + systemd)

## Assumptions

- EC2 instance running **Ubuntu 22.04**
- FastAPI backend is already running on the instance (currently on port 80)
- You have SSH access via a `.pem` key pair
- Replace `<EC2_PUBLIC_DNS>` throughout with your actual value, e.g. `ec2-1-2-3-4.compute-1.amazonaws.com`

---

## Step 1 — Build the React app locally

Set the API URL to your EC2 backend **before** building, then run the build:

```bash
echo "VITE_API_BASE_URL=http://<EC2_PUBLIC_DNS>:8000" > .env
npm run build
```

This produces a `dist/` folder with the compiled static files.

> **Important:** `VITE_API_BASE_URL` is baked into the JS bundle at build time.
> If you ever change the backend URL, you must rebuild and redeploy `dist/`.

---

## Step 2 — Push the dist folder to GitHub

Option A — commit `dist/` directly (simplest):

```bash
# Remove "dist/" from .gitignore first, then:
git add dist/
git commit -m "chore: add production build"
git push origin main
```

Option B — push to a separate `gh-pages` branch (cleaner):

```bash
git subtree push --prefix dist origin gh-pages
```

---

## Step 3 — SSH into your EC2 instance

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_PUBLIC_DNS>
```

---

## Step 4 — Install Nginx

```bash
sudo apt update && sudo apt install -y nginx
```

---

## Step 5 — Copy the React build to the Nginx web root

```bash
# Clone the repo (or pull if already cloned)
cd ~
git clone https://github.com/<your-user>/lexie-frontend.git
# OR:
cd ~/lexie-frontend && git pull

# Copy built files to Nginx's web root
sudo cp -r ~/lexie-frontend/dist/* /var/www/html/
```

---

## Step 6 — Configure Nginx to serve the React app on port 80

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace the entire `server` block with:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    # Required for React Router — sends all unknown paths to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Test the config and reload:

```bash
sudo nginx -t             # must print "syntax is ok"
sudo systemctl reload nginx
```

---

## Step 7 — Move FastAPI to port 8000

Open your FastAPI systemd service file:

```bash
sudo nano /etc/systemd/system/lexie-api.service
```

Update it to look like this (change `WorkingDirectory` and `ExecStart` to match your paths):

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

Apply the changes:

```bash
sudo systemctl daemon-reload
sudo systemctl restart lexie-api
sudo systemctl enable lexie-api     # auto-start on reboot
```

> **CORS:** After moving to port 8000, update `allow_origins` in your FastAPI app to
> include the frontend's URL. While testing, you can use `"*"`:
>
> ```python
> from fastapi.middleware.cors import CORSMiddleware
>
> app.add_middleware(
>     CORSMiddleware,
>     allow_origins=["http://<EC2_PUBLIC_DNS>"],  # or ["*"] while testing
>     allow_credentials=True,
>     allow_methods=["*"],
>     allow_headers=["*"],
> )
> ```
>
> Restart the service after any change to this file.

---

## Step 8 — Open port 8000 in the EC2 Security Group

1. AWS Console → **EC2** → your instance → **Security** tab → click the Security Group link.
2. **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - Type: **Custom TCP**
   - Port range: **8000**
   - Source: **0.0.0.0/0** (or lock it to your IP)
3. **Save rules**.

Make sure port **80** is also open (it should be already).

---

## Step 9 — Enable auto-start on reboot

```bash
sudo systemctl enable nginx
sudo systemctl enable lexie-api
```

Both services will now start automatically after a reboot.

---

## Step 10 — Verify

Run these on the EC2 instance:

```bash
sudo systemctl status nginx       # should show "active (running)"
sudo systemctl status lexie-api   # should show "active (running)"

curl http://localhost:8000/docs   # FastAPI Swagger UI HTML
curl http://localhost/            # React index.html
```

From your local browser:

| URL | Expected result |
|---|---|
| `http://<EC2_PUBLIC_DNS>/` | Lexie login page |
| `http://<EC2_PUBLIC_DNS>:8000/docs` | FastAPI Swagger UI |

**Full flow test:**
1. Open `http://<EC2_PUBLIC_DNS>/` in a browser.
2. Log in with `admin / admin`.
3. Select a language on the Home page and click **Start Learning**.
4. Send a message in the chat — the bot should reply.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Chat page shows "Could not connect to Lexie" | FastAPI not running, CORS misconfigured, or port 8000 not open in Security Group |
| Direct URL like `/chat` returns Nginx 404 | `try_files` missing in Nginx config — redo Step 6 |
| API calls blocked in browser (CORS error) | `allow_origins` in FastAPI doesn't include `http://<EC2_PUBLIC_DNS>` |
| Services down after reboot | Re-run `sudo systemctl enable nginx` and `sudo systemctl enable lexie-api` |
| App still calling localhost after deployment | `VITE_API_BASE_URL` was not set before building — redo Steps 1–5 |
