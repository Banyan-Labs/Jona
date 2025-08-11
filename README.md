# Job Scraper

A full-stack web application that automates the process of finding and organizing job postings using modern developer tools. This project was containerized using Docker for consistent deployment and local development, and includes a server built with FastAPI and a client using Next.js.

---

## 🚀 Features

- **FastAPI Backend** with Selenium-based job scraping
- **Next.js Frontend** with dark mode and tabbed navigation
- **Dockerized Architecture** with Docker Compose
- **Supabase Integration** for backend data storage
- **n8n** automation (currently being phased out)

---

## 🐳 Docker Setup

### Prerequisites:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) enabled (if using Windows)

### Local Development:
From the root of the project:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
- n8n: [http://localhost:5678](http://localhost:5678)

### Troubleshooting:
Make sure your `.env` file exists in `server/`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```
Also ensure `.venv/` and `node_modules/` are listed in `.dockerignore` and `.gitignore`.

---

## 📁 Project Structure

```
jobScraper/
├── client/                  # Next.js frontend
│   └── Dockerfile.dev       # Docker config for dev
├── server/                  # FastAPI backend
│   ├── app/                 # Core logic, endpoints, db, and scraping
│   ├── Dockerfile           # Docker config for backend
│   └── .dockerignore
├── docker-compose.yml       # Orchestrates multi-container setup
├── .gitignore
└── README.md
```

---
## ⚙️ Environment Variables

To run this stack smoothly, configure your `.env` files with the following variables:

---

### 🖥️ Frontend (Next.js)

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Base URL of your Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for Supabase client-side interactions |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Default publishable key for Supabase usage |
| `API_KEY` | Public-facing API key for client services |
| `PUBLISHBALE_KEY` | Redundant publishable key |
| `SCRAPER_SECRET_TOKEN` | Token used for client-side scraper validation |

---

### 🔧 Backend (FastAPI)

| Key | Description |
|-----|-------------|
| `SUPABASE_URL` | Same as frontend Supabase URL |
| `SUPABASE_ANON_KEY` | Same Supabase public key used server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-level key for privileged access |
| `SUPABASE_DATABASE` | PostgreSQL connection string to Supabase |
| `SUPABASE_JWT_SECRET` | JWT secret for Supabase auth flows |
| `API_KEY` | Server-side secret API key |
| `PUBLISHBALE_KEY` | Publishable key repeated here for backend usage |
| `SCRAPER_SECRET_TOKEN` | Token used to verify scraper jobs |
| `FIRECRAWL_API_KEY` | API key to enable Firecrawl integration |
| `driver_path` | Local path to the ChromeDriver for automation tasks |

---

### 🔄 n8n Automation

| Key | Description |
|-----|-------------|
| `N8N_BASIC_AUTH_ACTIVE` | Enables basic auth in n8n |
| `N8N_BASIC_AUTH_USER` | Admin username |
| `N8N_BASIC_AUTH_PASSWORD` | Admin password |
| `N8N_RUNNERS_ENABLED` | Toggle for enabling runner mode |
| `N8N_HOST` | Host address for n8n |
| `N8N_PORT` | Port number for n8n |
| `N8N_PROTOCOL` | HTTP/HTTPS protocol for n8n |
| `WEBHOOK_URL` | Webhook base URL (local by default) |

---

> 🔐 **Tip**: Avoid hardcoding sensitive values into public repos. Use `.env.local`, Docker secrets, or a secure vault.


---
## 🔗 Access the Stack

Once your services are running, you can access them locally via the following URLs:

| Service              | URL                            | Description                              |
|----------------------|--------------------------------|------------------------------------------|
| Frontend (Next.js)   | [http://localhost:3000](http://localhost:3000) | User interface of the app               |
| Backend (FastAPI)    | [http://localhost:8000](http://localhost:8000) | API layer handling business logic       |
| n8n Automation       | [http://localhost:5678](http://localhost:5678) | Visual workflow automation              |
| OpenAI Proxy (optional) | [http://localhost:8002](http://localhost:8002) | Intermediary service for OpenAI usage   |

> **Note**: These ports are based on default settings. Update the `docker-compose.yml` file or your `.env` configuration if your stack uses custom ports.

## ✅ Current Status
- [x] Docker containerization complete
- [x] Environment securely configured
- [x] Bugs removed from `main.py`
- [x] `node_modules` and `.venv` excluded from builds
- [ ] Replace n8n with open-source alternative (in progress)

---

## 🧪 To Do
- Implement job application tracker UI
- Automate job scraping on a schedule
- Finalize replacement for n8n workflows

---

## 🖼️ Sample Screenshot
Add a screenshot here showing the running frontend and backend together in your browser.

---

## 🤝 Contributors
- Shanna Noe
- Samantha Pomeroy
- Banyan Labs Internship Team

---

## 📜 License
MIT (if applicable)
