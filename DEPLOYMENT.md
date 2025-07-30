# 🚀 Deployment Guide - GitHub Pages with Custom Domain

This guide will walk you through deploying LODUCHAT to GitHub Pages with a custom domain.

## 📋 Prerequisites

- GitHub account
- Custom domain name
- Firebase project configured
- Node.js 18+ installed

## 🔧 Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `loduchat` (or your preferred name)
3. Make it public (required for GitHub Pages)
4. Don't initialize with README (we already have one)

### 1.2 Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add your remote repository
git remote add origin https://github.com/yourusername/loduchat.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: LODUCHAT PWA"

# Push to main branch
git push -u origin main
```

## 🔐 Step 2: Configure Environment Variables

### 2.1 Add Firebase Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each Firebase environment variable:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🌐 Step 3: Configure GitHub Pages

### 3.1 Enable GitHub Pages

1. Go to your repository **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

### 3.2 Update CNAME File

1. Edit `public/CNAME` file
2. Replace `yourdomain.com` with your actual domain
3. Commit and push the change

```bash
git add public/CNAME
git commit -m "Update CNAME for custom domain"
git push
```

## 🔗 Step 4: Configure Custom Domain

### 4.1 DNS Configuration

Configure your domain's DNS settings with your domain provider:

#### Option A: Apex Domain (yourdomain.com)
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

#### Option B: Subdomain (www.yourdomain.com)
```
Type: CNAME
Name: www
Value: yourusername.github.io
```

### 4.2 Add Domain to GitHub Pages

1. Go to repository **Settings** → **Pages**
2. In **Custom domain** field, enter your domain
3. Check **Enforce HTTPS**
4. Click **Save**

## 🚀 Step 5: Deploy

### 5.1 Trigger Deployment

The app will automatically deploy when you push to the main branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 5.2 Monitor Deployment

1. Go to **Actions** tab in your repository
2. Watch the deployment workflow run
3. Check for any errors in the build process

## ✅ Step 6: Verify Deployment

### 6.1 Check GitHub Pages

1. Go to **Settings** → **Pages**
2. You should see a green checkmark indicating successful deployment
3. Your site URL will be displayed

### 6.2 Test Your App

1. Visit your custom domain
2. Test all features:
   - Google Sign-In
   - Adding friends
   - Sending greetings
   - Push notifications
   - PWA installation

## 🔧 Troubleshooting

### Common Issues

#### Build Fails
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure all dependencies are in package.json

#### Domain Not Working
- Wait up to 24 hours for DNS propagation
- Verify DNS settings with your provider
- Check GitHub Pages settings

#### Firebase Errors
- Verify Firebase project is configured correctly
- Check environment variables in GitHub Secrets
- Ensure Firebase rules allow read/write access

### Debug Steps

1. **Check GitHub Actions Logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review error messages

2. **Verify Environment Variables**
   - Go to Settings → Secrets
   - Ensure all Firebase variables are set

3. **Test Locally**
   - Run `npm run build` locally
   - Check for any build errors

## 🔒 Security Considerations

### HTTPS Enforcement
- GitHub Pages automatically provides HTTPS
- Ensure "Enforce HTTPS" is checked in Pages settings

### Firebase Security Rules
- Review and update Firestore security rules
- Ensure proper user authentication
- Set up proper CORS policies

## 📊 Monitoring

### Performance Monitoring
- Use Google PageSpeed Insights
- Monitor Core Web Vitals
- Check PWA metrics

### Error Monitoring
- Set up Firebase Crashlytics
- Monitor console errors
- Track user feedback

## 🔄 Continuous Deployment

The GitHub Actions workflow will automatically:
- Build the app on every push to main
- Run tests (if configured)
- Deploy to GitHub Pages
- Update the live site

## 📱 PWA Verification

After deployment, verify PWA features:
1. **Installability**: Should show install prompt
2. **Offline Functionality**: App should work offline
3. **Push Notifications**: Should request permission
4. **App-like Experience**: Should feel like a native app

## 🎉 Success!

Your LODUCHAT app is now live at your custom domain! 

- **URL**: https://yourdomain.com
- **PWA**: Installable on all devices
- **Real-time**: Firebase-powered backend
- **Notifications**: Push notifications working

## 📞 Support

If you encounter issues:
1. Check this deployment guide
2. Review GitHub Actions logs
3. Verify Firebase configuration
4. Test locally first

---

**Note**: This deployment process creates a production-ready, scalable PWA that can handle real users and traffic. 