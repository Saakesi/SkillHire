# 🚀 SkillHire

<p align="center">
  <h3 align="center">Hire by proof, not guesswork</h3>
  <p align="center">
    Transforming real GitHub activity into powerful hiring signals
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FullStack-MERN-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Queue-BullMQ-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Cache-Redis-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20OAuth-purple?style=for-the-badge"/>
</p>

---

## 🌐 Live Demo

| Platform | Link |
|--------|------|
| 🚀 Frontend | https://your-frontend.vercel.app |
| ⚙️ Backend API | https://your-backend.vercel.app |

---

## 📸 Preview

> *(Add screenshots here — extremely important for recruiters)*

### 🏠 Homepage
![Homepage](https://via.placeholder.com/1200x600?text=Homepage+Preview)

### 📊 Dashboard
![Dashboard](https://via.placeholder.com/1200x600?text=Dashboard+Preview)

### 🔍 Recruiter Search
![Search](https://via.placeholder.com/1200x600?text=Search+Preview)

---

## 📌 Overview

SkillHire is a **full-stack developer discovery and evaluation platform** that converts real-world coding activity into structured hiring insights.

💡 Built to eliminate resume bias and highlight **actual engineering ability**.

---

## 🎯 Problem → Solution

### ❌ Problem
- Resumes don’t reflect real skills  
- Recruiters rely on keywords  
- No standardized evaluation  

### ✅ Solution
SkillHire:
- Analyzes GitHub repositories  
- Extracts meaningful engineering signals  
- Generates a **SkillHire Score**  
- Enables **data-driven hiring decisions**  

---

## ✨ Key Features

### 👨‍💻 Developer Experience
- GitHub OAuth authentication  
- Profile enrichment (college, skills, LeetCode)  
- Async repository analysis  
- Detailed score breakdown  
- Public developer profiles  
- Leaderboards (global + category)  

---

### 🧑‍💼 Recruiter Experience
- OTP-based secure authentication  
- Advanced filtering system:
  - Skills, score range  
  - College, branch, batch  
  - Developer type  
- Smart search & ranking  
- Shortlist pipelines  
- Recruiter analytics dashboard  

---

### ⚙️ Platform Capabilities
- JWT auth with HttpOnly cookies  
- Redis caching layer  
- BullMQ async job processing  
- Scalable worker architecture  
- Category-based ranking system  

---

## 🧠 System Architecture

```text
            ┌──────────────┐
            │   Frontend   │ (React + Vite)
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │   Backend    │ (Node + Express)
            └──────┬───────┘
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
 MongoDB        Redis        BullMQ Queue
 (Database)    (Cache)        (Jobs)
                                  │
                                  ▼
                           Worker Process
                        (GitHub Analysis Engine)
```
---
## 📊 How It Works
1. User triggers analysis
2. Job queued via BullMQ
3. Worker fetches GitHub data
4. Metrics computed:
   - Languages
   - Activity
   - Collaboration
5. Score generated
6. Stored in MongoDB
7. Cached via Redis
---
## 🛠 Tech Stack
### 🎨 Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
### ⚙️ Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis + ioredis
- BullMQ
- JWT + cookie-parser
- GitHub API
- Nodemailer
---
## 📂 Project Structure
```text
SkillHire/
  ├── backend/
  │   ├── src/
  │   │   ├── controllers/
  │   │   ├── routes/
  │   │   ├── services/
  │   │   ├── workers/
  │   │   ├── jobs/
  │   │   └── models/
  │
  ├── frontend/
  │   └── src/
  │       ├── pages/
  │       ├── components/
  │       ├── context/
  │       └── services/
```
---
## ⚙️ Setup Guide
### 🔧 Prerequisites
- Node.js (18+)
- MongoDB
- Redis
- GitHub OAuth credentials
- SMTP credentials
📦 Installation
### Backend
```text
cd backend
npm install
```

### Frontend
```text
cd ../frontend
npm install
```
---
## ▶️ Run Locally
### Backend
```text
npm run dev
```

### Worker
```text
npm run worker
```

### Frontend
```text
npm run dev
```
---
## 🔐 Environment Variables

### Backend
```text
MONGO_URI=
JWT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```
### Frontend
```text
VITE_API_URL=http://localhost:5000
```
## 🔗 API Modules

| Module     | Description              |
|-----------|--------------------------|
| Auth      | GitHub OAuth + JWT       |
| Profile   | Developer profiles       |
| Analyze   | GitHub scoring           |
| Ranking   | Leaderboards             |
| Recruiter | Search + shortlist       |

---

## 🧪 Troubleshooting

- ❌ Backend not starting → Check MongoDB & `.env`  
- ❌ OAuth failing → Verify GitHub credentials  
- ❌ Emails not sending → Check SMTP config  
- ❌ Analysis stuck → Ensure worker + Redis running  

---

## 🌟 Future Enhancements

- 🤖 ML-based scoring model  
- 🧠 Better repo quality heuristics  
- 🔔 Real-time notifications  
- 📱 Mobile optimization  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to open an issue or submit a PR 🚀


<p align="center"> Built with ❤️ to make hiring smarter </p>
