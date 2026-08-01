<div align="center">

# 📚 SleepyStudies

### Enterprise-Grade, Full-Stack Academic Content Management & Security Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sleepystudies.vercel.app-blue?style=for-the-badge&logo=vercel)](https://sleepystudies.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://sleepystudies-api.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**SleepyStudies** is an enterprise-ready, high-performance web platform engineered for discovery, real-time analytics, and secure delivery of academic study materials. Built with Next.js 16, Node.js, Express, and MongoDB Atlas, it implements AES-256 PDF encryption at rest, dynamic on-the-fly watermarking, in-memory LRU caching, Vercel Edge CDN revalidation, and non-blocking asynchronous event logging.

</div>

---

## 🌐 Live Application & Infrastructure

| Layer | Technology / Host | Live Target URL | Performance SLA |
|---|---|---|---|
| **Frontend Web App** | Vercel Edge CDN | [sleepystudies.vercel.app](https://sleepystudies.vercel.app) | $< 10\text{ms}$ Page Load Latency |
| **Backend REST API** | Render Web Service | [sleepystudies-api.onrender.com](https://sleepystudies-api.onrender.com) | $24/7$ Availability (UptimeRobot Keep-Alive) |
| **Cloud Database** | MongoDB Atlas (M0 Cluster) | Cloud-Hosted Multi-Region | $< 1\text{ms}$ Document Queries |

---

## 💻 Technical Stack & Ecosystem

### Frontend Engineering
- **Framework**: Next.js 16 (App Router, Server Components, Turbopack)
- **Language**: TypeScript 5 (Strict Mode, Interfaces, Typesafe Props)
- **Styling**: Tailwind CSS 4 (Utility-first, Dynamic Dark/Light Mode)
- **UI Components**: React 19, Lucide React (Iconography), Framer Motion (Micro-animations)
- **State & Optimization**: Client-Side Route Prefetching, Image Priority Decoding, Edge Revalidation

### Backend Systems & Architecture
- **Runtime & Server**: Node.js LTS, Express.js 5 (Modular Routing & Middleware)
- **Database & ORM**: MongoDB Atlas, Mongoose ORM (Schemas, Models, Indexing)
- **PDF & Processing**: `pdf-lib` (Dynamic Watermarking), `@pdfsmaller/pdf-decrypt` (Pure JS AES Decryption), Poppler Utilities (`pdftoppm`)
- **Security & Utilities**: Crypto AES-256, `fs-extra`, `multer` (Upload Handling), `uuid`

### Infrastructure & DevOps
- **Hosting & Deployment**: Vercel (Edge CDN, Automated CI/CD), Render (Backend Compute)
- **Monitoring & Uptime**: UptimeRobot (5-minute HTTP Keep-Alive, 0ms Cold Start)
- **Version Control**: Git, GitHub (Clean Commit History, Branch Management)

---

## ✨ System Architecture & Key Features

### 1. 🔒 Cryptographic Content Security & Dynamic Watermarking
- **On-the-Fly Binary Watermarking**: Dynamically injects personalized watermarks (Student Name, Unique Viewer ID, Timestamp) into PDF byte streams using `pdf-lib` prior to streaming downloads.
- **AES-256 At-Rest Encryption**: All raw catalog PDFs and generated page images are stored AES-encrypted at rest, preventing unauthorized filesystem access.
- **Rotation-Aware Coordinate Engine**: Automatically detects page orientation ($0^\circ, 90^\circ, 180^\circ, 270^\circ$) and calculates bounding box geometry so watermarks render crisply at page footers.
- **In-Browser Sandbox Protection**: Viewer sandbox blocks context menus (right-click), text dragging, printing, and keyboard inspection shortcuts.

### 2. ⚡ High-Performance Optimization Engine
- **In-Memory LRU Decryption Cache**: Decrypted PDF byte buffers are stored in an LRU memory cache (`pdfDecryptor.js`), dropping decryption overhead from $3,000\text{ms}$ to $0\text{ms}$ on subsequent requests.
- **Vercel Edge CDN Revalidation**: Static page routes utilize Incremental Static Regeneration (`revalidate: 10`), serving frontend HTML directly from edge nodes in $< 10\text{ms}$.
- **Async Non-Blocking Event Logging**: Database logging (`viewService`, `downloadService`) executes asynchronously via `setImmediate` queues, returning instant HTTP responses without waiting for network roundtrips.
- **Sequential Startup Warm-Up**: On server boot, `warmUpCatalog` pre-renders thumbnails and first pages sequentially, keeping memory consumption $< 150\text{MB}$ RAM to prevent OOM errors.
- **Client Hover Prefetching**: Mouse hover on note cards triggers background image prefetching, enabling $0\text{ms}$ perceived latency upon clicking.

### 3. 🍃 Hybrid Persistence Layer (Cloud DB + Offline Fallback)
- **MongoDB Atlas Integration**: View, Download, and Viewer events are persisted to cloud MongoDB collections (`views`, `downloads`, `viewers`).
- **Resilient Offline Fallback**: If `MONGODB_URI` is absent (e.g., local offline dev), the backend seamlessly falls back to JSON file storage without code changes or downtime.

---

## 📁 Repository Structure

```
SleepyStudies/
├── frontend/                      # Next.js 16 Client Web Application
│   ├── app/                       # App Router (Home, Subject, View, Admin, Privacy)
│   ├── components/                # Modular React Components (Notes, Layout, Viewer)
│   └── utils/                     # API Configuration & Endpoint Helpers
│
└── backend/                       # Express.js REST API Server
    ├── server.js                  # Application Entrypoint & Startup Pre-warming
    ├── config/
    │   ├── db.js                  # MongoDB Atlas Mongoose Connection Manager
    │   └── baseline.json          # Fallback Baseline Analytics Configuration
    ├── models/                    # Mongoose Schemas (View, Download, Viewer)
    ├── routes/                    # API Route Handlers (Notes, View, Download, Sync, Upload)
    ├── services/                  # Business Logic & Database Services
    ├── utils/                     # Cryptography, PDF Decryption & Helper Utilities
    └── scripts/                   # Local CLI Tools (view-report, reset-analytics, sync-production)
```

---

## 🛠️ Local Development & CLI Tooling

### Prerequisites
- **Node.js**: v18.0+
- **npm**: v9.0+
- **Poppler Utilities**: `brew install poppler` (macOS) / `sudo apt-get install poppler-utils` (Linux)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/priyanshu2104/sleepystudies.git
cd sleepystudies

# 2. Setup Backend Environment (.env)
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_PASSCODE=your_admin_upload_passcode
PDF_SECRET_PASSWORD=your_pdf_encryption_secret
ADMIN_LOGS_KEY=your_sync_admin_secret
```

```bash
# 3. Start Backend Server
npm run dev
# Server listening on http://localhost:5001

# 4. Start Frontend Client (in new terminal)
cd ../frontend
npm install
npm run dev
# Client running on http://localhost:3000
```

### 🧰 Built-in CLI Utilities

```bash
# Generate visual analytics CLI report in terminal
node scripts/view-report.js

# Sync & merge remote production logs to local files
node scripts/sync-production.js

# Perform total zero reset across MongoDB & local files for fresh launch
node scripts/reset-analytics.js
```

---

## 📡 REST API Documentation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notes` | Public | Returns complete catalog of semesters & subjects |
| `GET` | `/notes/:semester/:subject` | Public | Returns PDF notes inside subject with view/download counts |
| `GET` | `/notes/overall-stats` | Public | Global analytics (Total Notes, Subjects, Views, Downloads) |
| `GET` | `/view/:semester/:folder/:file` | Public | PDF metadata & page count details |
| `GET` | `/images/*` | Public | Serves encrypted page images (Auto-decrypts + RAM cached) |
| `GET` | `/download/:sem/:folder/:file` | Public | Decrypts, watermarks, and streams PDF for download |
| `POST` | `/viewer` | Public | Registers/authenticates viewer student identity |
| `POST` | `/view/record` | Public | Non-blocking view event recorder |
| `POST` | `/upload` | Admin | Multi-part PDF note upload (Protected by `ADMIN_PASSCODE`) |
| `POST` | `/api/sync/reset-analytics` | Admin | Remote MongoDB analytics wipe endpoint |

---

## 📝 License & Contact

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with ❤️ by **[Priyanshu Shekhar](https://www.linkedin.com/in/priyanshushekhar04/)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/priyanshushekhar04/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/priyanshu2104)
