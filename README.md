<div align="center">

# 📚 SleepyStudies

### A Full-Stack, Production-Deployed Notes Sharing Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sleepystudies.vercel.app-blue?style=for-the-badge&logo=vercel)](https://sleepystudies.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://sleepystudies-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org)

**SleepyStudies** is a production-ready, full-stack web application for sharing and discovering academic study notes. It features a secure PDF viewer, dynamic content management, user analytics tracking, admin-gated uploads, and on-demand document watermarking — all deployed to the cloud with zero configuration for end users.

</div>

---

## 🌐 Live Application

| Layer | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [sleepystudies.vercel.app](https://sleepystudies.vercel.app) |
| **Backend API** | Render | [sleepystudies-api.onrender.com](https://sleepystudies-api.onrender.com) |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2 | React framework with App Router, SSR & SSG |
| **TypeScript** | 5.x | Type-safe component and utility development |
| **Tailwind CSS** | 4.x | Utility-first responsive styling system |
| **React** | 19.x | UI component library |
| **Framer Motion** | 12.x | Micro-animations and page transitions |
| **Lucide React** | 1.x | Icon system |
| **shadcn/ui** | 4.x | Accessible, unstyled UI components |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | JavaScript runtime environment |
| **Express.js** | 5.x | REST API routing and middleware |
| **pdf-lib** | 1.17 | Server-side dynamic PDF watermark injection |
| **@pdfsmaller/pdf-decrypt** | 1.x | Zero-binary pure-JS AES PDF decryption |
| **multer** | 2.x | Multipart file upload parsing |
| **fs-extra** | 11.x | Extended filesystem operations |
| **uuid** | 14.x | Unique viewer session identity tokens |
| **dotenv** | 17.x | Secure environment variable management |

### Infrastructure & DevOps
| Tool | Purpose |
|---|---|
| **Vercel** | Frontend CDN deployment with automatic CI/CD on `git push` |
| **Render** | Backend cloud hosting with persistent disk storage |
| **Git / GitHub** | Version control, source code management |

---

## ✨ Key Features & Engineering Highlights

### 🔒 Secure PDF Delivery Pipeline
- **On-demand watermarking**: Dynamically injects personalized watermarks (student name, viewer ID, date) directly into PDF binary streams using `pdf-lib` before serving downloads — no pre-processed files needed.
- **AES PDF Decryption**: Pure JavaScript decryption pipeline (`@pdfsmaller/pdf-decrypt`) removes PDF encryption locks before processing — zero native binary dependencies, fully compatible with cloud environments.
- **Rotation-aware watermarks**: Automatically detects page rotation (`0°`, `90°`, `180°`, `270°`) and adjusts watermark coordinates accordingly so the text always appears horizontally at the bottom of each page.
- **Content security**: In-browser PDF viewer sandboxes all pages — disables right-click, drag, and keyboard shortcuts to prevent unauthorized saving.

### 📊 Real-Time Analytics & Tracking
- **View & download logging**: Every view and download is anonymously logged with a viewer ID, timestamp, IP, and user agent.
- **Persistent analytics baseline**: Statistics survive server restarts via a `baseline.json` config pattern — Render ephemeral file system deployments maintain accurate running totals.
- **Production data sync script**: CLI tool (`scripts/sync-production.js`) to merge remote analytics JSON data with local filesystem — enables offline data auditing.

### ⚡ Performance Optimizations
- **On-demand image rendering**: PDF pages are converted to PNG on first request using `pdftoppm` and cached locally — subsequent requests are served instantly.
- **Background prefetch**: Frontend prefetches the next 3 PDF pages in the background while the user reads the current page — eliminates wait time between page flips.
- **Optimized image resolution**: Pages rendered at `750px` width using `-scale-to-x 750` flag — reduces payload by ~5x vs default resolution with no perceived quality loss.
- **Encrypted image cache**: Generated page images are AES-encrypted at rest on disk, preventing direct file system access to study materials.

### 🏗️ Dynamic Content Management
- **Folder-based CMS**: Backend dynamically scans `pdfs/` directory structure at runtime — no database required. Adding a new PDF note is as simple as dropping a file in a folder.
- **Admin upload portal**: Authenticated admin dashboard for uploading notes directly from the browser with drag-and-drop, real-time progress tracking, and automatic semester/subject catalog updates.
- **Passcode-gated API**: Upload endpoint protected by `ADMIN_PASSCODE` environment variable with secure session caching and automatic invalidation on `401` responses.

### 🌓 Responsive UI/UX
- **Dark / Light mode**: Full theme switching with system preference detection.
- **Mobile-first design**: All views — from subject grid to PDF viewer — are fully responsive across mobile, tablet, and desktop.
- **Name-gated viewer**: Students register a one-time display name before viewing notes — used to personalize watermarks and link analytics data.
- **Live search**: Instant client-side filtering across all semesters and subjects with real-time result highlighting.

---

## 🏗️ Architecture Overview

```
SleepyStudies/
├── frontend/                      # Next.js 16 App Router client
│   ├── app/
│   │   ├── page.tsx               # Home page — subject catalog grid
│   │   ├── subject/[semester]/[slug]/  # Subject notes listing
│   │   ├── view/[semester]/[subject]/[file]/  # In-browser PDF viewer
│   │   └── admin/                 # Admin upload dashboard
│   ├── components/
│   │   ├── notes/                 # PDFViewer, NoteCard, DownloadButton
│   │   ├── home/                  # Hero, Stats, SubjectGrid
│   │   ├── layout/                # Navbar, Footer
│   │   └── viewer/                # ViewerGate (name modal)
│   └── utils/
│       └── api.ts                 # Centralized API base URL config
│
└── backend/                       # Express.js REST API server
    ├── server.js                  # Entry point — on-demand image serving
    ├── routes/
    │   ├── notes.js               # GET /notes — dynamic catalog scanner
    │   ├── view.js                # GET /view — page count & metadata
    │   ├── download.js            # GET /download — decrypt + watermark + serve
    │   ├── upload.js              # POST /upload — admin file upload
    │   ├── sync.js                # POST /api/sync — analytics merge API
    │   └── search.js              # GET /search — full-text note search
    ├── utils/
    │   ├── pdfDecryptor.js        # AES PDF decryption pipeline
    │   ├── imageCrypto.js         # AES image encryption/decryption
    │   ├── titleHelper.js         # Note title formatting logic
    │   └── pdfHelper.js           # PDF page count utility
    ├── services/
    │   ├── viewerService.js       # Viewer session identity management
    │   ├── viewService.js         # View event logging
    │   ├── downloadService.js     # Download event logging
    │   └── searchService.js       # Search index service
    ├── pdfs/                      # Source PDF catalog (git-tracked)
    ├── data/                      # Runtime JSON logs (git-ignored)
    └── config/
        └── baseline.json          # Persistent analytics baseline
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+
- **Poppler** (for server-side PDF → image rendering): `brew install poppler` (macOS)

### 1. Clone the Repository
```bash
git clone https://github.com/priyanshu2104/sleepystudies.git
cd sleepystudies
```

### 2. Configure Backend Environment
Create a `backend/.env` file:
```env
ADMIN_PASSCODE=your_secure_admin_password
PDF_SECRET_PASSWORD=your_pdf_encryption_password
ADMIN_LOGS_KEY=your_analytics_sync_secret
```

### 3. Run Backend Server
```bash
cd backend
npm install
npm run dev
# → Running at http://localhost:5001
```

### 4. Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# → Running at http://localhost:3000
```

---

## 🌐 Production Deployment

### Frontend → Vercel
```bash
# Automatic on every git push to main via GitHub integration
# Set environment variable on Vercel dashboard:
NEXT_PUBLIC_API_URL=https://sleepystudies-api.onrender.com
```

### Backend → Render
1. Create a **Node Web Service** on [Render](https://render.com).
2. Attach a **Persistent Disk** mounted at your `backend/data` directory to preserve analytics logs across restarts.
3. Set the following environment variables on Render:
   ```
   ADMIN_PASSCODE=your_secure_admin_password
   PDF_SECRET_PASSWORD=your_pdf_encryption_password
   ADMIN_LOGS_KEY=your_analytics_sync_secret
   NODE_ENV=production
   PORT=10000
   ```
4. Set **Start Command**: `node server.js`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notes` | List all semesters and subjects dynamically |
| `GET` | `/notes/:semester/:subject` | List all PDFs in a subject with view/download stats |
| `GET` | `/notes/overall-stats` | Global analytics — views, downloads, subjects, notes |
| `GET` | `/view/:semester/:folder/:file` | Get PDF page count (pre-viewer metadata) |
| `GET` | `/images/*` | Serve encrypted page images (auto-decrypt + auto-render) |
| `GET` | `/download/:semester/:folder/:file` | Decrypt, watermark, and stream PDF for download |
| `POST` | `/upload` | Upload a new PDF note (requires `x-admin-passcode` header) |
| `POST` | `/view/record` | Log a view event |
| `GET` | `/search?q=query` | Full-text search across all notes |
| `POST` | `/api/sync` | Sync analytics data from production to local |

---

## 🔐 Security Design

| Concern | Implementation |
|---|---|
| **Content Protection** | PDF viewer disables right-click, keyboard shortcuts, drag |
| **Download Watermarking** | Each download injects student name + ID + date into PDF binary |
| **PDF Encryption** | All catalog PDFs are AES-256 encrypted at rest |
| **Image Cache Encryption** | Page renders stored as AES-encrypted blobs on disk |
| **Admin Authentication** | Upload API requires `ADMIN_PASSCODE` header; auto-clears on 401 |
| **Environment Secrets** | All credentials via `.env` — never committed to version control |

---

## 📁 What's Tracked in Git

| Path | Committed? | Reason |
|---|---|---|
| `backend/pdfs/` | ✅ Yes | Source notes catalog |
| `backend/data/` | ❌ No | Runtime analytics logs |
| `backend/images/` | ❌ No | Auto-generated image cache |
| `backend/.env` | ❌ No | Secrets |
| `frontend/node_modules/` | ❌ No | Dependencies |
| `frontend/.next/` | ❌ No | Build artifacts |

---

## 🗺️ Roadmap

- [ ] User authentication (NextAuth / Firebase)
- [ ] AI-powered semantic note search
- [ ] Multi-semester support for additional years
- [ ] Note rating and bookmarking system
- [ ] Mobile PWA support

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ by **[Priyanshu Shekhar](https://www.linkedin.com/in/priyanshushekhar04/)**

*Computer Science Student | Full-Stack Developer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/priyanshushekhar04/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/priyanshu2104)

</div>
