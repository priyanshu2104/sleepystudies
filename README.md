# 📚 SleepyStudies

An open-source, secure, and beautiful notes repository curated for computer science students to collaborate, share guides, and score high—while keeping their sanity (and sleep!).

---

## 🏛️ Project Structure
The project is built as a unified repository containing two main folders:
* **`frontend/`**: The client interface built with **Next.js 16**, styled using **Tailwind CSS v4** and **Lucide Icons**.
* **`backend/`**: A lightweight REST API server built with **Express.js** and **Node.js** that manages note search indexes, PDF file uploads, and view/download tracking logs.

---

## 🚀 Key Features

* **🔍 Instant Search Engine**: Live-filtering of semesters, subjects, and notes with matching text highlights.
* **🔒 Secure PDF Sandbox**: Custom in-browser PDF viewer that restricts right-clicking, print commands, and downloading keys to protect study resources.
* **🛡️ Name-Gated Downloads**: Prompts readers to input their name before accessing files, registering views and downloads in real-time.
* **🏷️ Personal Watermarking**: Automatically overlays the student's name, ID, and download timestamp on PDF document pages.
* **🌓 Dark/Light Mode**: Full responsive visual support styling across all layouts.
* **📊 Analytics Dashboard**: Admin dashboard to manage notes, upload new semesters/subjects, and monitor view/download logs.

---

## 💻 Quick Start (Local Development)

### 1. Run the Backend
```bash
cd backend
npm install
npm run dev
```
The backend server runs locally on **`http://localhost:5001`**.

### 2. Run the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The Next.js client is accessible on **`http://localhost:3000`**.

---

## 🌐 Production Deployment

For details on pushing to production, please check our detailed step-by-step **[Deployment Guide](frontend/README.md)** or follow our recommendations:
* **Frontend**: Deploy on **Vercel** with the environment variable `NEXT_PUBLIC_API_URL` pointing to your backend service.
* **Backend**: Deploy on **Render** (Node Web Service) with an attached **Persistent Disk** mounted at `/opt/render/project/src/backend/data` to preserve database logs.

---

## 📝 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Curated with ♥ by **[Priyanshu Shekhar](https://www.linkedin.com/in/priyanshushekhar04/)***
