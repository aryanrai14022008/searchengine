# 🍫 HumblBar — Full-Stack Next.js Protein Bar Platform

Clean fuel for the body. Wholesome hope for a child. 

This repository contains the complete full-stack website, interactive MCQ Snack DNA quiz, lead capture engine, and client-friendly Admin Portal ready for one-click deployment on **Vercel** with **MongoDB Atlas** support.

---

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React 18 + Handcrafted Organic Design System + Lucide Icons + Canvas Confetti
- **Backend API Routes**: Next.js API endpoints (`/api/quiz`, `/api/contact`, `/api/responses`, `/api/auth/login`)
- **Database**: MongoDB Atlas with zero-config local memory fallback
- **Admin Panel**: Client dashboard with KPI statistics, search & filter, quiz response inspector, one-click CSV export, and delete capabilities
- **Deployment**: Optimized for Vercel

---

## 🚀 Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Access Admin Panel**:
   - Go to: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Default Password: `admin123` (or customize in `.env.local`)

---

## 🌿 MongoDB Atlas Setup (Optional)

The application works immediately out-of-the-box with built-in fallback storage. To connect to your live MongoDB Atlas cluster:

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/humblbar?retryWrites=true&w=majority`).
3. Add it to your `.env.local` or Vercel Environment Variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   ADMIN_PASSWORD=your_custom_admin_password
   ADMIN_EMAIL=admin@humblbar.com
   JWT_SECRET=your_jwt_secret_key
   ```

---

## ⚡ 1-Click Vercel Deployment

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/new) and import the repository.
3. In the **Environment Variables** section on Vercel, add:
   - `MONGODB_URI`: (Your MongoDB Atlas connection URI)
   - `ADMIN_PASSWORD`: (Your desired password for `/admin`)
4. Click **Deploy**! 🚀
