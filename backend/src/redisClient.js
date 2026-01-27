import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

// Redis connection
export const connection = new IORedis("redis://127.0.0.1:6379");

// Function to create a queue
export const createQueue = (name) => new Queue(name, { connection });

// Helper to create a worker
export const createWorker = (name, processor) => new Worker(name, processor, { connection });

/*
A project that:

pulls data from GitHub’s API

processes and analyzes that data

exposes meaningful metrics

has a backend API that serves dashboards or insights

…ticks many boxes employers and recruiters care about:

🎯 Core backend skills demonstrated

✔ API design (REST endpoints)
✔ Data fetching & integration with external APIs (GitHub)
✔ Data processing and transformation
✔ Caching, rate-limit handling, retries
✔ Authentication / API key management
✔ Database design (if you store anything)
✔ Security basics
✔ Deployment backend services

These are real backend responsibilities, not just UI fluff.

⭐ What makes it especially strong

Compared to basic CRUD apps, this project shows:

🧠 Real-world complexity

You’re dealing with rate limits

You must handle external API errors

You must parse and normalise real unstructured data

You build automation, not just static pages

These are exactly the kinds of problems backend engineers solve at work.

⚙️ Practical API design

If you build:

GET /users/:username  
GET /users/:username/skills
GET /users/:username/activity
GET /leaderboard


…you’re showing you can design usable, documented APIs.

⚠️ BUT — here’s the truth recruiters really think

A project’s name or theme means little — what matters is:

📌 Did you show:

✔ Backend architecture
✔ Clean code
✔ Tests
✔ Documentation
✔ Deployment
✔ Performance considerations
✔ Security basics

If your project is “just a dashboard” with minimal backend logic, it looks like a frontend project with a tiny backend. That’s not as impressive.

👍 How to make it very strong

Add backend-centric features:

✅ Logging

Track successful/failed fetches, cache hits, errors.

✅ Caching layer

Use Redis/memory cache to avoid hitting GitHub limits.

✅ Database

Store:

GitHub snapshots

Computed metrics

User preferences

✅ Queues / Workers

If you’re analyzing big data, use a queue system (RabbitMQ, Redis Streams) to process large jobs in the background.

✅ Auth system

If you want users to log in and save profiles, add JWT, token-based auth, refresh flow.

✅ Tests

Unit tests + integration tests for API endpoints.

✅ CI/CD

Deploy with GitHub Actions.

🔥 Documentation

Swagger/OpenAPI spec + README explaining API & design decisions.

📌 What recruiters actually look for

When reviewing backend candidates, they ask:

“Can you design scalable, reliable APIs that handle real data?”

Your project answers this if:

You built non-trivial logic

You handled real external systems (GitHub API)

You documented your design

You deployed it publicly

🧠 What would hurt its impact

❌ Just showing numbers in a dashboard
❌ Hardcoded data
❌ No caching / poor rate-limit handling
❌ No tests
❌ No explanation of architectural choices

🏆 Final honest assessment

💯 Yes — a GitHub-based hiring project can be a strong backend project

But only if:
➡ You design a real API
➡ You handle real backend challenges
➡ You document + test + deploy

If it ends up being mostly frontend, it will look like frontend work — recruiters will assume you didn’t do backend heavy lifting.
*/