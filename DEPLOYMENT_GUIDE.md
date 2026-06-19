# CustomHub — Complete Deployment Guide

## What's fully done
- Next.js storefront (home, products, categories, cart, checkout, account, orders)
- Express backend with Prisma/PostgreSQL
- JWT auth + refresh token rotation
- Google Sign-In (Authorization Code flow)
- Razorpay payment with signature verification
- Razorpay webhook (handles browser-close edge case)
- Forgot password / reset password with email
- Admin panel — products, categories, orders
- Customization studio with Fabric.js canvas (text, images, layers, undo/redo, export)
- Health check endpoint
- Rate limiting + brute-force protection

---

## Step 1 — Set up database (Neon — free tier)

1. Go to https://neon.tech → Sign up → New Project → name it "customhub"
2. Copy the connection string — looks like:
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
3. Paste it as DATABASE_URL in backend/.env

---

## Step 2 — Set up image uploads (Cloudinary — free tier)

1. Go to https://cloudinary.com → Sign up → Dashboard
2. Copy the "API Environment variable" — looks like:
   cloudinary://123456789012345:xxxxxxxxxxxxxxxxxxxxx@your-cloud-name
3. Paste it as CLOUDINARY_URL in backend/.env

---

## Step 3 — Set up password reset emails (Resend — free tier)

1. Go to https://resend.com → Sign up → API Keys → Create key
2. In backend/.env set:
   SMTP_HOST=smtp.resend.com
   SMTP_USER=resend
   SMTP_PASS=re_your_api_key_here
   SMTP_FROM=CustomHub <no-reply@yourdomain.com>

---

## Step 4 — Add Razorpay keys

1. Go to https://dashboard.razorpay.com → Settings → API Keys → Generate key
2. In backend/.env set:
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

   (Use rzp_test_ keys for testing first)

---

## Step 5 — Deploy backend to Render (free tier available)

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo (push the backend/ folder first)
3. Settings:
   - Build command:  npm install && npm run build && npx prisma migrate deploy && npx prisma db seed
   - Start command:  npm start
   - Environment:    Node
4. Add ALL environment variables from backend/.env into Render's "Environment" tab
   (Do NOT upload the .env file — type each key-value manually)
5. After deploy, copy your Render URL e.g. https://customhub-api.onrender.com

---

## Step 6 — Update Google OAuth for production

1. Go to https://console.cloud.google.com → Your project → APIs & Services → Credentials
2. Click your OAuth client → Edit
3. Under "Authorised JavaScript origins" add:
   https://yourcustomhubdomain.vercel.app
4. Under "Authorised redirect URIs" add:
   https://yourcustomhubdomain.vercel.app/auth/google/callback
5. Save

---

## Step 7 — Deploy frontend to Vercel (free tier)

1. Go to https://vercel.com → New Project → Import your repo
2. Framework preset: Next.js (auto-detected)
3. Add these environment variables in Vercel dashboard:
   NEXT_PUBLIC_API_URL=https://customhub-api.onrender.com/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://yourcustomhubdomain.vercel.app/auth/google/callback
4. Deploy → copy your Vercel URL

---

## Step 8 — Update backend FRONTEND_ORIGIN

In Render environment variables, update:
   FRONTEND_ORIGIN=https://yourcustomhubdomain.vercel.app
   GOOGLE_REDIRECT_URI=https://yourcustomhubdomain.vercel.app/auth/google/callback

Then redeploy backend.

---

## Step 9 — Add Razorpay webhook in Razorpay dashboard

1. Razorpay Dashboard → Settings → Webhooks → Add new webhook
2. URL: https://customhub-api.onrender.com/api/webhook/razorpay
3. Secret: your RAZORPAY_KEY_SECRET
4. Events: check "payment.captured"

---

## Complete backend/.env reference

```
NODE_ENV=production
PORT=5001

DATABASE_URL=postgresql://...   ← from Neon
FRONTEND_ORIGIN=https://yourcustomhubdomain.vercel.app

JWT_ACCESS_SECRET=              ← already set (64 char hex)
JWT_REFRESH_SECRET=             ← already set (64 char hex)
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30

COOKIE_SECRET=                  ← already set (64 char hex)

GOOGLE_CLIENT_ID=               ← from Google Cloud Console
GOOGLE_CLIENT_SECRET=           ← from Google Cloud Console
GOOGLE_REDIRECT_URI=https://yourcustomhubdomain.vercel.app/auth/google/callback

RAZORPAY_KEY_ID=rzp_live_xxx    ← from Razorpay dashboard
RAZORPAY_KEY_SECRET=xxx         ← from Razorpay dashboard

CLOUDINARY_URL=cloudinary://...  ← from Cloudinary dashboard

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_xxx                ← from Resend dashboard
SMTP_FROM=CustomHub <no-reply@yourdomain.com>

ADMIN_EMAIL=admin@customhub.in
ADMIN_PASSWORD=Admin@CustomHub2025
ADMIN_NAME=CustomHub Admin

RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=120
```

## Complete frontend env (set in Vercel dashboard)

```
NEXT_PUBLIC_API_URL=https://customhub-api.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://yourcustomhubdomain.vercel.app/auth/google/callback
```

---

## Admin panel

URL: https://yourcustomhubdomain.vercel.app/admin/login
Email: admin@customhub.in
Password: Admin@CustomHub2025

---

## Remaining nice-to-haves (not blocking launch)

- Product images — upload via admin panel once deployed
- More product variants — add via admin panel
- Invoice/receipt emails after order
- Inventory tracking table
- Customer list in admin
