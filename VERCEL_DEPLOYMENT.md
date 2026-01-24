# Vercel Deployment Guide

## Prerequisites
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free at vercel.com)
- Firebase project with Admin SDK credentials
- Paystack account (for payment processing)

## Steps to Deploy

### 1. Push Code to Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables

Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

#### Required Firebase Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAx76XZFjtjDP7j-xLizSs9sTV_kmF3Imk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=e-commerce-936b5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=e-commerce-936b5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=e-commerce-936b5.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=84391388232
NEXT_PUBLIC_FIREBASE_APP_ID=1:84391388232:web:cbf2ca7870f51bd522e47d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-LLSFPMWG37
```

#### Firebase Admin SDK (CRITICAL):
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"..."}
```

**How to get Firebase Service Account:**
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. Convert to single-line JSON (remove newlines)
6. Paste as environment variable value

#### Paystack Payment Gateway:
```
# Your LIVE public key, found on your Paystack dashboard
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_6bbc0748e29c8a0c417755ac0fa27df8878044b0
# Your LIVE secret key, found on your Paystack dashboard
PAYSTACK_SECRET_KEY=sk_live_4b3012bce08e31c9d730a9c36a20fdd48edc2ca0
```

### 4. Deploy
Click "Deploy" - Vercel will:
- Install dependencies automatically
- Build your Next.js app
- Deploy to production

### 5. Configure Firebase (If needed)
Add your Vercel domain to Firebase:
1. Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"

## Build Configuration

The app uses these settings (already configured):
- **Framework**: Next.js 15
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Common Issues

### Build Errors
- **TypeScript errors**: Currently set to ignore (see next.config.ts)
- **ESLint errors**: Currently set to ignore (see next.config.ts)

### Authentication Not Working
- Verify all Firebase environment variables are set
- Ensure FIREBASE_SERVICE_ACCOUNT is properly formatted (single-line JSON)
- Add Vercel domain to Firebase authorized domains

### Payments Not Working
- Verify both `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` are set correctly.

### Images Not Loading
- External image domains are configured in next.config.ts
- Supported: placehold.co, images.unsplash.com, picsum.photos

## Post-Deployment Checklist
- [ ] Test user registration
- [ ] Test user login
- [ ] Test logout functionality
- [ ] Verify account pages require authentication
- [ ] Test admin/seller login flows
- [ ] Check Firebase Firestore security rules
- [ ] Test the checkout and payment flow

## Updating After Deployment
Simply push changes to your Git repository:
```bash
git add .
git commit -m "Update description"
git push
```
Vercel will automatically rebuild and deploy.

## Support
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Firebase Docs: https://firebase.google.com/docs
- Paystack Docs: https://paystack.com/docs
