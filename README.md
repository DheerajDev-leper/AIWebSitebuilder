<div align="center">

# Site<span>Nova</span>

### AI-powered website builder that turns ideas into live websites.

**Describe your business in a few sentences. SiteNova generates a responsive website, lets you refine it through AI chat, edit the code manually, and publish it to a shareable URL.**

[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🚀 Overview

**SiteNova** is an AI-powered website builder designed to make website creation fast and accessible.

Instead of manually writing a website from scratch, users can describe what they want in natural language. SiteNova generates the required **HTML, CSS, and JavaScript**, renders the result in a live preview, and allows users to continue refining the website through an AI-powered chat interface.

Users can also open the generated source code, make manual changes, save their edits, and publish the finished website to a public URL.

### What SiteNova can do

- 🪄 Generate websites from natural-language prompts
- 💬 Modify websites using AI chat
- 🖥️ Preview websites instantly
- 📱 Test responsive desktop and mobile layouts
- 💻 Edit generated code manually
- 🚀 Publish websites to shareable URLs
- 🔐 Authenticate users with Google
- 💳 Manage generation credits
- 🛠️ Detect and recover from broken AI-generated code

---

## ✨ Features

### 🤖 Prompt-to-Website

Describe the website you want and the AI generates a complete responsive webpage.

> Example:  
> `Create a modern landing page for a fitness startup with pricing, testimonials and a contact section.`

### 💬 AI Chat Editing

Continue improving your website without manually rewriting the code.

Examples:

- "Make the hero section more modern."
- "Change the color scheme to dark blue."
- "Add a testimonials section."
- "Make the website mobile responsive."

### 👀 Live Preview

Preview generated websites instantly with dedicated:

- Desktop preview
- Mobile preview
- Sandboxed rendering

### 🧑‍💻 Code Editor

Open the generated source code in an integrated editor, make manual changes, and save them directly to your project.

### 🚀 One-Click Publishing

Publish completed websites to a public URL.

Published websites are served as real HTML with SEO metadata, allowing search engines to crawl the generated content.

### 💰 Credit System

Website generation and AI-powered editing consume credits.

Different plans can provide different credit allowances.

### 🔐 Google Authentication

Users can sign in with Google using Firebase Authentication.

Firebase ID tokens are verified securely on the backend before authenticated requests are processed.

### 🛡️ Self-Healing AI Output

Generated code is validated before being saved.

If the generated JavaScript is broken:

1. The server detects the failure.
2. The AI is asked to regenerate the output.
3. The generated code is validated again.
4. If generation still fails, the user's credits are refunded.

This helps prevent broken websites from being saved as final output.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Redux Toolkit, Motion, Monaco Editor |
| **Backend** | Node.js, Express |
| **Database** | MongoDB, Mongoose |
| **Authentication** | Firebase Authentication + Firebase Admin |
| **AI** | OpenRouter with multiple fallback models |
| **Payments** | Razorpay API |
| **Deployment** | Public website publishing through Express |

---

## 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      Browser     │
                         │   React + Vite   │
                         └────────┬─────────┘
                                  │
                           Google Sign-In
                                  │
                         ┌────────▼─────────┐
                         │ Firebase Auth    │
                         └──────────────────┘

                                  │
                            /api/* requests
                                  │
                         ┌────────▼─────────┐
                         │   Express API    │
                         │     Backend      │
                         └──────┬─────┬──────┘
                                │     │
                     ┌──────────┘     └──────────┐
                     │                           │
              ┌──────▼──────┐             ┌──────▼──────┐
              │   MongoDB   │             │  OpenRouter │
              │   Database  │             │  AI Models  │
              └─────────────┘             └─────────────┘
                                                    │
                                             Generated HTML
                                                    │
                                             Validate → Retry
                                                    │
                                                    ▼
                                            Saved Website
                                                    │
                                                    ▼
                                    ┌────────────────────────┐
                                    │  /site/:slug           │
                                    │  Public Published Site │
                                    └────────────────────────┘
```

---

## 📁 Project Structure

```text
AIWebSitebuilder/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── hooks/
│   └── ...
│
├── server/
│   ├── config/
│   │   ├── database
│   │   └── OpenRouter client
│   │
│   ├── controllers/
│   │   ├── auth
│   │   ├── user
│   │   ├── website
│   │   └── payments
│   │
│   ├── middleware/
│   │   └── authentication
│   │
│   ├── models/
│   │   ├── User
│   │   ├── Website
│   │   └── Payment
│   │
│   ├── routes/
│   │   ├── auth
│   │   ├── user
│   │   └── website
│   │
│   ├── utils/
│   │   ├── HTML extraction
│   │   └── validation
│   │
│   └── index.js
│
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Getting Started

### Requirements

Before running SiteNova locally, make sure you have:

- Node.js **20+**
- MongoDB or MongoDB Atlas
- Firebase project
- Google Authentication enabled in Firebase
- OpenRouter API key

### 1. Clone the repository

```bash
git clone https://github.com/DheerajDev-leper/AIWebSitebuilder.git

cd AIWebSitebuilder
```

### 2. Configure the server

```bash
cd server

npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Fill in the required environment variables and start the server:

```bash
npm run dev
```

Or:

```bash
npx nodemon index.js
```

### 3. Configure the client

Open another terminal:

```bash
cd client

npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Then start the Vite development server:

```bash
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

### Server

See:

```text
server/.env.example
```

Important variables include:

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign session cookies |
| `CLIENT_URL` | Frontend URL used for CORS and CSRF protection |
| `OPENROUTER_API_KEY` | OpenRouter API access |
| `FIREBASE_PROJECT_ID` | Firebase project used for authentication |
| `ALLOW_DEMO_CREDITS` | Enables development-only demo credits |

> ⚠️ Never commit your `.env` files or API keys to GitHub.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/google` | Authenticate using Firebase Google sign-in |
| `GET` | `/api/user/me` | Get the currently authenticated user |
| `POST` | `/api/website/generate` | Generate a new website |
| `POST` | `/api/website/update/:id` | Modify an existing website using AI |
| `PUT` | `/api/website/save/:id` | Save manually edited code |
| `GET` | `/api/website/get-all` | Get the user's websites |
| `GET` | `/api/website/deploy/:id` | Publish a website |
| `GET` | `/site/:slug` | Access a published website |

---

## 🔄 Website Generation Flow

```text
User enters prompt
        ↓
Frontend sends request
        ↓
Express API
        ↓
OpenRouter AI model
        ↓
Generate HTML/CSS/JS
        ↓
Extract generated code
        ↓
Validate JavaScript
        ↓
      Valid?
      /    \
    Yes     No
     │       │
     │    Retry with AI
     │       │
     │    Validate again
     │       │
     └───────┴───────┐
                     ↓
              Save Website
                     ↓
              Live Preview
                     ↓
                Publish
                     ↓
            /site/:slug
```

---

## 💳 Payments

Razorpay integration is currently implemented at the API level for:

- Creating payment orders
- Verifying payments
- Handling webhooks

The payment checkout is **not yet connected to the frontend pricing interface**.


---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

For larger changes, please open an issue first to discuss the proposed changes.

---


<div align="center">

### Built with React, Node.js, MongoDB and AI

**SiteNova — Turn an idea into a website.**

</div>