# CustomHub — How to Run Locally

## Why you saw "fetch failed"
The frontend has pages that load products/categories from the backend at render time.
If the backend isn't running when you open the site, those pages crash.
This is now fixed — pages return empty results gracefully when the backend is offline,
and a banner appears at the bottom of the screen with instructions to start it.

---

## Step 1 — Start the database

```bash
docker compose up -d
```

(Requires Docker Desktop. Starts PostgreSQL on port 5432.)

---

## Step 2 — Start the backend

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Backend runs at: **http://localhost:5001**
Health check: **http://localhost:5001/api/health**

---

## Step 3 — Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

> ⚠️  Always open the app at **http://localhost:3000** — never via 192.168.x.x.
> Google Sign-In will not work over a private IP address.

---

## Admin login

| Field    | Value                          |
|----------|-------------------------------|
| URL      | http://localhost:3000/admin/login |
| Email    | admin@customhub.in            |
| Password | Admin@CustomHub2025           |

---

## Environment variables to fill in

Edit `backend/.env`:

```
RAZORPAY_KEY_ID=      ← from Razorpay dashboard
RAZORPAY_KEY_SECRET=  ← from Razorpay dashboard
CLOUDINARY_URL=       ← from Cloudinary console (for image uploads)
SMTP_HOST=smtp.resend.com    ← for password reset emails
SMTP_USER=resend
SMTP_PASS=re_your_key
```

Everything else is already configured for local development.
