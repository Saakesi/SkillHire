# SkillHire

<p align="center">
  <h3 align="center">Hire Developers Based on Real Code, 
  Not Just Resumes</h3>
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
https://skillhire.tech

---

## 🚀 Deployment

- Frontend deployed on Vercel  
- Backend deployed on Render  
- Redis managed on Upstash  
- Custom domain configured through Cloudflare DNS  

---

## 📸 Preview


### 🏠 Homepage
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a4635b5b-fd4a-44a1-af1d-b8c5dbf697f3" />



### 📊 Dashboard
<img width="1920" height="1080" alt="Screenshot 2026-04-15 011813" src="https://github.com/user-attachments/assets/54b007e4-b479-4aaf-84a8-00c2d4beed14" />


### 🔍 Recruiter Search
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/948d8207-8b0c-4721-b66c-d59b8701876e" />


---

## 📌 Overview

SkillHire is a **full-stack developer discovery and evaluation platform** that converts real-world coding activity into structured hiring insights.

💡 Built to eliminate resume bias and highlight **actual engineering ability**.

Recruiters can filter developers by skills, activity, and performance signals—making hiring faster and more data-driven.

Curious how these insights are generated?  
Take a look under the hood and explore the engineering behind SkillHire:  
👉 https://www.skillhire.tech/engineering

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
- OTP emails sent using Gmail API (OAuth2)  
- Advanced filtering system:
  - Skills, score range  
  - College, branch, batch  
  - Developer type  
- Smart search & ranking  
- Shortlist pipelines  
- Recruiter analytics dashboard  

---

### 🤝 Networking Experience
- Referral workflows for users open to referrals  
- Connection requests with accept/decline flows  
- Realtime messaging for accepted connections and accepted referrals  

---

### ⚙️ Platform Capabilities
- JWT auth with HttpOnly cookies  
- Redis caching layer  
- BullMQ async job processing  
- Scalable worker architecture  
- Gmail API email delivery for OTPs  
- College verification workflow for students  
- Socket.IO rooms for realtime messages  
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
- Gmail API + Nodemailer (OAuth2)
- Socket.IO
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
- Gmail OAuth credentials
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

GMAIL_USER=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_REDIRECT_URI=
```
### Frontend
```text
VITE_API_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```
## 🔗 API Modules

| Module     | Description              |
|-----------|--------------------------|
| Auth      | GitHub OAuth + JWT       |
| Profile   | Developer profiles       |
| Analyze   | GitHub scoring           |
| Ranking   | Leaderboards             |
| Recruiter | Search + shortlist       |
| Connections | Request, accept, decline, and remove connections |
| Referrals  | Referral requests and approvals |
| Messages   | Realtime 1:1 messaging and inbox |
| College Verification | Student college email verification |

---

## 🧪 Troubleshooting

- ❌ Backend not starting → Check MongoDB & `.env`  
- ❌ OAuth failing → Verify GitHub credentials  
- ❌ Emails not sending → Check Gmail OAuth config  
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
