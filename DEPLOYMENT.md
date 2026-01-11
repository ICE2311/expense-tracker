# Vercel Deployment Guide for Expense Tracker

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **NeonDB Account** - For production PostgreSQL database

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
cd /home/icys/Documents/expense-tracker
git init
git add .
git commit -m "Initial commit - Expense Tracker"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `expense-tracker` (or any name you prefer)
3. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git branch -M main
git push -u origin main
```

## Step 2: Setup Production Database (NeonDB)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project (or use existing)
3. Copy the connection string - it looks like:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this handy for Vercel environment variables

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `expense-tracker` repository
4. Click "Import"

### 3.2 Configure Project

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

### 3.3 Add Environment Variables

Click "Environment Variables" and add these:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgresql://user:password@...` | Your NeonDB connection string |
| `NEXTAUTH_SECRET` | Generate a random 32+ char string | Use: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Will be provided after first deploy |

**Important:** Add these to **all environments** (Production, Preview, Development)

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll get a URL like `https://expense-tracker-xyz.vercel.app`

## Step 4: Run Database Migrations

After first deployment, you need to run migrations:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Using Prisma Studio

1. Install Prisma CLI locally: `npm install -g prisma`
2. Set your production DATABASE_URL in terminal:
   ```bash
   export DATABASE_URL="your-production-database-url"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Step 5: Update NEXTAUTH_URL

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (Vercel → Deployments → click "..." → Redeploy)

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account or login with demo account
3. Test all features:
   - Add transactions
   - View analytics
   - Export CSV
   - Mobile responsiveness

## Automatic Deployments

Now every time you push to GitHub:
- **main branch** → Production deployment
- **other branches** → Preview deployments

## Common Issues & Solutions

### Issue: "Prisma Client not found"
**Solution:** Vercel should auto-run `prisma generate`. If not, add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: Database connection fails
**Solution:** 
- Verify DATABASE_URL is correct
- Ensure it includes `?sslmode=require`
- Check NeonDB project is active

### Issue: NextAuth errors
**Solution:**
- Verify NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Redeploy after changing env vars

### Issue: Build fails
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

## Monitoring & Logs

- **Logs:** Vercel Dashboard → Your Project → Logs
- **Analytics:** Vercel Dashboard → Your Project → Analytics
- **Database:** NeonDB Dashboard → Your Project → Monitoring

## Security Checklist

- ✅ NEXTAUTH_SECRET is strong and random
- ✅ DATABASE_URL is kept secret
- ✅ HTTPS is enabled (automatic on Vercel)
- ✅ Environment variables are not committed to Git
- ✅ Database has proper access controls

## Quick Deploy Commands

```bash
# Deploy to production
git add .
git commit -m "Your changes"
git push origin main

# Create preview deployment
git checkout -b feature/new-feature
git push origin feature/new-feature
```

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **NeonDB Docs:** [neon.tech/docs](https://neon.tech/docs)

---

**Your app is now live! 🎉**

Share your Vercel URL and start tracking expenses in production!
